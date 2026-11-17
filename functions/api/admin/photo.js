// Admin: chek rasmi — botga yuborilgan bo'lsa Telegram'dan, dasturdan yuborilgan bo'lsa bazadan.
import { adminOnly, json } from "../_db.js";
import { tg, botToken } from "../_sn.js";
export const onRequestGet = adminOnly(async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("id") || "";
  const p = await env.DB.prepare("SELECT photo, photo_kind FROM sn_payments WHERE id = ?").bind(id).first();
  if (!p || !p.photo) return json({ error: "Rasm yo'q" }, 404);
  if (p.photo_kind === "web") {
    const r = await env.DB.prepare("SELECT mime, data FROM sn_receipts WHERE id = ?").bind(id).first();
    if (!r) return json({ error: "Rasm yo'q" }, 404);
    const bin = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
    return new Response(bin, { headers: { "Content-Type": r.mime, "Cache-Control": "private, max-age=3600" } });
  }
  const f = await tg(env, "getFile", { file_id: p.photo });
  const r = await fetch((env.TG_API || "https://api.telegram.org") + "/file/bot" + (await botToken(env)) + "/" + f.file_path);
  return new Response(r.body, { headers: { "Content-Type": r.headers.get("content-type") || "image/jpeg", "Cache-Control": "private, max-age=3600" } });
});
