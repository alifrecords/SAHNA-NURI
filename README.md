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
| `assets/i18n.js` | Uch til: oʻzbek, rus, ingliz (yuqoridagi UZ · RU · EN tugmalari) |
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

## 5. SAHNA NURI Bridge (tavsiya etiladi)

Kompyuterga bir marta oʻrnatiladigan kichik dastur — Zadig va drayver almashtirish kerak emas.

1. Pult → **Ulanish** → **YUKLAB OLISH (.exe)** (yoki [SahnaNuriBridge.exe](https://github.com/alifrecords/SAHNA-NURI/releases/latest/download/SahnaNuriBridge.exe)).
2. Faylni ishga tushiring. Windows „Неизвестный издатель“ desa: **Подробнее → Выполнить в любом случае**.
3. „Oʻrnatildi va ishga tushdi“ xabari chiqadi. Windows bilan oʻzi yonmaydi — keyingi safar pultda **BRIDGE ULASH** bosilganda oʻzi ishga tushadi (brauzer soʻrasa — „Ochish“).
4. Pult sahifasi ochilganda Bridge’ga **oʻzi ulanadi** (yoki Ulanish → **BRIDGE ULASH**).

| Holat | Bridge nima qiladi |
| --- | --- |
| Kabel chiqib qoldi | Har soniya qidiradi, qayta tiqilganda oʻzi ulanadi va oxirgi holatni yuboradi |
| Brauzer yopildi / qotib qoldi | Chiroqlar oxirgi holatda qoladi |
| Kompyuter qayta yondi | Bridge oʻzi ishga tushadi va chiroqlarni oxirgi holatiga qaytaradi |
| Pult sahifasi qayta ochildi | Oxirgi ijro etilgan cue fade’siz tiklanadi |

- Holat sahifasi: http://127.0.0.1:47800
- Faqat `sahna-nuri.pages.dev` boshqara oladi (boshqa saytlar rad etiladi).
- Avtomatik ishga tushishni olib tashlash: `SahnaNuriBridge.exe --uninstall`.
- FreeStyler bilan bir vaqtda ishlamaydi — kabelni bitta dastur ishlatadi.
- Kod: `bridge/`, yigʻish: `.github/workflows/bridge.yml` (Python 3.11, Windows 8.1 / 10 / 11).

## 5b. uDMX kabelni Bridge’siz ulash (Windows)

1. **FreeStyler'ni yoping** — kabelni bir vaqtda faqat bitta dastur ishlatadi.
2. Saytni **Chrome** yoki **Edge**'da oching → **Ulanish** → **uDMX ULASH** → `uDMX` → **Ulash**.
3. Roʻyxat boʻsh boʻlsa yoki xato chiqsa — drayverni **WinUSB**'ga almashtiring:
   **zadig.akeo.ie** → Zadig → *Options → List All Devices* → `uDMX` → **WinUSB** → **Replace Driver** → brauzerni qayta oching.
4. FreeStyler'ga qaytish kerak boʻlsa, Zadig'da drayverni yana **libusbK**'ga almashtirasiz.
5. Bir marta ruxsat bergach, keyingi safar kabel ulanishi bilan dastur oʻzi ulanadi.

**iPad / iPhone:** Safari USB'ga ruxsat bermaydi — ularda simulyatsiya va mashq rejimi ishlaydi.


## 6. 🔊 Cue-Link — Sahna Ovozi bilan bogʻlash

Sahna Ovozi’da cue GO boʻlganda, unga biriktirilgan chiroq cue’si shu yerda oʻzi yonadi (Sahna Ovozi → cue ✎ → **💡 Sahna Nuri cue**: raqam yoki nom, `BO` — blackout).

| Yoʻl | Qachon | Qanday |
| --- | --- | --- |
| Lokal | Sahna Ovozi (.exe) va Sahna Nuri bitta kompyuterda | Nuri `http://127.0.0.1:47810/events` ga oʻzi ulanadi. Internet kerak emas |
| Online | Boshqa qurilma yoki Sahna Ovozi sayti | Ulanish → **2 · Online xona kodi** → kodni Sahna Ovozi → **💡 NURI** oynasiga yozing. Server: `functions/api/link.js` (D1 jadvallari `sn_link`, `sn_link_seen`) |

Yuqoridagi **🔊 OVOZ** belgisi yashil boʻlsa — ulangan. Ikkala yoʻl birga ishlasa ham signal bir marta bajariladi.

## 6. Sahna boʻlimi (nur yoʻnaltirish)

| Qadam | Nima qilinadi |
| --- | --- |
| 1 | **Sahna** → eni, chuqurligi va ferma balandligini (metr) kiriting |
| 2 | Ixtiyoriy: **RASM YUKLASH** — yuqoridan chizilgan plan yoki zaldan olingan foto. Keyin **4 BURCHAK** bilan sahna burchaklarini bosing |
| 3 | **CHIROQLARNI JOYLASH** — har chiroq belgisini haqiqiy joyiga suring (yoki X, Y, balandlikni yozing) |
| 4 | **KALIBRLASH** — bitta Beam tanlang, Pan/Tilt slayderlari bilan nurni poldagi belgiga tushiring, planda oʻsha belgini bosing. 3–4 nuqta |
| 5 | **NUR YOʻNALTIRISH** — planni bosing: tanlangan Beam’lar oʻsha nuqtaga buriladi. Nuqtani nom bilan saqlash mumkin; keyin CUE YOZISH |

Pan/Tilt diapazoni (odatda 540° / 270°) **Profillar**da sozlanadi. Nuqtani oʻchirish: tugmasini oʻng tugma bilan ikki marta bosing.

## 7. Avtomatik oʻtish (cue → keyingi cue)

Cue roʻyxatidagi **AVTO (daq:son)** ustuniga vaqt yozing: `0:45`, `1:30`, `90` yoki `1:02:00`. Bu cue boshlanganidan shuncha vaqt oʻtgach keyingi cue oʻzi GO boʻladi. Boʻsh qoldirilsa — faqat qoʻlda GO.

- HOLAT ustunida qolgan vaqt sanaladi: `IJRODA · → 0:42`, pastdagi koʻk chiziq toʻladi.
- **PAUZA** sanashni toʻxtatadi, qayta bosilganda davom etadi.
- **AVTO YOQIQ / OʻCHIQ** — repetitsiyada barcha avtomatik oʻtishlarni bir tugma bilan oʻchiradi.
- GO oʻz vaqtidan oldin bosilsa, darhol keyingi cue’ga oʻtadi.

## 8. Qorongʻida burilish (Move in Black)

Cue roʻyxati ostidagi **QORONGʻIDA BURILISH YOQIQ** (standart holatda yoqilgan):

| Bosqich | Vaqt | Nima boʻladi |
| --- | --- | --- |
| 1 | 0,4 s | Joyi oʻzgaradigan moving head oʻchadi |
| 2 | „Burilish vaqti“ (standart 1,5 s) | Qorongʻida yangi pan/tilt, rang gʻildiragi, gobo’ga boradi |
| 3 | Cue FADE | Yangi joyida fade bilan yonadi |

- Cue’da oʻchiq turgan moving head keyingi cue’dagi joyiga **oldindan** qorongʻida burilib turadi — u cue’da darhol fade bilan yonadi, kutish boʻlmaydi.
- Burilish vaqtini chiroqlaringiz tezligiga moslang: toʻliq aylanishga qancha vaqt ketsa, shuncha.
- Nur ataylab yonib turgan holda sahna boʻylab yurishi kerak boʻlsa — tugmani **OʻCHIQ** qiling.

## 9. Chiroqlarni chap / oʻng boʻlish

Bitta sahnada har chiroq alohida pozitsiyada turishi mumkin — programmer har chiroqni alohida eslaydi.

- **Tez usul:** chiroqlarni tanlang → Programmer → **Boʻlish**: `Chap | Oʻng` (yarmi chapga, yarmi oʻngga), `Toq | Juft` (navbatma-navbat), `Yelpigʻich` (chapdan oʻngga tekis), `Kesishish` (chapdagilar oʻngga, oʻngdagilar chapga).
- **Qoʻlda:** `1-yarmi` / `2-yarmi` / `Toq` / `Juft` bilan tanlovni ajrating → Pozitsiyadan `Chap` yoki `Oʻng`.
- Har chiroq tugmasida yoʻnalish belgisi: ◀ chapda, ● markazda, ▶ oʻngda.
- Keyin **CUE YOZISH** — hammasi bitta cue’ga yoziladi.

## 10. Toʻlov jarayoni (Sahna Ovozi bilan bir xil)

| Qadam | Kim | Nima boʻladi |
| --- | --- | --- |
| 1 | Foydalanuvchi | Sinov tugaydi → tarif tanlaydi, kartaga pul oʻtkazadi |
| 2a | Foydalanuvchi | Chekni **Telegram bot**ga yuboradi (ID avtomatik oʻtadi) |
| 2b | Foydalanuvchi | yoki **«Chekni shu yerdan yuborish»** — dasturning oʻzidan, Telegram'siz (chek boʻlmasa — ism va telefon bilan soʻrov) |
| 3 | Bot → Siz | Chek / soʻrov **Tasdiqlash / Rad etish** tugmalari bilan keladi (admin sahifada ham) |
| 4 | Server | Kod yaratiladi va **shu qurilmaga bogʻlanadi** — dastur ochiq boʻlsa 30 soniyada **oʻzi faollashadi** |
| 5 | Bot | Kodni zaxira sifatida xaridorga ham yuboradi (kerak boʻlsa qoʻlda kiritiladi) |

- **Uzaytirish:** faol tarif ustiga yangi kod faollashtirilsa, muddat joriy muddat ustiga qoʻshiladi.
- **Eslatma:** muddat tugashidan 3 kun oldin bot eslatadi (har soatda, `.github/workflows/remind.yml`).
- **💬 Admin bilan yozishma:** dasturdagi **✉ ADMIN** tugmasi (yangi javob kelsa yashil miltillaydi) → savol/taklif. Admin sahifada **💬 Xabarlar** boʻlimi; Telegram'da xabarga «Reply» qilsangiz ham javob dasturga boradi.
- Xato kod urinishlari: bitta IP dan 15 daqiqada 10 tadan ortigʻi bloklanadi.

Botdagi admin buyruqlari: `/kutilayotgan` · `/kod PR` · `/karta 8600123412341234 Ism Familiya`

## Xavfsizlik

- Sinov tugaganda chiroqlar **oʻchmaydi** — oxirgi holatda qoladi, faqat boshqaruv toʻxtaydi (spektakl oʻrtasida sahna qorongʻi boʻlib qolmasligi uchun).
- Litsenziya kompyuterning oʻzida tekshiriladi: sahnada internet uzilsa ham dastur ishlayveradi.
- Imzo kaliti D1 bazasida (`sn_kv`, `ed_private`). Bazani oʻchirmang.

© AZIMXODJAYEV. Barcha huquqlar himoyalangan.
