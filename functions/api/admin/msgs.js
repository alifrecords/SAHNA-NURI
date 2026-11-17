// Admin: foydalanuvchilar bilan yozishmalar.
// GET  /api/admin/msgs            → suhbatlar ro'yxati
// GET  /api/admin/msgs?short=SN-… → suhbat (o'qildi deb belgilanadi)
// POST /api/admin/msgs {short, text} → javob (dastur o'zi oladi)
import { adminOnly, json, readJson } from "../_db.js";
const SHORT = /^SN-\d{4}$/;
async function devOf(db, short) { return db.prepare("SELECT id, short, last FROM sn_devices WHERE short = ?").bind(short).first(); }
export const onRequestGet = adminOnly(async ({ request, env }) => {
  const db = env.DB, short = (new URL(request.url).searchParams.get("short") || "").toUpperCase();
  if (short) {
    if (!SHORT.test(short)) return json({ error: "ID xato" }, 400);
    const d = await devOf(db, short); if (!d) return json({ error: "Topilmadi" }, 404);
    const rows = ((await db.prepare("SELECT id, who, name, text, kind, created, seen_user FROM sn_msgs WHERE device = ? ORDER BY id DESC LIMIT 300").bind(d.id).all()).results || []).reverse();
    await db.prepare("UPDATE sn_msgs SET seen_admin = 1 WHERE device = ? AND who = 'u'").bind(d.id).run();
    const lic = await db.prepare("SELECT plan_name, expires FROM sn_codes WHERE device = ? AND status = 'active' AND (expires = 0 OR expires > ?) ORDER BY expires DESC LIMIT 1").bind(d.id, Date.now()).first();
    return json({ short, last: d.last, license: lic || null, msgs: rows });
  }
  const L = (await db.prepare(`SELECT d.short, t.unread, t.n, m.text, m.who, m.kind, m.name, m.created
     FROM (SELECT device, MAX(id) AS mid, SUM(CASE WHEN who = 'u' AND seen_admin = 0 THEN 1 ELSE 0 END) AS unread, COUNT(*) AS n FROM sn_msgs GROUP BY device) t
     JOIN sn_msgs m ON m.id = t.mid JOIN sn_devices d ON d.id = t.device ORDER BY m.created DESC LIMIT 200`).all()).results || [];
  return json({ threads: L, unread: L.reduce((a, x) => a + (x.unread || 0), 0) });
});
export const onRequestPost = adminOnly(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 6000), short = String(b.short || "").toUpperCase(), text = String(b.text || "").trim().slice(0, 2000);
  if (!SHORT.test(short)) return json({ error: "ID xato" }, 400);
  if (!text) return json({ error: "Javob bo'sh" }, 400);
  const d = await devOf(db, short); if (!d) return json({ error: "Topilmadi" }, 404);
  await db.prepare("INSERT INTO sn_msgs (device, who, name, text, kind, created, seen_admin) VALUES (?, 'a', 'Admin', ?, 'chat', ?, 1)").bind(d.id, text, Date.now()).run();
  await db.prepare("UPDATE sn_msgs SET seen_admin = 1 WHERE device = ? AND who = 'u'").bind(d.id).run();
  return json({ ok: true });
});
