# SAHNA NURI — Azimxodjayev Music

Teatr va sahna uchun DMX yorugʻlik boshqaruvi. Tuzilishi **AZ-ARENA** bilan bir xil: kod GitHub'da turadi, Cloudflare Pages uni sayt qilib chiqaradi, adminga GitHub tokeni bilan kiriladi, toʻlov Telegram bot va aktivatsiya kodi orqali.

| Fayl / papka | Vazifasi |
| --- | --- |
| `index.html` | Pult: chiroqlar, programmer, cue roʻyxati, GO, faderlar, patch, profillar, ulanish, monitor |
| `assets/dmx.js` | Universal ulanish: uDMX (WebUSB), Enttec Pro va Open DMX (Web Serial), simulyatsiya |
| `assets/app.js` | Pult mantiqi va 512 kanal hisoblash |
| `assets/license.js` | 20 daqiqalik sinov, aktivatsiya kodi (Ed25519 imzo, oflayn tekshiriladi) |
| `admin.html` | Faqat siz uchun: toʻlovlar, karta, tariflar, kodlar, Telegram bot |
| `functions/api/` | Server qismi (Cloudflare Pages Functions + D1) |
| `sw.js` | Oflayn ishlash: internet uzilsa ham pult ochiladi |

Xarajat: **0 soʻm**. GitHub, Cloudflare Pages, D1 va Telegram bepul.

---

## 1. Cloudflare Pages'ga ulash

1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → `SAHNA-NURI`.
2. Framework preset: **None** · Build command: **boʻsh** · Build output directory: **/** → **Save and Deploy**.
3. Sayt manzili: `https://sahna-nuri.pages.dev`.

## 2. D1 bazasini ulash (bir marta)

1. Cloudflare → shu loyiha → **Settings** → **Bindings** → **Add** → **D1 database**.
2. **Variable name:** `DB` (katta harflarda).
3. **D1 database:** AZ-ARENA yoki AZ-Playlist'dagi mavjud bazani tanlasa boʻladi. SAHNA NURI jadvallari `sn_` bilan boshlanadi, boshqa loyihalarga tegmaydi.
4. **Save** → **Deployments** → oxirgi deploy → **Retry deployment**.

Jadvallar birinchi soʻrovda oʻzi yaratiladi.

## 3. Admin tokeni

1. github.com/settings/personal-access-tokens → `az-admin` tokeni → **Edit**.
2. **Repository access** → `AZ-Playlist`, `AZ-Arena` bilan birga **`SAHNA-NURI`** ni ham belgilang.
3. **Contents:** *Read and write* → **Update**.

## 4. Admin sahifa

1. `https://sahna-nuri.pages.dev/admin` → GitHub hisob: `alifrecords` · Repozitoriy: `SAHNA-NURI` · Token → **Ulanish**.
2. **Toʻlov kartasi:** karta raqami va ism → **Kartani saqlash**.
3. **Telegram bot:** @BotFather'dan yangi bot yoki mavjud botingiz tokeni → **Botni ulash** → **Bogʻlash** → telefonda **START**.
4. **Tariflar:** standart — Start 25 000 / oy, PRO 50 000 / oy, PRO 300 000 / yil. Sinov 20 daqiqa.

Tarif kodi `ST` bilan boshlansa — **Start** (32 tagacha chiroq, 100 tagacha cue). Boshqa kodlar — cheklovsiz.

## 5. uDMX kabelni ulash (Windows)

1. **FreeStyler'ni yoping** — kabelni bir vaqtda faqat bitta dastur ishlatadi.
2. Saytni **Chrome** yoki **Edge**'da oching → **Ulanish** → **uDMX ULASH** → `uDMX` → **Ulash**.
3. Roʻyxat boʻsh boʻlsa yoki xato chiqsa — drayverni **WinUSB**'ga almashtiring:
   **zadig.akeo.ie** → Zadig → *Options → List All Devices* → `uDMX` → **WinUSB** → **Replace Driver** → brauzerni qayta oching.
4. FreeStyler'ga qaytish kerak boʻlsa, Zadig'da drayverni yana **libusbK**'ga almashtirasiz.
5. Bir marta ruxsat bergach, keyingi safar kabel ulanishi bilan dastur oʻzi ulanadi.

**iPad / iPhone:** Safari USB'ga ruxsat bermaydi — ularda simulyatsiya va mashq rejimi ishlaydi.

## 6. Sahna boʻlimi (nur yoʻnaltirish)

| Qadam | Nima qilinadi |
| --- | --- |
| 1 | **Sahna** → eni, chuqurligi va ferma balandligini (metr) kiriting |
| 2 | Ixtiyoriy: **RASM YUKLASH** — yuqoridan chizilgan plan yoki zaldan olingan foto. Keyin **4 BURCHAK** bilan sahna burchaklarini bosing |
| 3 | **CHIROQLARNI JOYLASH** — har chiroq belgisini haqiqiy joyiga suring (yoki X, Y, balandlikni yozing) |
| 4 | **KALIBRLASH** — bitta Beam tanlang, Pan/Tilt slayderlari bilan nurni poldagi belgiga tushiring, planda oʻsha belgini bosing. 3–4 nuqta |
| 5 | **NUR YOʻNALTIRISH** — planni bosing: tanlangan Beam’lar oʻsha nuqtaga buriladi. Nuqtani nom bilan saqlash mumkin; keyin CUE YOZISH |

Pan/Tilt diapazoni (odatda 540° / 270°) **Profillar**da sozlanadi. Nuqtani oʻchirish: tugmasini oʻng tugma bilan ikki marta bosing.

## 7. Toʻlov jarayoni

| Qadam | Kim | Nima boʻladi |
| --- | --- | --- |
| 1 | Foydalanuvchi | Sinov tugaydi → **Telegram bot orqali toʻlash** (ID avtomatik oʻtadi) |
| 2 | Bot | Tarif → karta raqami, summa |
| 3 | Foydalanuvchi | Pul oʻtkazadi, chek rasmini botga yuboradi |
| 4 | Bot → Siz | Chek **Tasdiqlash / Rad etish** tugmalari bilan keladi |
| 5 | Bot | Tarifga mos kodni foydalanuvchiga yuboradi |
| 6 | Foydalanuvchi | Kodni dasturga kiritadi → faol |

Botdagi admin buyruqlari: `/kutilayotgan` · `/kod PR` · `/karta 8600123412341234 Ism Familiya`

## Xavfsizlik

- Sinov tugaganda chiroqlar **oʻchmaydi** — oxirgi holatda qoladi, faqat boshqaruv toʻxtaydi (spektakl oʻrtasida sahna qorongʻi boʻlib qolmasligi uchun).
- Litsenziya kompyuterning oʻzida tekshiriladi: sahnada internet uzilsa ham dastur ishlayveradi.
- Imzo kaliti D1 bazasida (`sn_kv`, `ed_private`). Bazani oʻchirmang.

© AZIMXODJAYEV. Barcha huquqlar himoyalangan.
