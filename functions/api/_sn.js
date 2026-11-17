// SAHNA NURI mantiqi: qurilmalar va sinov vaqti, kodlar, to'lovlar, Telegram bot.
import { kvGet, kvSet, getSettings, signLicense } from "./_db.js";

/* ================= Qurilma va sinov ================= */
export async function ensureDevice(db, id, fp) {
  fp = typeof fp === "string" ? fp.replace(/[^a-f0-9]/gi, "").slice(0, 16) : "";
  let d = await db.prepare("SELECT * FROM sn_devices WHERE id = ?").bind(id).first();
  if (d) {
    if (fp && !d.fp) { await db.prepare("UPDATE sn_devices SET fp = ? WHERE id = ?").bind(fp, id).run(); d.fp = fp; }
    return d;
  }
  // shu kompyuterda sinov avval ishlatilgan bo'lsa, hisob davom etadi
  let used = 0;
  if (fp) { const f = await db.prepare("SELECT used FROM sn_fp WHERE fp = ?").bind(fp).first(); if (f) used = f.used; }
  for (let i = 0; i < 20; i++) {
    const short = "SN-" + (1000 + Math.floor(Math.random() * 9000));
    try {
      const now = Date.now();
      await db.prepare("INSERT INTO sn_devices (id, short, fp, first, last, last_tick, used) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, short, fp || null, now, now, 0, used).run();
      return { id, short, fp, first: now, last: now, last_tick: 0, used };
    } catch (e) {
      if (!/UNIQUE/i.test(String(e.message))) throw e;
    }
  }
  throw new Error("ID yaratib bo'lmadi");
}

export function codeStatus(c) {
  if (c.status === "revoked") return "revoked";
  if (c.status === "unused") return "unused";
  if (c.expires && c.expires < Date.now()) return "expired";
  return "active";
}

export async function licenseFor(db, deviceId) {
  const rows = (await db.prepare("SELECT * FROM sn_codes WHERE device = ? AND status = 'active' ORDER BY expires = 0 DESC, expires DESC").bind(deviceId).all()).results || [];
  const c = rows.find((x) => codeStatus(x) === "active");
  if (!c) return null;
  return {
    token: await signLicense(db, { d: deviceId, c: c.code, p: c.plan_name, e: c.expires || 0, i: Date.now() }),
    plan: c.plan_name, expiresAt: c.expires || 0, code: c.code,
  };
}

export async function publicConfig(db) {
  const s = await getSettings(db);
  return {
    card: s.card,
    trialMinutes: s.trialMinutes,
    tariffs: s.tariffs.filter((t) => t.active).map(({ id, name, days, price }) => ({ id, name, days, price })),
    botUsername: (await kvGet(db, "bot_username")) || "",
  };
}

export async function sessionInfo(db, d) {
  const s = await getSettings(db);
  const trialSec = Math.round(s.trialMinutes * 60);
  const used = Math.round(d.used || 0);
  return { shortId: d.short, trialSec, usedSec: used, remainingSec: Math.max(0, trialSec - used), license: await licenseFor(db, d.id) };
}

/* ================= Kodlar ================= */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function block(n) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  let s = "";
  for (let i = 0; i < n; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return s;
}
export async function createCode(db, planId, meta = {}) {
  const s = await getSettings(db);
  const plan = s.tariffs.find((t) => t.id === planId);
  if (!plan) throw Object.assign(new Error("Tarif topilmadi: " + planId), { status: 400 });
  for (let i = 0; i < 10; i++) {
    const code = `SN-${plan.id}-${block(4)}-${block(4)}`;
    try {
      await db.prepare("INSERT INTO sn_codes (code, plan_id, plan_name, days, status, created, created_by, payment_id, tg_user, tg_username) VALUES (?, ?, ?, ?, 'unused', ?, ?, ?, ?, ?)")
        .bind(code, plan.id, plan.name, plan.days, Date.now(), meta.createdBy || "admin", meta.paymentId || null, meta.tgUser || null, meta.tgUsername || null).run();
      return { code, planId: plan.id, planName: plan.name, days: plan.days };
    } catch (e) { if (!/UNIQUE/i.test(String(e.message))) throw e; }
  }
  throw new Error("Kod yaratib bo'lmadi");
}

export async function activate(db, deviceId, raw) {
  const code = String(raw || "").trim().toUpperCase();
  const c = await db.prepare("SELECT * FROM sn_codes WHERE code = ?").bind(code).first();
  if (!c) return { error: "Kod topilmadi. Harflarni tekshirib qayta kiriting." };
  const st = codeStatus(c);
  if (st === "revoked") return { error: "Bu kod bekor qilingan." };
  if (st === "expired") return { error: "Bu kodning muddati tugagan." };
  if (c.device && c.device !== deviceId) return { error: "Bu kod boshqa kompyuterda faollashtirilgan." };
  if (!c.device) {
    const now = Date.now();
    // uzaytirish: qurilmada faol tarif bo'lsa, yangi muddat uning ustiga qo'shiladi (Sahna Ovozi bilan bir xil)
    const cur = await db.prepare("SELECT MAX(expires) AS mx FROM sn_codes WHERE device = ? AND status = 'active' AND expires > ?").bind(deviceId, now).first();
    const base = cur && cur.mx > now ? cur.mx : now;
    const exp = c.days > 0 ? base + c.days * 86400000 : 0;
    await db.prepare("UPDATE sn_codes SET device = ?, activated = ?, expires = ?, status = 'active' WHERE code = ? AND device IS NULL").bind(deviceId, now, exp, code).run();
  }
  return { ok: true, license: await licenseFor(db, deviceId) };
}

/* ================= Telegram ================= */
export async function botToken(env) {
  return env.BOT_TOKEN || (await kvGet(env.DB, "bot_token")) || "";
}
export async function tg(env, method, body) {
  const token = await botToken(env);
  if (!token) throw new Error("Bot tokeni kiritilmagan");
  const r = await fetch((env.TG_API || "https://api.telegram.org") + "/bot" + token + "/" + method, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.description || "Telegram xatosi");
  return j.result;
}
export const send = (env, chatId, text, extra = {}) => tg(env, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const fmtSum = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/[,  ]/g, " ") + " so'm";

/* ================= To'lovlar ================= */
export async function createPayment(db, d) {
  const s = await getSettings(db);
  const plan = s.tariffs.find((t) => t.id === d.planId);
  const id = "P" + Date.now().toString(36).toUpperCase() + block(3);
  await db.prepare("INSERT INTO sn_payments (id, short, plan_id, plan_name, amount, tg_user, tg_username, tg_name, photo, photo_kind, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)")
    .bind(id, d.shortId || null, d.planId, plan ? plan.name : d.planId, plan ? plan.price : 0, d.tgUser, d.tgUsername || "", d.tgName || "", d.photo || null, d.photoKind || "photo", Date.now()).run();
  return db.prepare("SELECT * FROM sn_payments WHERE id = ?").bind(id).first();
}

export async function approvePayment(env, id, by) {
  const db = env.DB;
  // bir vaqtda ikki marta bosilsa ham bitta kod chiqadi
  const lock = await db.prepare("UPDATE sn_payments SET status = 'approving' WHERE id = ? AND status = 'pending'").bind(id).run();
  if (!lock.meta || !lock.meta.changes) return { error: "Bu to'lov allaqachon ko'rib chiqilgan yoki topilmadi" };
  const p = await db.prepare("SELECT * FROM sn_payments WHERE id = ?").bind(id).first();
  let code;
  try {
    code = await createCode(db, p.plan_id, { createdBy: by, paymentId: p.id, tgUser: p.tg_user, tgUsername: p.tg_username });
  } catch (e) {
    await db.prepare("UPDATE sn_payments SET status = 'pending' WHERE id = ?").bind(id).run();
    throw e;
  }
  await db.prepare("UPDATE sn_payments SET status = 'approved', decided = ?, code = ? WHERE id = ?").bind(Date.now(), code.code, id).run();
  // Dastur ID (SN-1234) ma'lum bo'lsa — kod darhol shu qurilmaga bog'lanadi: dastur ochiq bo'lsa 30 soniyada o'zi faollashadi
  // (Sahna Ovozi bilan bir xil). Kod baribir xaridorga ham yuboriladi — zaxira sifatida.
  let auto = false;
  if (p.short) {
    const d = await db.prepare("SELECT id FROM sn_devices WHERE short = ?").bind(p.short).first();
    if (d) { const r = await activate(db, d.id, code.code); auto = !!(r && r.ok); }
  }
  const days = code.days ? `${code.days} kun (faollashtirilgan kundan boshlab)` : "cheksiz";
  const warn = [];
  if (p.tg_user) try {
    await send(env, p.tg_user, [
      `<b>To'lov tasdiqlandi</b> ✅`,
      auto ? `SAHNA NURI ochiq bo'lsa, o'zi faollashadi (30 soniya ichida). Bo'lmasa, kodni dasturdagi "Aktivatsiya kodi" maydoniga kiriting:` : `Faollashtirish kodingiz — dasturdagi "Aktivatsiya kodi" maydoniga kiriting:`,
      `<code>${code.code}</code>`, ``, `Amal qilish: ${days}.`,
    ].join("\n"));
  } catch (e) { warn.push("Xaridorga yuborilmadi: " + e.message); }
  // pultdagi yozishmaga ham (bot ishlatmagan xaridor uchun)
  if (p.short) {
    const d = await db.prepare("SELECT id FROM sn_devices WHERE short = ?").bind(p.short).first();
    if (d) await db.prepare("INSERT INTO sn_msgs (device, who, name, text, kind, created, seen_admin) VALUES (?, 'a', 'Admin', ?, 'chat', ?, 1)")
      .bind(d.id, `✅ To'lov tasdiqlandi: ${p.plan_name}. ${auto ? "Tarif shu qurilmada o'zi faollashdi." : "Kod:"} ${code.code}`, Date.now()).run();
  }
  await editAdminMsg(env, p, `\n\n<b>Tasdiqlandi.</b> Kod: <code>${code.code}</code>${auto ? " · qurilmada o'zi faollashdi" : ""}`);
  return { ok: true, code, auto, warn };
}

// Telegram'dagi admin xabarini yangilash: rasmli xabar — caption, matnli (pultdan kelgan) — text
export async function editAdminMsg(env, p, tail) {
  try {
    if (!p.admin_msg) return;
    const text = /^(web|req)$/.test(p.photo_kind || "");
    await tg(env, text ? "editMessageText" : "editMessageCaption", { chat_id: p.admin_chat, message_id: p.admin_msg, parse_mode: "HTML", [text ? "text" : "caption"]: p.admin_caption + tail });
  } catch (_) {}
}

export async function rejectPayment(env, id) {
  const db = env.DB;
  const r = await db.prepare("UPDATE sn_payments SET status = 'rejected', decided = ? WHERE id = ? AND status = 'pending'").bind(Date.now(), id).run();
  if (!r.meta || !r.meta.changes) return { error: "Bu to'lov allaqachon ko'rib chiqilgan yoki topilmadi" };
  const p = await db.prepare("SELECT * FROM sn_payments WHERE id = ?").bind(id).first();
  if (p.tg_user) try { await send(env, p.tg_user, "Afsuski, to'lovingiz tasdiqlanmadi. Chekni tekshirib qayta yuboring yoki admin bilan bog'laning."); } catch (_) {}
  await editAdminMsg(env, p, `\n\n<b>Rad etildi.</b>`);
  return { ok: true };
}

export async function adminChat(db) { return (await kvGet(db, "admin_chat")) || ""; }
export { kvGet, kvSet, getSettings };
