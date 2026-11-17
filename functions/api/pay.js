// Ochiq: to'lovni dasturning o'zidan yuborish (Telegram botsiz ham) — Sahna Ovozi bilan bir xil.
// POST /api/pay {deviceId, plan, name, phone, note, img?: "data:image/jpeg;base64,…"} → admin sahifada «To'lovlar»ga tushadi.
//   img bo'lmasa — «so'rov» (chek yo'q): admin pul kelganini kartasida tekshiradi va tasdiqlaydi.
//   Tasdiqlansa kod shu qurilmaga bog'lanadi — dastur o'zi faollashadi.
// GET  /api/pay?deviceId=… → shu qurilmaning oxirgi to'lovi holati (pending / approved / rejected).
import { guard, json, readJson, DEVICE_RE, getSettings } from "./_db.js";
import { ensureDevice, createPayment, tg, adminChat, esc, fmtSum } from "./_sn.js";
const cut = (s, n) => String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n);
const kb = (id) => ({ inline_keyboard: [[{ text: "Tasdiqlash", callback_data: "ok:" + id }, { text: "Rad etish", callback_data: "no:" + id }]] });

export const onRequestGet = guard(async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("deviceId") || "";
  if (!DEVICE_RE.test(id)) return json({ error: "deviceId xato" }, 400);
  const d = await env.DB.prepare("SELECT short FROM sn_devices WHERE id = ?").bind(id).first();
  if (!d) return json({ payment: null });
  const p = await env.DB.prepare("SELECT id, plan_name, amount, status, photo_kind, created, decided FROM sn_payments WHERE short = ? ORDER BY created DESC LIMIT 1").bind(d.short).first();
  return json({ payment: p || null });
});

export const onRequestPost = guard(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 1200000);
  if (!DEVICE_RE.test(b.deviceId || "")) return json({ error: "Qurilma aniqlanmadi" }, 400);
  const s = await getSettings(db), t = s.tariffs.find((x) => x.id === b.plan && x.active);
  if (!t) return json({ error: "Tarif topilmadi" }, 400);
  const raw = String(b.img || ""); let m = null;
  if (raw) {
    m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(raw);
    if (!m) return json({ error: "Chek rasmi o'qilmadi — boshqa rasm tanlang" }, 400);
    if (m[2].length > 1100000) return json({ error: "Rasm juda katta" }, 413);
  }
  const d = await ensureDevice(db, b.deviceId);
  const pend = await db.prepare("SELECT COUNT(*) AS n FROM sn_payments WHERE short = ? AND status = 'pending'").bind(d.short).first();
  if (pend && pend.n >= 3) return json({ error: "Sizda 3 ta tekshirilmagan to'lov bor — admin ko'rib chiqishini kuting" }, 429);
  const name = cut(b.name, 60), phone = cut(b.phone, 30), note = cut(b.note, 200);
  if (!m && !name && !phone) return json({ error: "Ismingiz va telefoningizni yozing — admin siz bilan bog'lanadi" }, 400);
  const who = [name, phone, note ? "izoh: " + note : ""].filter(Boolean).join(" · ") || "dastur orqali";
  const p = await createPayment(db, { shortId: d.short, planId: t.id, tgUser: null, tgUsername: "", tgName: who, photo: m ? "web" : null, photoKind: m ? "web" : "req" });
  if (m) await db.prepare("INSERT INTO sn_receipts (id, mime, data, created) VALUES (?, ?, ?, ?)").bind(p.id, m[1], m[2], Date.now()).run();
  try {
    const chat = await adminChat(db);
    if (chat && s.bot && s.bot.notify !== false) {
      const caption = [
        m ? `<b>Yangi to'lov (dastur orqali)</b> · ${esc(p.id)}` : `📨 <b>To'lov so'rovi (chek yo'q)</b> · ${esc(p.id)}`,
        `Xaridor: ${esc(who)}`, `Dastur ID: <code>${esc(d.short)}</code>`, `Tarif: <b>${esc(t.name)}</b> · <b>${fmtSum(t.price)}</b>`, ``,
        m ? `Chek rasmi — admin sahifada.` : `Chek yo'q — pul kelganini kartangizda tekshiring.`,
        `«Tasdiqlash» → kod shu qurilmaga bog'lanadi, dastur o'zi faollashadi.`,
      ].join("\n");
      const r = await tg(env, "sendMessage", { chat_id: chat, text: caption, parse_mode: "HTML", reply_markup: kb(p.id) });
      if (r && r.message_id) await db.prepare("UPDATE sn_payments SET admin_chat = ?, admin_msg = ?, admin_caption = ? WHERE id = ?").bind(String(chat), r.message_id, caption, p.id).run();
    }
  } catch (_) {}
  return json({ ok: true, id: p.id, plan: t.name, amount: t.price });
});
