// Ochiq: foydalanuvchi ↔ admin yozishmasi (savol, fikr, taklif) — Sahna Ovozi bilan bir xil.
// GET  /api/msg?deviceId=…                         → {msgs, unread}
// POST /api/msg {deviceId, text, name, kind}       → xabar (bot ulangan bo'lsa — adminga Telegram'da ham)
// POST /api/msg {deviceId, action:'read'}          → admin javoblari o'qildi
// deviceId — dasturning maxfiy ID si (ekranda ko'rsatilmaydi), shuning uchun boshqa odam yozishmani o'qiy olmaydi.
import { guard, json, readJson, DEVICE_RE } from "./_db.js";
import { ensureDevice, tg, adminChat, esc } from "./_sn.js";
const cut = (s, n) => String(s == null ? "" : s).replace(/\u0000/g, "").trim().slice(0, n);
export const onRequestGet = guard(async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("deviceId") || "";
  if (!DEVICE_RE.test(id)) return json({ error: "deviceId xato" }, 400);
  const rows = ((await env.DB.prepare("SELECT id, who, text, kind, created, seen_user FROM sn_msgs WHERE device = ? ORDER BY id DESC LIMIT 200").bind(id).all()).results || []).reverse();
  return json({ msgs: rows, unread: rows.filter((m) => m.who === "a" && !m.seen_user).length });
});
export const onRequestPost = guard(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 6000);
  if (!DEVICE_RE.test(b.deviceId || "")) return json({ error: "deviceId xato" }, 400);
  if (b.action === "read") {
    await db.prepare("UPDATE sn_msgs SET seen_user = 1 WHERE device = ? AND who = 'a'").bind(b.deviceId).run();
    return json({ ok: true });
  }
  const text = cut(b.text, 1000), name = cut(b.name, 60), kind = b.kind === "fb" ? "fb" : "chat";
  if (!text) return json({ error: "Xabar bo'sh" }, 400);
  const n = await db.prepare("SELECT COUNT(*) AS n FROM sn_msgs WHERE device = ? AND who = 'u' AND created > ?").bind(b.deviceId, Date.now() - 3600000).first();
  if (n && n.n >= 30) return json({ error: "Juda ko'p xabar — biroz kuting" }, 429);
  const d = await ensureDevice(db, b.deviceId);
  const r = await db.prepare("INSERT INTO sn_msgs (device, who, name, text, kind, created) VALUES (?, 'u', ?, ?, ?, ?)").bind(b.deviceId, name, text, kind, Date.now()).run();
  try {
    const chat = await adminChat(db);
    if (chat) await tg(env, "sendMessage", { chat_id: chat, parse_mode: "HTML", disable_web_page_preview: true,
      text: [`💬 <b>${kind === "fb" ? "Fikr / taklif" : "Yangi xabar"}</b>${name ? " · " + esc(name) : ""}`, `Dastur ID: <code>${esc(d.short)}</code>`, ``, esc(text), ``, `↩ Javob: shu xabarga «Reply» qilib yozing yoki admin sahifada (💬 Xabarlar).`].join("\n") });
  } catch (_) {}
  return json({ ok: true, id: r.meta && r.meta.last_row_id });
});
