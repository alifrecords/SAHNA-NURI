// Faollashtirish kodi. Bitta IP dan 15 daqiqada 10 tadan ortiq xato urinish bloklanadi.
import { guard, json, readJson, DEVICE_RE, clientIp } from "./_db.js";
import { ensureDevice, activate } from "./_sn.js";
export const onRequestPost = guard(async ({ request, env }) => {
  const db = env.DB, ip = clientIp(request), now = Date.now();
  await db.prepare("DELETE FROM sn_fail WHERE ts < ?").bind(now - 15 * 60000).run();
  const f = await db.prepare("SELECT COUNT(*) AS n FROM sn_fail WHERE ip = ?").bind(ip).first();
  if (f && f.n >= 10) return json({ error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining." }, 429);
  const b = await readJson(request, 500);
  if (!DEVICE_RE.test(b.deviceId || "")) return json({ error: "deviceId xato" }, 400);
  await ensureDevice(db, b.deviceId);
  const r = await activate(db, b.deviceId, b.code);
  if (r.error) { await db.prepare("INSERT INTO sn_fail (ip, ts) VALUES (?, ?)").bind(ip, now).run(); return json(r, 400); }
  return json(r);
});
