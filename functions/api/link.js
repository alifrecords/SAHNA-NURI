// 💡 CUE-LINK — Sahna Ovozi → Sahna Nuri signal ko'prigi (online xona kodi orqali).
// Sahna Ovozi cue GO bo'lganda POST qiladi, Sahna Nuri "long-poll" bilan kutib turadi.
//   POST /api/link            body: {room:"K7M2QX", msg:{t:"cue", ref:"5", src:"Q3 · Portlash", id:"..."}}
//   GET  /api/link?room=..&after=ID          — Sahna Nuri (8 soniyagacha kutadi, yangi signal kelsa darhol qaytadi; after=-1 — boshlash)
//   GET  /api/link?room=..&who=ovozi         — Sahna Ovozi: "Sahna Nuri onlaynmi?" holati
// Jadvallar sn_ bilan boshlanadi; eski signallar 10 daqiqadan keyin o'chiriladi.
import { json } from "./_db.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
const ROOM_RE = /^[A-Z0-9]{6}$/;
const WAIT_MS = 8000, STEP_MS = 200, FRESH_MS = 15000;
const out = (d, s = 200) => json(d, s, CORS);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ready = false;
async function schema(db) {
  if (ready) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS sn_link (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL, msg TEXT NOT NULL, ts INTEGER)"),
    db.prepare("CREATE INDEX IF NOT EXISTS sn_link_room ON sn_link(room, id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS sn_link_seen (room TEXT PRIMARY KEY, nuri INTEGER, ovozi INTEGER)"),
  ]);
  ready = true;
}
async function seen(db, room, who, now) {
  await db.prepare(`INSERT INTO sn_link_seen (room, ${who}) VALUES (?, ?) ON CONFLICT(room) DO UPDATE SET ${who} = excluded.${who}`).bind(room, now).run();
}
async function ages(db, room, now) {
  const r = await db.prepare("SELECT nuri, ovozi FROM sn_link_seen WHERE room = ?").bind(room).first();
  return { nuriAge: r && r.nuri ? now - r.nuri : null, ovoziAge: r && r.ovozi ? now - r.ovozi : null };
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.DB) return out({ error: "nodb" }, 503);
    await schema(env.DB);
    const t = await request.text();
    if (t.length > 2000) return out({ error: "big" }, 413);
    let b; try { b = JSON.parse(t || "{}"); } catch { return out({ error: "bad" }, 400); }
    const room = String(b.room || "").toUpperCase();
    if (!ROOM_RE.test(room) || !b.msg || typeof b.msg !== "object") return out({ error: "room" }, 400);
    const m = b.msg, now = Date.now();
    const msg = JSON.stringify({
      t: String(m.t || "cue").slice(0, 10), ref: String(m.ref || "").slice(0, 60), src: String(m.src || "").slice(0, 80),
      id: String(m.id || "").slice(0, 40), ts: now,
    });
    await env.DB.batch([
      env.DB.prepare("INSERT INTO sn_link (room, msg, ts) VALUES (?, ?, ?)").bind(room, msg, now),
      env.DB.prepare("INSERT INTO sn_link_seen (room, ovozi) VALUES (?, ?) ON CONFLICT(room) DO UPDATE SET ovozi = excluded.ovozi").bind(room, now),
    ]);
    if (Math.random() < 0.05) await env.DB.prepare("DELETE FROM sn_link WHERE ts < ?").bind(now - 600000).run();
    return out({ ok: true, ...(await ages(env.DB, room, now)) });
  } catch (e) {
    return out({ error: "server", msg: String((e && e.message) || e).slice(0, 200) }, 500);
  }
};

export const onRequestGet = async ({ request, env }) => {
  try {
    if (!env.DB) return out({ error: "nodb" }, 503);
    await schema(env.DB);
    const u = new URL(request.url);
    const room = String(u.searchParams.get("room") || "").toUpperCase();
    if (!ROOM_RE.test(room)) return out({ error: "room" }, 400);
    let now = Date.now();
    if (u.searchParams.get("who") === "ovozi") {
      await seen(env.DB, room, "ovozi", now);
      return out(await ages(env.DB, room, now));
    }
    await seen(env.DB, room, "nuri", now);
    const after = parseInt(u.searchParams.get("after") ?? "-1", 10);
    if (!(after >= 0)) {
      // birinchi so'rov: eski signallar qayta ijro etilmasin — faqat oxirgi raqam qaytadi
      const r = await env.DB.prepare("SELECT MAX(id) AS last FROM sn_link").first();
      return out({ last: (r && r.last) || 0, msgs: [], ...(await ages(env.DB, room, now)) });
    }
    const q = env.DB.prepare("SELECT id, msg, ts FROM sn_link WHERE room = ? AND id > ? ORDER BY id LIMIT 20");
    const end = now + WAIT_MS;
    let rows = [];
    while (true) {
      rows = (await q.bind(room, after).all()).results || [];
      now = Date.now();
      if (rows.length || now >= end) break;
      await sleep(STEP_MS);
    }
    const last = rows.length ? rows[rows.length - 1].id : after;
    const msgs = rows.filter((r) => now - r.ts < FRESH_MS).map((r) => r.msg);
    return out({ last, msgs, ...(await ages(env.DB, room, now)) });
  } catch (e) {
    return out({ error: "server", msg: String((e && e.message) || e).slice(0, 200) }, 500);
  }
};
