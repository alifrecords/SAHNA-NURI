// SAHNA NURI — uch til: o'zbek (asosiy), rus, ingliz.
// Dastur matnlari o'zbekcha yoziladi; bu modul ekrandagi matnni tanlangan tilga o'giradi
// (aniq moslik + qoliplar). Murakkab HTML bloklar data-i18n-html bilan to'liq almashtiriladi.
window.SNI18N = (() => {
  const LS = 'sn_lang';
  let lang = 'uz';
  try { lang = localStorage.getItem(LS) || 'uz'; } catch (_) {}
  if (!['uz', 'ru', 'en'].includes(lang)) lang = 'uz';

  // ---------- aniq moslik: o'zbekcha → [ruscha, inglizcha] ----------
  const D = {
    '1-bosish: tanlash · 2: belgilash · 3: ijroga (chiroqlar yonadi) · Ushlab sudrash: tartib': ['1-е нажатие: выбор · 2: отметка · 3: в работу (свет включается) · Перетаскивание: порядок', 'Click 1: select · 2: mark · 3: go live (lights change) · Drag: reorder'],
    'Sahna tanlanmagan: hozir yoniq turgan chiroqlar saqlanadi.': ['Сцена не выбрана: сохраняются горящие сейчас приборы.', 'No scene selected: the fixtures lit right now are saved.'],
    'Saqlash uchun holat yoʻq: sahnani tanlang yoki chiroqlarni yoqing': ['Нечего сохранять: выберите сцену или включите приборы', 'Nothing to save: pick a scene or turn fixtures on'],
    'Sudrab Banklar paneliga tashlang — bank sifatida saqlanadi': ['Перетащите на панель Банки — сохранится как банк', 'Drag onto the Banks panel to save as a bank'],
    'BANKLAR': ['БАНКИ', 'BANKS'],
    'Banklarni ochish / yopish': ['Открыть / закрыть банки', 'Open / close banks'],
    'Banklarni yopish': ['Закрыть банки', 'Close banks'],
    'Qidirish: nomi yoki papka…': ['Поиск: название или папка…', 'Search: name or folder…'],
    'Yangi bank nomi': ['Название нового банка', 'New bank name'],
    '+ BANK': ['+ БАНК', '+ BANK'],
    '↶ QAYTARISH': ['↶ ОТМЕНИТЬ', '↶ UNDO'],
    'Qaytarildi': ['Отменено', 'Undone'],
    'Mening banklarim': ['Мои банки', 'My banks'],
    'Umumiy': ['Общие', 'General'],
    'Hech narsa topilmadi': ['Ничего не найдено', 'Nothing found'],
    'Banklar yuklanmoqda…': ['Банки загружаются…', 'Loading banks…'],
    '⇩ FREESTYLER JOYLASHUVINI OLISH': ['⇩ РАССТАНОВКА ИЗ FREESTYLER', '⇩ IMPORT FREESTYLER LAYOUT'],
    'FreeStyler joylashuvi — chizma, metrdagi aniq oʻlchov emas. Beam/Front\'larni keyin sudrab yoki X/Y bilan aniqlashtiring.': ['Расстановка FreeStyler — схема, а не точные метры. Beam/Front потом уточните перетаскиванием или через X/Y.', 'The FreeStyler layout is a sketch, not exact metres. Refine Beams/Fronts later by dragging or with X/Y.'],
    'Chiroqlar FreeStyler X2 ekranidagi joylashuv boʻyicha planga qoʻyiladi': ['Приборы расставляются на плане как на экране FreeStyler X2', 'Fixtures are placed on the plan as on the FreeStyler X2 screen'],
    'FreeStyler joylashuviga mos chiroq topilmadi': ['Не найдено приборов из расстановки FreeStyler', 'No fixtures match the FreeStyler layout'],
    'Qaytaradigan joylashuv yoʻq': ['Нечего отменять', 'No layout to restore'],
    'Avvalgi joylashuv qaytarildi': ['Прежняя расстановка восстановлена', 'Previous layout restored'],
    'Boshqalar': ['Прочие', 'Other'],
    '◉ ANDIJAN SAHNASI: TOZA · asl suratga oʻtish': ['◉ СЦЕНА АНДИЖАНА: ЧИСТАЯ · перейти к фото', '◉ ANDIJAN STAGE: CLEAN · switch to photo'],
    '◉ ANDIJAN SAHNASI: ASL SURAT · toza sahnaga oʻtish': ['◉ СЦЕНА АНДИЖАНА: ФОТО · перейти к чистой', '◉ ANDIJAN STAGE: PHOTO · switch to clean'],
    'Toza sahna (dekoratsiyasiz) — faqat hajm va oʻlchamlar': ['Чистая сцена (без декораций) — только объём и размеры', 'Clean stage (no set) — only volume and dimensions'],
    'Asl surat (dekoratsiya bilan)': ['Исходное фото (с декорациями)', 'Original photo (with set)'],
    '◉ ANDIJAN SAHNASI SURATI (TAYYOR)': ['◉ ФОТО СЦЕНЫ АНДИЖАНА (ГОТОВО)', '◉ ANDIJAN STAGE PHOTO (READY)'],
    'Andijan sahnasi surati qoʻyildi — pol burchaklari moslangan. Kerak boʻlsa „4 BURCHAK“ bilan aniqlashtiring.': ['Фото сцены Андижана установлено — углы пола подогнаны. При необходимости уточните через «4 УГЛА».', 'Andijan stage photo set — floor corners matched. Refine with “4 CORNERS” if needed.'],
    'Bridge ishga tushirilmoqda…': ['Запуск Bridge…', 'Starting Bridge…'],
    'SAHNA NURI Bridge ishga tushirilmoqda… Brauzer „SahnaNuriBridge ochilsinmi?“ deb soʻrasa — Ochish (Открыть) ni bosing.': ['SAHNA NURI Bridge запускается… Если браузер спросит «Открыть SahnaNuriBridge?» — нажмите «Открыть».', 'Starting SAHNA NURI Bridge… If the browser asks “Open SahnaNuriBridge?”, click Open.'],
    'SAHNA NURI Bridge ishga tushmadi. Uni bir marta yuklab olib oching (YUKLAB OLISH .exe) — keyin BRIDGE ULASH oʻzi yoqadi.': ['SAHNA NURI Bridge не запустился. Скачайте и откройте его один раз (YUKLAB OLISH .exe) — дальше BRIDGE ULASH будет запускать его сам.', 'SAHNA NURI Bridge did not start. Download and open it once (YUKLAB OLISH .exe) — after that BRIDGE ULASH starts it by itself.'],
    'FreeStyler ochiq — kabel unga berilgan. FreeStyler’ni yopsangiz, pult oʻzi davom etadi.': ['FreeStyler открыт — кабель отдан ему. Закройте FreeStyler, и пульт продолжит сам.', 'FreeStyler is open — the cable is handed to it. Close FreeStyler and the console resumes by itself.'],
    'Ochiq': ['Открыто', 'Open'],
    'Nuqta': ['Точка', 'Dot'],
    'Halqa': ['Кольцо', 'Ring'],
    '2 halqa': ['2 кольца', '2 rings'],
    '8 nuqta': ['8 точек', '8 dots'],
    'Nuqtalar': ['Точки', 'Dots'],
    'Yulduz': ['Звезда', 'Star'],
    'Yulduz 8': ['Звезда 8', 'Star 8'],
    'Uchburchak': ['Треугольник', 'Triangle'],
    '3 uchburchak': ['3 треугольника', '3 triangles'],
    'Kvadrat': ['Квадрат', 'Square'],
    'Xoch': ['Крест', 'Cross'],
    '3 chiziq': ['3 полосы', '3 bars'],
    'Nurlar': ['Лучи', 'Rays'],
    'Nurlar 24': ['Лучи 24', 'Rays 24'],
    'Gul': ['Цветок', 'Flower'],
    'Spiral': ['Спираль', 'Spiral'],
    'Oy': ['Луна', 'Moon'],
    'Yulduzcha': ['Звёздочка', 'Small star'],
    'Silkinish?': ['Тряска?', 'Shake?'],
    'Aylanish?': ['Вращение?', 'Scroll?'],
    'Gul 8': ['Цветок 8', 'Flower 8'],
    'Olti burchak': ['Шестиугольник', 'Hexagon'],
    'Panjara': ['Решётка', 'Grid'],
    'Parrak': ['Пропеллер', 'Windmill'],
    'Barglar': ['Листья', 'Leaves'],
    'Uchb. halqa': ['Треуг. в кольце', 'Ring triangle'],
    '4 kvadrat': ['4 квадрата', '4 squares'],
    'Shaxmat': ['Шахматы', 'Checker'],
    '3 nur': ['3 луча', '3 rays'],
    'Koʻz': ['Глаз', 'Eye'],
    'Pufakcha': ['Пузыри', 'Bubbles'],
    'Halqa+nuqta': ['Кольцо+точки', 'Ring+dots'],
    'Nuqta maydon': ['Поле точек', 'Dot field'],
    'Gobo': ['Гобо', 'Gobo'],
    'Bosib turing — rasmni almashtirish': ['Удерживайте — сменить картинку', 'Hold to change the picture'],
    'ASLIGA QAYTARISH': ['ВЕРНУТЬ ИСХОДНОЕ', 'RESET'],
    'BEKOR': ['ОТМЕНА', 'CANCEL'],
    'Gobo rasmi saqlandi': ['Картинка гобо сохранена', 'Gobo picture saved'],
    'Asl rasmga qaytarildi': ['Исходная картинка возвращена', 'Original picture restored'],
    'Spektakllar · fevral 2026': ['Спектакли · февраль 2026', 'Shows · February 2026'],
    'Bank nomini yozing': ['Введите название банка', 'Type a bank name'],
    'Oʻchirish': ['Удалить', 'Delete'],
    'Saqlanadi: programmerdagi oʻzgarishlar, ular boʻlmasa — sahnadagi hozirgi holat.': ['Сохраняется: изменения в программере, а если их нет — текущее состояние сцены.', 'Saves the programmer changes, or the current stage look if there are none.'],
    'Saqlash uchun holat yoʻq: chiroqlarni yoqing yoki sahnani tanlang': ['Нечего сохранять: включите приборы или выберите сцену', 'Nothing to save: turn fixtures on or pick a scene'],
    'Programmerni ochish / yopish': ['Открыть / закрыть программер', 'Open / close the programmer'],
    'Programmerni yopish': ['Закрыть программер', 'Close the programmer'],
    'Sudrab chiroqlar maydonini kattalashtiring yoki kichiklashtiring': ['Тяните, чтобы увеличить или уменьшить область приборов', 'Drag to widen or narrow the fixtures area'],
    'Chiroqlar maydoni enini oʻzgartirish': ['Изменить ширину области приборов', 'Resize the fixtures area'],
    '✎ Faqat shu chiroq sozlanmoqda · yana bosilsa — tanlovdan olinadi': ['✎ Настраивается только этот прибор · ещё нажатие — снять выбор', '✎ Editing this fixture only · click again to deselect'],
    '✎ AVTO-SAQLASH: YOQIQ': ['✎ АВТОСОХРАНЕНИЕ: ВКЛ', '✎ AUTO-SAVE: ON'],
    '✎ AVTO-SAQLASH: OʻCHIQ': ['✎ АВТОСОХРАНЕНИЕ: ВЫКЛ', '✎ AUTO-SAVE: OFF'],
    'Sahna almashtirilganda unga qilingan oʻzgarishlar oʻsha sahnaga avtomatik yoziladi': ['При смене сцены сделанные изменения автоматически записываются в неё', 'When you switch scenes, your changes are saved into the scene you left'],
    'Avto-saqlash yoqildi: sahna almashganda oʻzgarishlar oʻsha sahnaga yoziladi': ['Автосохранение включено: при смене сцены изменения записываются в неё', 'Auto-save on: changes are saved into the scene when you switch'],
    'Avto-saqlash oʻchdi: oʻzgarishlar programmerda qoladi (YANGILASH bilan yozasiz)': ['Автосохранение выключено: изменения остаются в программере (запишите кнопкой ОБНОВИТЬ)', 'Auto-save off: changes stay in the programmer (write them with UPDATE)'],
    '▦ TEPADAN · PLAN': ['▦ СВЕРХУ · ПЛАН', '▦ TOP · PLAN'],
    '◉ ROʻPARADAN · OPERATOR KOʻZI': ['◉ ИЗ ЗАЛА · ГЛАЗАМИ ОПЕРАТОРА', '◉ FRONT · OPERATOR VIEW'],
    'TOʻR: YOQIQ': ['СЕТКА: ВКЛ', 'GRID: ON'], 'TOʻR: OʻCHIQ': ['СЕТКА: ВЫКЛ', 'GRID: OFF'],
    'Surat yorqinligi': ['Яркость фото', 'Photo brightness'],
    'NISHON BALANDLIGI': ['ВЫСОТА ЦЕЛИ', 'TARGET HEIGHT'],
    'POL': ['ПОЛ', 'FLOOR'], 'BEL · 1 m': ['ПОЯС · 1 м', 'WAIST · 1 m'], 'YUZ · 1.6 m': ['ЛИЦО · 1,6 м', 'FACE · 1.6 m'],
    'SAHNA SURATINI YUKLASH': ['ЗАГРУЗИТЬ ФОТО СЦЕНЫ', 'UPLOAD STAGE PHOTO'],
    'SAHNA · ROʻPARADAN · SURAT': ['СЦЕНА · ИЗ ЗАЛА · ФОТО', 'STAGE · FRONT · PHOTO'],
    'SAHNA · ROʻPARADAN · NAMUNA (surat yuklang)': ['СЦЕНА · ИЗ ЗАЛА · ОБРАЗЕЦ (загрузите фото)', 'STAGE · FRONT · SAMPLE (upload a photo)'],
    'Suratdagi sahna poliga bosing — tanlangan moving head’lar shu nuqtaga buriladi. Bosib turib sudrasangiz, nurlar ergashadi. Chiroqni tanlash: belgisini bosing.': ['Нажмите на пол сцены на фото — выбранные moving head повернутся в эту точку. Тяните, не отпуская, — лучи следуют. Выбор прибора — нажмите его значок.', 'Click the stage floor in the photo — selected moving heads turn to that point. Drag to make the beams follow. Select a fixture by clicking its icon.'],
    'Chiroq belgilarini suratdagi haqiqiy joyiga sudrab qoʻying (faqat koʻrinish uchun). Yoʻnaltirish aniqligi uchun chiroqning X, Y va balandligini oʻngda yozing yoki „Tepadan“ planda joylang.': ['Перетащите значки приборов на их реальные места на фото (только для вида). Для точного наведения укажите X, Y и высоту справа или расставьте на плане «Сверху».', 'Drag fixture icons to their real places in the photo (display only). For accurate aiming set X, Y and height on the right or place them on the Top plan.'],
    '1) Bitta moving head tanlang. 2) Pan/Tilt slayderlari bilan nurni poldagi belgiga tushiring. 3) Suratda oʻsha joyni bosing. 3–4 nuqta yetarli.': ['1) Выберите один moving head. 2) Слайдерами Pan/Tilt наведите луч на метку на полу. 3) Нажмите это место на фото. Достаточно 3–4 точек.', '1) Select one moving head. 2) Use the Pan/Tilt sliders to put the beam on a floor mark. 3) Click that spot in the photo. 3–4 points are enough.'],
    'Surat yuklandi. Endi sahna POLINING 4 burchagini belgilang.': ['Фото загружено. Теперь отметьте 4 угла ПОЛА сцены.', 'Photo uploaded. Now mark the 4 corners of the stage FLOOR.'],
    'OLDI': ['АВАНСЦЕНА', 'FRONT'], 'ORQA': ['ЗАДНИК', 'BACK'],
    '◀ TOMOSHABIN CHAPI': ['◀ СЛЕВА ИЗ ЗАЛА', '◀ AUDIENCE LEFT'], 'TOMOSHABIN OʻNGI ▶': ['СПРАВА ИЗ ЗАЛА ▶', 'AUDIENCE RIGHT ▶'],
    'CHIROQ SOZLAMALARI': ['НАСТРОЙКИ ПРИБОРА', 'FIXTURE SETTINGS'],
    'Chiroq sozlamalarini ochish / yopish': ['Открыть / закрыть настройки прибора', 'Open / close fixture settings'],
    'Oldingi chiroq': ['Предыдущий прибор', 'Previous fixture'],
    'Keyingi chiroq': ['Следующий прибор', 'Next fixture'],
    'Yopish': ['Закрыть', 'Close'],
    'Chiroq tanlanmagan': ['Прибор не выбран', 'No fixture selected'],
    'Chap tomondagi istalgan chiroqni bosing — uning barcha kanallari shu yerda ochiladi.': ['Нажмите любой прибор слева — здесь откроются все его каналы.', 'Click any fixture on the left — all its channels open here.'],
    'Bu chiroq tanlanmagan — oʻzgarish faqat unga': ['Прибор не выбран — изменение только для него', 'This fixture isn’t selected — changes apply to it only'],
    'YORITISH': ['ОСВЕТИТЬ', 'HIGHLIGHT'],
    'TOZALASH': ['ОЧИСТИТЬ', 'CLEAR'],
    'MARKAZ': ['ЦЕНТР', 'CENTER'],
    'Oʻzgarishlar programmerga tushadi — CUE YOZISH yoki YANGILASH bosilsa, sahnaga yoziladi. Ingichka yashil chiziq — chiroqqa hozir ketayotgan haqiqiy qiymat.': ['Изменения идут в программер — по ЗАПИСАТЬ CUE или ОБНОВИТЬ они записываются в сцену. Тонкая зелёная полоса — реальное значение, идущее на прибор.', 'Changes go to the programmer — RECORD CUE or UPDATE writes them into the scene. The thin green line is the real value sent to the fixture.'],
    'Oʻz holiga qaytarish': ['Вернуть как было', 'Release'],
    'yorqinlik': ['яркость', 'intensity'], 'qizil': ['красный', 'red'], 'yashil': ['зелёный', 'green'], 'koʻk': ['синий', 'blue'], 'oq': ['белый', 'white'],
    'pan aniq': ['pan точно', 'pan fine'], 'tilt aniq': ['tilt точно', 'tilt fine'], 'shutter': ['шторка', 'shutter'], 'rang gʻild.': ['колесо цв.', 'color wheel'], 'kanal': ['канал', 'channel'],
    'KANAL SINOVI': ['ТЕСТ КАНАЛОВ', 'CHANNEL TEST'],
    'Chiroq': ['Прибор', 'Fixture'],
    'HAMMASINI QOʻYIB YUBORISH': ['ОТПУСТИТЬ ВСЁ', 'RELEASE ALL'],
    'PROFILGA': ['В ПРОФИЛЬ', 'TO PROFILE'],
    'Har bir kanalni alohida surib, sahnada natijani koʻring': ['Двигайте каждый канал отдельно и смотрите результат на сцене', 'Move each channel separately and watch the result on stage'],
    'Kanal sinovi tugadi — qiymatlar qoʻyib yuborildi': ['Тест каналов завершён — значения отпущены', 'Channel test ended — values released'],
    'Barcha kanallar qoʻyib yuborildi': ['Все каналы отпущены', 'All channels released'],
    '🔒 QULFLANGAN': ['🔒 ЗАБЛОКИРОВАН', '🔒 LOCKED'],
    '🔓 QULF OCHIQ': ['🔓 РАЗБЛОКИРОВАН', '🔓 UNLOCKED'],
    'TIKLASH': ['ВОССТАНОВИТЬ', 'RESTORE'],
    '🔒 Patch qulflangan: chiroqlarni oʻchirib, nomi, profili yoki manzilini oʻzgartirib boʻlmaydi. Oʻzgartirish uchun qulfni oching.': ['🔒 Патч заблокирован: приборы нельзя удалить, переименовать, сменить профиль или адрес. Для изменений разблокируйте.', '🔒 Patch is locked: fixtures can’t be deleted, renamed or re-addressed. Unlock to make changes.'],
    '🔒 Patch qulflangan': ['🔒 Патч заблокирован', '🔒 Patch is locked'],
    '🔒 Patch qulflandi': ['🔒 Патч заблокирован', '🔒 Patch locked'],
    '🔓 Qulf ochildi. Ish tugagach yana qulflang.': ['🔓 Разблокировано. После работы заблокируйте снова.', '🔓 Unlocked. Lock it again when done.'],
    'Patch qulfi ochilsinmi? Chiroqlarni oʻchirish va oʻzgartirish mumkin boʻladi. Tasdiqlash uchun yana bir marta bosing.': ['Разблокировать патч? Приборы можно будет удалять и менять. Нажмите ещё раз для подтверждения.', 'Unlock the patch? Fixtures can then be deleted and changed. Click again to confirm.'],
    '⬇ ILOVA': ['⬇ ПРИЛОЖЕНИЕ', '⬇ APP'],
    'Kompyuter yoki telefonga ilova sifatida oʻrnatish': ['Установить как приложение на компьютер или телефон', 'Install as an app on a computer or phone'],
    'Ilova sifatida oʻrnatish': ['Установка как приложения', 'Install as an app'],
    'HOZIR OʻRNATISH': ['УСТАНОВИТЬ СЕЙЧАС', 'INSTALL NOW'],
    // yuqori panel va bo'limlar
    'DMX yorugʻlik boshqaruvi': ['DMX-управление светом', 'DMX lighting control'],
    'Spektakl:': ['Спектакль:', 'Show:'],
    'Spektakl nomi': ['Название спектакля', 'Show name'],
    'DMX ulanmagan': ['DMX не подключён', 'DMX not connected'],
    'DMX: xato': ['DMX: ошибка', 'DMX: error'],
    'Tekshirilmoqda…': ['Проверка…', 'Checking…'],
    'SAQLASH': ['СОХРАНИТЬ', 'SAVE'],
    'SAQLANDI': ['СОХРАНЕНО', 'SAVED'],
    'BLACKOUT FAOL': ['BLACKOUT ВКЛ', 'BLACKOUT ON'],
    'Boʻlimlar': ['Разделы', 'Sections'],
    'Pult': ['Пульт', 'Console'],
    'Sahna': ['Сцена', 'Stage'],
    'Patch (chiroqlar)': ['Патч (приборы)', 'Patch (fixtures)'],
    'Profillar': ['Профили', 'Profiles'],
    'Ulanish': ['Подключение', 'Connection'],
    'Monitor': ['Монитор', 'Monitor'],
    'Probel — GO · B — Blackout · Esc — Release': ['Пробел — GO · B — Blackout · Esc — Release', 'Space — GO · B — Blackout · Esc — Release'],
    'Probel': ['Пробел', 'Space'],
    'Server ulangan': ['Сервер подключён', 'Server connected'],
    'Server bilan aloqa yoʻq': ['Нет связи с сервером', 'No server connection'],
    // pult
    'CHIROQLAR': ['ПРИБОРЫ', 'FIXTURES'],
    'Hammasi': ['Все', 'All'],
    'Tozalash': ['Сброс', 'Clear'],
    'Beamlar': ['Бимы', 'Beams'],
    'Panellar': ['Панели', 'Panels'],
    'PARlar': ['PAR-ы', 'PARs'],
    'Barlar': ['Бары', 'Bars'],
    'Front': ['Фронт', 'Front'],
    'Dimmer': ['Диммер', 'Dimmer'],
    'Boshqa': ['Другие', 'Other'],
    'Chiroqlar yoʻq. Patch boʻlimida qoʻshing.': ['Приборов нет. Добавьте в разделе «Патч».', 'No fixtures. Add them in the Patch section.'],
    'Chiroqlar yoʻq': ['Приборов нет', 'No fixtures'],
    'CUE ROʻYXATI': ['СПИСОК CUE', 'CUE LIST'],
    'NOMI': ['НАЗВАНИЕ', 'NAME'],
    'FADE (s)': ['FADE (с)', 'FADE (s)'],
    'HOLAT': ['СТАТУС', 'STATUS'],
    'IJRODA': ['ИДЁТ', 'LIVE'],
    'AVTO (daq:son)': ['АВТО (мин:сек)', 'AUTO (min:sec)'],
    'AVTO YOQIQ': ['АВТО ВКЛ', 'AUTO ON'],
    'Toq': ['Нечёт', 'Odd'], 'Juft': ['Чёт', 'Even'], '1-yarmi': ['1-я половина', '1st half'], '2-yarmi': ['2-я половина', '2nd half'],
    'Tanlovni ajratish': ['Разделить выбор', 'Split selection'],
    'Tanlanganlardan 1, 3, 5…': ['Из выбранных: 1, 3, 5…', 'From selection: 1, 3, 5…'],
    'Tanlanganlardan 2, 4, 6…': ['Из выбранных: 2, 4, 6…', 'From selection: 2, 4, 6…'],
    'Tanlanganlarning birinchi yarmi': ['Первая половина выбранных', 'First half of the selection'],
    'Tanlanganlarning ikkinchi yarmi': ['Вторая половина выбранных', 'Second half of the selection'],
    'Boʻlish (tanlangan chiroqlarni)': ['Разделить (выбранные приборы)', 'Split (selected fixtures)'],
    'Chap | Oʻng': ['Лево | Право', 'Left | Right'], 'Toq | Juft': ['Нечёт | Чёт', 'Odd | Even'],
    'Yelpigʻich': ['Веер', 'Fan'], 'Kesishish': ['Крест', 'Cross'],
    'QORONGʻIDA BURILISH YOQIQ': ['ПОВОРОТ В ТЕМНОТЕ ВКЛ', 'MOVE IN BLACK ON'],
    'QORONGʻIDA BURILISH OʻCHIQ': ['ПОВОРОТ В ТЕМНОТЕ ВЫКЛ', 'MOVE IN BLACK OFF'],
    'Burilish vaqti': ['Время поворота', 'Move time'],
    'Moving head yangi joyiga qorongʻida boradi, keyin cue fade’i bilan yonadi': ['Moving head идёт на новую позицию в темноте, затем загорается по fade cue', 'Moving heads travel to their new position dark, then fade in with the cue fade'],
    'Moving head’lar qorongʻida buriladi, keyin fade bilan yonadi': ['Moving head поворачиваются в темноте, затем загораются по fade', 'Moving heads move dark, then fade in'],
    'Qorongʻida burilish oʻchirildi: nur yonib turgan holda buriladi': ['Поворот в темноте выключен: луч движется включённым', 'Move in black off: beams move while lit'],
    'AVTO OʻCHIQ': ['АВТО ВЫКЛ', 'AUTO OFF'],
    'qoʻlda': ['вручную', 'manual'],
    'Avtomatik oʻtish vaqti (daqiqa:soniya)': ['Время автоперехода (мин:сек)', 'Auto-follow time (min:sec)'],
    'Avtomatik oʻtishgacha': ['До автоперехода', 'Until auto-follow'],
    'Vaqtni daq:son koʻrinishida yozing, masalan 1:30': ['Введите время в формате мин:сек, например 1:30', 'Enter time as min:sec, e.g. 1:30'],
    'Avtomatik oʻtish yoqildi': ['Автопереход включён', 'Auto-follow on'],
    'Avtomatik oʻtish oʻchirildi — faqat GO bilan': ['Автопереход выключен — только по GO', 'Auto-follow off — GO only'],
    'KEYINGI': ['СЛЕДУЮЩИЙ', 'NEXT'],
    'PAUZA': ['ПАУЗА', 'PAUSE'],
    'Hali cue yoʻq. Chiroqlarni tanlab, rang va intensivlik bering, keyin „CUE YOZISH“ ni bosing.': ['Cue пока нет. Выберите приборы, задайте цвет и яркость и нажмите «ЗАПИСАТЬ CUE».', 'No cues yet. Select fixtures, set colour and intensity, then press “RECORD CUE”.'],
    'CUE YOZISH': ['ЗАПИСАТЬ CUE', 'RECORD CUE'],
    'YANGILASH': ['ОБНОВИТЬ', 'UPDATE'],
    'OʻCHIRISH': ['УДАЛИТЬ', 'DELETE'],
    'SAHNANI OʻCHIRISH': ['ПОГАСИТЬ СЦЕНУ', 'FADE OUT STAGE'],
    'ORQAGA': ['НАЗАД', 'BACK'],
    'Cue nomi': ['Название cue', 'Cue name'],
    'Fade soniya': ['Fade, секунды', 'Fade seconds'],
    'PROGRAMMER': ['ПРОГРАММЕР', 'PROGRAMMER'],
    'Intensivlik': ['Яркость', 'Intensity'],
    'Rang': ['Цвет', 'Colour'],
    'Pozitsiya': ['Позиция', 'Position'],
    'Effekt': ['Эффект', 'Effect'],
    'PROGRAMMERNI TOZALASH': ['ОЧИСТИТЬ ПРОГРАММЕР', 'CLEAR PROGRAMMER'],
    'Qizil': ['Красный', 'Red'], 'Toʻq sariq': ['Оранжевый', 'Orange'], 'Sariq': ['Жёлтый', 'Yellow'],
    'Yashil': ['Зелёный', 'Green'], 'Koʻk': ['Синий', 'Blue'], 'Binafsha': ['Фиолетовый', 'Purple'],
    'Pushti': ['Розовый', 'Pink'], 'Oq': ['Белый', 'White'], 'Iliq oq': ['Тёплый белый', 'Warm white'],
    'Markaz': ['Центр', 'Centre'], 'Chap': ['Слева', 'Left'], 'Oʻng': ['Справа', 'Right'],
    'Tomoshabin': ['Зритель', 'Audience'], 'Shift': ['Потолок', 'Ceiling'], 'Pol': ['Пол', 'Floor'],
    'Chase': ['Чейз', 'Chase'], 'Strob': ['Строб', 'Strobe'], 'Puls': ['Пульс', 'Pulse'],
    'Kamalak': ['Радуга', 'Rainbow'], 'Doira': ['Круг', 'Circle'], 'Toʻlqin': ['Волна', 'Wave'],
    'PLAYBACK FADERLAR': ['PLAYBACK ФЕЙДЕРЫ', 'PLAYBACK FADERS'],
    'Faderni suring · FLASH bosib turilganda guruh toʻliq yonadi': ['Двигайте фейдер · пока FLASH нажат, группа горит на 100%', 'Move the fader · hold FLASH to bring the group to full'],
    'FX tezlik': ['Скорость FX', 'FX speed'],
    'Programmer tozalandi': ['Программер очищен', 'Programmer cleared'],
    'Avval chiroq tanlang': ['Сначала выберите прибор', 'Select a fixture first'],
    'Effekt uchun avval chiroq tanlang': ['Для эффекта сначала выберите приборы', 'Select fixtures for the effect first'],
    'Roʻyxat oxiri': ['Конец списка', 'End of list'],
    'Avval cue yozing': ['Сначала запишите cue', 'Record a cue first'],
    'Yangilash uchun avval cue’ni ijro eting': ['Чтобы обновить, сначала запустите cue', 'Run a cue before updating it'],
    'Sahna 2 soniyada oʻchmoqda': ['Сцена гаснет за 2 секунды', 'Stage fading out over 2 seconds'],
    // patch
    'PATCH · CHIROQLAR VA DMX MANZILLAR': ['ПАТЧ · ПРИБОРЫ И DMX-АДРЕСА', 'PATCH · FIXTURES AND DMX ADDRESSES'],
    'Nomi': ['Название', 'Name'], 'Profil': ['Профиль', 'Profile'], 'Manzil': ['Адрес', 'Address'],
    'Kanal': ['Каналы', 'Channels'], 'Oraliq': ['Диапазон', 'Range'],
    'DMX manzil': ['DMX-адрес', 'DMX address'], 'Oʻchirish': ['Удалить', 'Delete'],
    'CHIROQ QOʻSHISH': ['ДОБАВИТЬ ПРИБОР', 'ADD FIXTURE'],
    'Soni': ['Количество', 'Quantity'],
    'masalan: Beam': ['например: Beam', 'e.g. Beam'],
    'Boshlangʻich manzil': ['Начальный адрес', 'Start address'],
    'QOʻSHISH': ['ДОБАВИТЬ', 'ADD'],
    'MANZILLARNI KETMA-KET QOʻYISH': ['РАССТАВИТЬ АДРЕСА ПОДРЯД', 'AUTO-ADDRESS IN ORDER'],
    'ANDIJON TEATRI · 35 TA CHIROQ': ['АНДИЖАНСКИЙ ТЕАТР · 35 ПРИБОРОВ', 'ANDIJAN THEATER · 35 FIXTURES'],
    'LOYIHA FAYLI': ['ФАЙЛ ПРОЕКТА', 'PROJECT FILE'],
    'KOMPYUTERGA YUKLAB OLISH (.json)': ['СКАЧАТЬ НА КОМПЬЮТЕР (.json)', 'DOWNLOAD TO COMPUTER (.json)'],
    'FAYLDAN OCHISH': ['ОТКРЫТЬ ИЗ ФАЙЛА', 'OPEN FROM FILE'],
    'Manzillar ketma-ket qoʻyildi': ['Адреса расставлены подряд', 'Addresses assigned in order'],
    'Diqqat: kanallar 512 dan oshdi': ['Внимание: каналов больше 512', 'Warning: more than 512 channels'],
    'Bu SAHNA NURI fayli emas': ['Это не файл SAHNA NURI', 'This is not a SAHNA NURI file'],
    // profillar
    'PROFILLAR': ['ПРОФИЛИ', 'PROFILES'],
    '+ YANGI PROFIL': ['+ НОВЫЙ ПРОФИЛЬ', '+ NEW PROFILE'],
    'Profil — chiroqning „lugʻati“: qaysi kanal intensivlik, qaysi biri rang yoki pan ekanini bildiradi. Chiroq qoʻllanmasidagi DMX jadvalga moslang.': ['Профиль — «словарь» прибора: какой канал отвечает за яркость, цвет или pan. Сверьте с DMX-таблицей из инструкции прибора.', 'A profile is the fixture’s “dictionary”: which channel is intensity, colour or pan. Match it to the DMX chart in the fixture manual.'],
    'PROFILNI TAHRIRLASH': ['РЕДАКТИРОВАНИЕ ПРОФИЛЯ', 'EDIT PROFILE'],
    'Guruh (fader)': ['Группа (фейдер)', 'Group (fader)'],
    'Vazifasi': ['Функция', 'Function'],
    'Standart qiymat': ['Значение по умолчанию', 'Default value'],
    '+ KANAL': ['+ КАНАЛ', '+ CHANNEL'],
    'NUSXA OLISH': ['КОПИРОВАТЬ', 'DUPLICATE'],
    'PROFILNI OʻCHIRISH': ['УДАЛИТЬ ПРОФИЛЬ', 'DELETE PROFILE'],
    'RANG GʻILDIRAGI QIYMATLARI (0–255)': ['ЗНАЧЕНИЯ ЦВЕТОВОГО КОЛЕСА (0–255)', 'COLOUR WHEEL VALUES (0–255)'],
    '„Shutter / Strob“ uchun standart qiymat — chiroq yorugʻlik chiqaradigan „ochiq“ holat. Chiroq yonmasa, qoʻllanmadan shu qiymatni tekshiring.': ['Значение по умолчанию для «Shutter / Строб» — «открытое» состояние, когда прибор светит. Если прибор не светит, проверьте это значение по инструкции.', 'The default for “Shutter / Strobe” is the “open” state where the fixture emits light. If it stays dark, check this value in the manual.'],
    'Pan diapazoni (°)': ['Диапазон pan (°)', 'Pan range (°)'],
    'Tilt diapazoni (°)': ['Диапазон tilt (°)', 'Tilt range (°)'],
    'Qoʻllanmada yozilgan toʻliq burilish burchagi. Sahna boʻlimida nurni aniq yoʻnaltirish shunga bogʻliq.': ['Полный угол поворота из инструкции. От него зависит точное наведение луча в разделе «Сцена».', 'Full rotation angle from the manual. Accurate aiming in the Stage section depends on it.'],
    'Kanalni oʻchirish': ['Удалить канал', 'Delete channel'],
    'Bu profilda chiroqlar bor. Avval ularni boshqa profilga oʻtkazing.': ['В этом профиле есть приборы. Сначала переведите их на другой профиль.', 'Fixtures use this profile. Move them to another profile first.'],
    'Yangi profil': ['Новый профиль', 'New profile'],
    'Intensivlik (dimmer)': ['Яркость (диммер)', 'Intensity (dimmer)'], 'Qizil (R)': ['Красный (R)', 'Red (R)'],
    'Yashil (G)': ['Зелёный (G)', 'Green (G)'], 'Koʻk (B)': ['Синий (B)', 'Blue (B)'], 'Oq (W)': ['Белый (W)', 'White (W)'],
    'Shutter / Strob': ['Shutter / Строб', 'Shutter / Strobe'], 'Rang gʻildiragi': ['Цветовое колесо', 'Colour wheel'],
    'Doimiy qiymat': ['Постоянное значение', 'Fixed value'],
    'Dimmer blok': ['Диммерный блок', 'Dimmer pack'],
    // ulanish
    'DMX ULANISH': ['DMX-ПОДКЛЮЧЕНИЕ', 'DMX CONNECTION'],
    'SAHNA NURI Bridge': ['SAHNA NURI Bridge', 'SAHNA NURI Bridge'],
    'TAVSIYA': ['РЕКОМЕНДУЕТСЯ', 'RECOMMENDED'],
    'Kompyuterga bir marta oʻrnatiladigan kichik dastur. Drayver almashtirish (Zadig) shart emas — FreeStyler drayveri bilan ishlaydi. Windows bilan oʻzi yonmaydi: BRIDGE ULASH bosilganda ishga tushadi. Pult yopilsa yoki FreeStyler ochilsa — kabelni boʻshatadi.': ['Небольшая программа, устанавливается один раз. Менять драйвер (Zadig) не нужно — работает с драйвером FreeStyler. С Windows сама не запускается: стартует по кнопке BRIDGE ULASH. Если пульт закрыт или открыт FreeStyler — освобождает кабель.', 'A small program installed once. No driver swap (Zadig) needed — it works with the FreeStyler driver. It does not start with Windows: it launches when you press BRIDGE ULASH. When the console is closed or FreeStyler is open, it frees the cable.'],
    'YUKLAB OLISH (.exe)': ['СКАЧАТЬ (.exe)', 'DOWNLOAD (.exe)'],
    'BRIDGE ULASH': ['ПОДКЛЮЧИТЬ BRIDGE', 'CONNECT BRIDGE'],
    'SAHNA NURI Bridge · uDMX': ['SAHNA NURI Bridge · uDMX', 'SAHNA NURI Bridge · uDMX'],
    'SAHNA NURI Bridge ishlamayapti. Uni yuklab olib, bir marta ishga tushiring.': ['SAHNA NURI Bridge не запущен. Скачайте и запустите его один раз.', 'SAHNA NURI Bridge is not running. Download it and run it once.'],
    'Bridge ishlayapti, lekin uDMX kabel topilmadi. Kabelni tekshiring — ulanishi bilan oʻzi davom etadi.': ['Bridge работает, но кабель uDMX не найден. Проверьте кабель — после подключения работа продолжится сама.', 'Bridge is running but the uDMX cable was not found. Check the cable — it resumes by itself once connected.'],
    'SAHNA NURI Bridge bilan aloqa uzildi — qayta ulanmoqda…': ['Связь с SAHNA NURI Bridge потеряна — переподключение…', 'Lost connection to SAHNA NURI Bridge — reconnecting…'],
    'Anyma uDMX va klonlari (kumush USB → XLR kabel). Teatrdagi kabelingiz shu turda.': ['Anyma uDMX и клоны (серебристый кабель USB → XLR). Ваш театральный кабель этого типа.', 'Anyma uDMX and clones (silver USB → XLR cable). Your theatre cable is this type.'],
    'uDMX ULASH': ['ПОДКЛЮЧИТЬ uDMX', 'CONNECT uDMX'],
    'Enttec Pro, DMXKing ultraDMX, Eurolite USB-DMX512 PRO va mos klonlar.': ['Enttec Pro, DMXKing ultraDMX, Eurolite USB-DMX512 PRO и совместимые клоны.', 'Enttec Pro, DMXKing ultraDMX, Eurolite USB-DMX512 PRO and compatible clones.'],
    'PRO ULASH': ['ПОДКЛЮЧИТЬ PRO', 'CONNECT PRO'],
    'Enttec Open DMX va FTDI chipli arzon kabellar.': ['Enttec Open DMX и недорогие кабели на чипе FTDI.', 'Enttec Open DMX and low-cost FTDI-chip cables.'],
    'OPEN DMX ULASH': ['ПОДКЛЮЧИТЬ OPEN DMX', 'CONNECT OPEN DMX'],
    'Simulyatsiya': ['Симуляция', 'Simulation'],
    'Qurilmasiz ishlash: cue yozish va mashq qilish uchun. Signal faqat Monitor’da koʻrinadi.': ['Работа без устройства: для записи cue и репетиций. Сигнал виден только в Мониторе.', 'Work without hardware: for recording cues and practice. The signal is shown only in Monitor.'],
    'SIMULYATSIYA': ['СИМУЛЯЦИЯ', 'SIMULATION'],
    'Simulyatsiya (qurilmasiz)': ['Симуляция (без устройства)', 'Simulation (no hardware)'],
    'SINOV SIGNALI (2 s)': ['ТЕСТОВЫЙ СИГНАЛ (2 с)', 'TEST SIGNAL (2 s)'],
    'UZISH': ['ОТКЛЮЧИТЬ', 'DISCONNECT'],
    'MONITORNI OCHISH': ['ОТКРЫТЬ МОНИТОР', 'OPEN MONITOR'],
    'BIRINCHI MARTA ULASH (WINDOWS · uDMX)': ['ПЕРВОЕ ПОДКЛЮЧЕНИЕ (WINDOWS · uDMX)', 'FIRST-TIME SETUP (WINDOWS · uDMX)'],
    'Ulanmagan': ['Не подключено', 'Not connected'],
    'Uzildi': ['Отключено', 'Disconnected'],
    'Avval qurilmani ulang': ['Сначала подключите устройство', 'Connect a device first'],
    'Sinov: barcha chiroqlar 2 soniya toʻliq yonadi': ['Тест: все приборы горят на 100% 2 секунды', 'Test: all fixtures at full for 2 seconds'],
    "uDMX ochilmadi. Windows'da qurilma drayveri WinUSB bo'lishi kerak (Zadig dasturi bilan almashtiriladi). FreeStyler ochiq bo'lsa, uni yoping.": ['uDMX не открылся. В Windows драйвер устройства должен быть WinUSB (меняется программой Zadig). Если открыт FreeStyler, закройте его.', 'uDMX could not be opened. On Windows the device driver must be WinUSB (switch it with Zadig). If FreeStyler is open, close it.'],
    'Port band: boshqa dastur (FreeStyler) ishlatyapti. Uni yopib qayta urining.': ['Порт занят другой программой (FreeStyler). Закройте её и попробуйте снова.', 'Port is busy: another program (FreeStyler) is using it. Close it and try again.'],
    'Qurilma tanlanmadi.': ['Устройство не выбрано.', 'No device selected.'],
    "Bu brauzer USB'ni qo'llamaydi. Kompyuterda Chrome yoki Edge'dan oching.": ['Этот браузер не поддерживает USB. Откройте в Chrome или Edge на компьютере.', 'This browser does not support USB. Open it in Chrome or Edge on a computer.'],
    "Bu brauzer Serial portni qo'llamaydi. Kompyuterda Chrome yoki Edge'dan oching.": ['Этот браузер не поддерживает Serial-порт. Откройте в Chrome или Edge на компьютере.', 'This browser does not support Serial ports. Open it in Chrome or Edge on a computer.'],
    'uDMX kabeli chiqarib olindi.': ['Кабель uDMX отключён.', 'The uDMX cable was unplugged.'],
    // monitor
    'DMX MONITOR · UNIVERSE 1': ['DMX-МОНИТОР · UNIVERSE 1', 'DMX MONITOR · UNIVERSE 1'],
    'Chiqayotgan 512 kanal qiymati (0–255)': ['Значения 512 выходных каналов (0–255)', 'Output values of 512 channels (0–255)'],
    // sahna
    'NUR YOʻNALTIRISH': ['НАВЕДЕНИЕ ЛУЧА', 'AIM BEAMS'],
    'CHIROQLARNI JOYLASH': ['РАССТАНОВКА ПРИБОРОВ', 'PLACE FIXTURES'],
    '4 BURCHAK': ['4 УГЛА', '4 CORNERS'],
    'KALIBRLASH': ['КАЛИБРОВКА', 'CALIBRATION'],
    'Sahna rasmi': ['Изображение сцены', 'Stage image'],
    'Moving head (Pan/Tilt)': ['Moving head (Pan/Tilt)', 'Moving head (Pan/Tilt)'],
    'Boshqa chiroqlar': ['Другие приборы', 'Other fixtures'],
    'Tanlangan': ['Выбран', 'Selected'],
    'Sahna burchagi': ['Угол сцены', 'Stage corner'],
    'Kalibrlash nuqtasi': ['Точка калибровки', 'Calibration point'],
    'SAHNA RASMI YOKI CHIZMASI': ['ФОТО ИЛИ ПЛАН СЦЕНЫ', 'STAGE PHOTO OR PLAN'],
    'RASM YUKLASH': ['ЗАГРУЗИТЬ ИЗОБРАЖЕНИЕ', 'UPLOAD IMAGE'],
    'RASMNI OLIB TASHLASH': ['УБРАТЬ ИЗОБРАЖЕНИЕ', 'REMOVE IMAGE'],
    'Eng aniq: yuqoridan chizilgan plan. Zaldan olingan foto ham boʻladi — keyin „4 BURCHAK“ bilan sahna burchaklarini belgilaysiz.': ['Точнее всего — план сцены сверху. Подойдёт и фото из зала — затем отметьте углы сцены через «4 УГЛА».', 'Most accurate: a top-down plan. A photo from the house also works — then mark the stage corners with “4 CORNERS”.'],
    'Eni (m)': ['Ширина (м)', 'Width (m)'], 'Chuqurligi (m)': ['Глубина (м)', 'Depth (m)'], 'Ferma (m)': ['Ферма (м)', 'Truss (m)'],
    'FERMA BALANDLIGINI BARCHA BEAM’LARGA': ['ВЫСОТУ ФЕРМЫ — ВСЕМ BEAM', 'APPLY TRUSS HEIGHT TO ALL BEAMS'],
    'TANLANGAN CHIROQ': ['ВЫБРАННЫЙ ПРИБОР', 'SELECTED FIXTURE'],
    'Balandlik (m)': ['Высота (м)', 'Height (m)'],
    'Pan (qoʻlda)': ['Pan (вручную)', 'Pan (manual)'], 'Tilt (qoʻlda)': ['Tilt (вручную)', 'Tilt (manual)'],
    'HAMMA BEAM’LAR': ['ВСЕ BEAM', 'ALL BEAMS'],
    'NURNI YOQISH (FULL)': ['ВКЛЮЧИТЬ ЛУЧ (FULL)', 'BEAM ON (FULL)'],
    'SHU CHIROQ NUQTALARINI TOZALASH': ['ОЧИСТИТЬ ТОЧКИ ЭТОГО ПРИБОРА', 'CLEAR THIS FIXTURE’S POINTS'],
    'SAHNA NUQTALARI': ['ТОЧКИ СЦЕНЫ', 'STAGE POINTS'],
    'masalan: Solo chap': ['например: Соло слева', 'e.g. Solo left'],
    'Nuqta nomi': ['Название точки', 'Point name'],
    'Hali nuqta yoʻq. Planda joyni bosing, nom yozib SAQLASH.': ['Точек пока нет. Нажмите место на плане, введите название и СОХРАНИТЬ.', 'No points yet. Click a spot on the plan, type a name and SAVE.'],
    'SAHNA · YUKLANGAN RASM': ['СЦЕНА · ЗАГРУЖЕННОЕ ИЗОБРАЖЕНИЕ', 'STAGE · UPLOADED IMAGE'],
    'TOMOSHABINLAR ZALI': ['ЗРИТЕЛЬНЫЙ ЗАЛ', 'AUDITORIUM'],
    'ORQA PARDA': ['ЗАДНИК', 'BACKDROP'],
    'Planni bosing — tanlangan moving head’lar oʻsha nuqtaga buriladi. Chiroqni tanlash: belgisini bosing.': ['Нажмите на план — выбранные moving head повернутся в эту точку. Выбор прибора — нажмите на его значок.', 'Click the plan — selected moving heads turn to that spot. To select a fixture, click its icon.'],
    'Chiroq belgilarini sudrab, sahnadagi haqiqiy joyiga qoʻying. Aniq raqam uchun oʻngda X, Y, balandlikni yozing.': ['Перетащите значки приборов на их реальные места на сцене. Для точности введите справа X, Y и высоту.', 'Drag fixture icons to their real places on stage. For exact values, type X, Y and height on the right.'],
    '1) Bitta moving head tanlang. 2) Oʻngdagi Pan/Tilt slayderlari bilan nurni poldagi belgiga aniq tushiring. 3) Planda oʻsha belgini bosing. 3–4 nuqta yetarli.': ['1) Выберите один moving head. 2) Слайдерами Pan/Tilt справа точно наведите луч на метку на полу. 3) Нажмите эту метку на плане. Достаточно 3–4 точек.', '1) Select one moving head. 2) Use the Pan/Tilt sliders on the right to land the beam exactly on the floor mark. 3) Click that mark on the plan. 3–4 points are enough.'],
    'Kalibrlash uchun bitta moving head tanlang.': ['Для калибровки выберите один moving head.', 'Select one moving head to calibrate.'],
    'Kalibrlash uchun aynan bitta moving head tanlang': ['Для калибровки выберите ровно один moving head', 'Select exactly one moving head to calibrate'],
    'Avval moving head (Beam) tanlang': ['Сначала выберите moving head (Beam)', 'Select a moving head (Beam) first'],
    'Avval moving head tanlang': ['Сначала выберите moving head', 'Select a moving head first'],
    'Avval planda nuqtani bosing': ['Сначала нажмите точку на плане', 'Click a point on the plan first'],
    'Avval sahna rasmini yuklang': ['Сначала загрузите изображение сцены', 'Upload a stage image first'],
    '4 burchak faqat yuklangan rasm uchun kerak': ['4 угла нужны только для загруженного изображения', '4 corners are needed only for an uploaded image'],
    'Sahna burchaklari saqlandi': ['Углы сцены сохранены', 'Stage corners saved'],
    'Rasm yuklandi. Endi sahnaning 4 burchagini belgilang.': ['Изображение загружено. Теперь отметьте 4 угла сцены.', 'Image uploaded. Now mark the 4 stage corners.'],
    'Rasm ochilmadi': ['Изображение не открылось', 'Image could not be opened'],
    'Sahna maydoni: nur yoʻnaltirish nuqtasini tanlash': ['Поле сцены: выбор точки наведения', 'Stage area: choose aiming point'],
    // to'lov oynasi
    'Tarifni tanlang': ['Выберите тариф', 'Choose a plan'],
    'Tarif faol': ['Тариф активен', 'Plan active'],
    'FAOL': ['АКТИВЕН', 'ACTIVE'],
    'Yopish': ['Закрыть', 'Close'],
    'Qanday faollashtiriladi': ['Как активировать', 'How to activate'],
    "Telegram'siz ham boʻladi. Chek rasmini tanlang (yoki chek boʻlmasa — ism va telefoningizni yozing). Admin tasdiqlagach tarif shu qurilmada": ['Можно и без Telegram. Выберите фото чека (или, если чека нет, укажите имя и телефон). После подтверждения админом тариф на этом устройстве', 'Works without Telegram too. Choose a receipt image (or, without a receipt, enter your name and phone). Once the admin confirms, the plan on this device'],
    'oʻzi faollashadi': ['включится сам', 'activates by itself'],
    ', kod kiritish shart emas.': [', вводить код не нужно.', ', no code needed.'],
    'Chekni shu yerdan yuborish': ['Отправить чек отсюда', 'Send receipt from here'],
    'Chek rasmini tanlash': ['Выбрать фото чека', 'Choose receipt image'],
    'Ismingiz': ['Ваше имя', 'Your name'],
    'Telefon': ['Телефон', 'Phone'],
    'Izoh (ixtiyoriy)': ['Комментарий (необязательно)', 'Note (optional)'],
    'ADMINGA YUBORISH ·': ['ОТПРАВИТЬ АДМИНУ ·', 'SEND TO ADMIN ·'],
    'Admin bilan yozishma': ['Переписка с админом', 'Chat with admin'],
    'Savol, fikr yoki taklif yozing — javob shu yerga keladi.': ['Напишите вопрос, отзыв или предложение — ответ придёт сюда.', 'Write a question, feedback or suggestion — the reply comes here.'],
    'Xabar yozing…': ['Напишите сообщение…', 'Type a message…'],
    'YUBORISH': ['ОТПРАВИТЬ', 'SEND'],
    'Hozircha xabar yoʻq': ['Сообщений пока нет', 'No messages yet'],
    'Yuborilmoqda…': ['Отправка…', 'Sending…'],
    'Yuborildi ✓ Admin tasdiqlagach tarif shu yerda oʻzi faollashadi.': ['Отправлено ✓ После подтверждения тариф включится здесь сам.', 'Sent ✓ After confirmation the plan activates here by itself.'],
    'Avval tarifni tanlang': ['Сначала выберите тариф', 'Choose a plan first'],
    'Chek rasmini tanlang yoki ism va telefoningizni yozing': ['Выберите фото чека или укажите имя и телефон', 'Choose a receipt image or enter your name and phone'],
    'Rasm oʻqilmadi — boshqa rasm tanlang': ['Не удалось прочитать фото — выберите другое', 'Could not read the image — choose another'],
    'Chekingiz tekshirilmoqda — tasdiqlangach oʻzi faollashadi': ['Чек проверяется — после подтверждения включится сам', 'Receipt is being checked — activates by itself once confirmed'],
    'Oxirgi toʻlov tasdiqlangan': ['Последний платёж подтверждён', 'Last payment confirmed'],
    'Oxirgi toʻlov rad etilgan — admin bilan yozishmada soʻrang': ['Последний платёж отклонён — спросите в переписке с админом', 'Last payment rejected — ask in the chat with admin'],
    'TELEGRAM BOT ORQALI TOʻLASH': ['ОПЛАТИТЬ ЧЕРЕЗ TELEGRAM-БОТ', 'PAY VIA TELEGRAM BOT'],
    'TOʻLOV KARTASI': ['КАРТА ДЛЯ ОПЛАТЫ', 'PAYMENT CARD'],
    'NUSXA': ['КОПИЯ', 'COPY'], 'NUSXALANDI': ['СКОПИРОВАНО', 'COPIED'],
    'Karta egasi': ['Владелец карты', 'Cardholder'], 'Summa': ['Сумма', 'Amount'], 'Izohga yozing': ['Укажите в комментарии', 'Write in the comment'],
    'Karta hali sozlanmagan': ['Карта ещё не настроена', 'Card not set up yet'],
    'Aktivatsiya kodi': ['Код активации', 'Activation code'],
    'FAOLLASHTIRISH': ['АКТИВИРОВАТЬ', 'ACTIVATE'],
    'Kod faqat shu qurilmada ishlaydi va tarif muddati tugaguncha amal qiladi.': ['Код работает только на этом устройстве и действует до конца срока тарифа.', 'The code works only on this device and is valid until the plan expires.'],
    'Kodni kiriting': ['Введите код', 'Enter the code'],
    'Tariflar yuklanmadi. Internet aloqasini tekshiring.': ['Тарифы не загрузились. Проверьте подключение к интернету.', 'Plans failed to load. Check your internet connection.'],
    'Cheksiz muddat': ['Бессрочно', 'Unlimited time'],
    'Sinov tugadi · Tarif tanlash': ['Пробный период окончен · Выбрать тариф', 'Trial ended · Choose a plan'],
    'Davom etish uchun tarif tanlang. Chiroqlar oxirgi holatda qoladi, cue’laringiz saqlangan: faollashtirgach shu joydan davom etasiz.': ['Чтобы продолжить, выберите тариф. Приборы остаются в последнем состоянии, ваши cue сохранены — после активации продолжите с этого места.', 'Choose a plan to continue. Fixtures stay in their last state and your cues are saved — after activation you continue from here.'],
    'soʻm': ['сум', 'UZS'],
    'Server xatosi': ['Ошибка сервера', 'Server error'],
    "Litsenziya tekshiruvidan o'tmadi": ['Лицензия не прошла проверку', 'License check failed'],
    'Kod topilmadi. Harflarni tekshirib qayta kiriting.': ['Код не найден. Проверьте символы и введите снова.', 'Code not found. Check the characters and try again.'],
    'Bu kod boshqa kompyuterda faollashtirilgan.': ['Этот код уже активирован на другом компьютере.', 'This code is already activated on another computer.'],
    'Bu kodning muddati tugagan.': ['Срок действия этого кода истёк.', 'This code has expired.'],
    'Bu kod bekor qilingan.': ['Этот код отменён.', 'This code has been revoked.'],
    "Juda ko'p urinish. 15 daqiqadan so'ng qayta urining.": ['Слишком много попыток. Повторите через 15 минут.', 'Too many attempts. Try again in 15 minutes.'],
    // tasdiqlash
    'Profil oʻchirilsinmi?': ['Удалить профиль?', 'Delete profile?'],
    'Patch Andijon teatrining 35 ta chirogʻiga (FreeStyler) qaytarilsinmi? Cue’lar oʻchmaydi, lekin chiroqlar almashadi.': ['Вернуть патч к 35 приборам Андижанского театра (FreeStyler)? Cue не удалятся, но приборы заменятся.', 'Reset the patch to the 35 Andijan theater fixtures (FreeStyler)? Cues are kept, but fixtures are replaced.'],
    'Sahna rasmi olib tashlansinmi? Chiroqlar joyi saqlanadi.': ['Убрать изображение сцены? Расстановка приборов сохранится.', 'Remove the stage image? Fixture positions are kept.'],
    // --- Cue-Link (Sahna Ovozi bilan bog'lanish) ---
    'Sahna Ovozi bilan bogʻlanish (Cue-Link)': ['Связь с Sahna Ovozi (Cue-Link)', 'Link with Sahna Ovozi (Cue-Link)'],
    '🔊 SAHNA OVOZI BILAN BOGʻLASH · CUE-LINK': ['🔊 СВЯЗЬ С SAHNA OVOZI · CUE-LINK', '🔊 LINK WITH SAHNA OVOZI · CUE-LINK'],
    'Sahna Ovozi’da cue GO boʻlganda, shu cue’ga biriktirilgan chiroq sahnasi bu yerda oʻzi yonadi.': ['Когда в Sahna Ovozi срабатывает cue (GO), привязанная к нему световая сцена включается здесь автоматически.', 'When a cue fires (GO) in Sahna Ovozi, the light scene linked to it turns on here automatically.'],
    'Sahna Ovozi’dan signal qabul qilish': ['Принимать сигналы от Sahna Ovozi', 'Receive signals from Sahna Ovozi'],
    '1 · Shu kompyuter (lokal)': ['1 · Этот компьютер (локально)', '1 · This computer (local)'],
    'Sahna Ovozi dasturi (.exe) shu kompyuterda ochiq boʻlsa — oʻzi ulanadi. Internet kerak emas, kechikish ~0.': ['Если программа Sahna Ovozi (.exe) открыта на этом компьютере — подключится сама. Интернет не нужен, задержка ~0.', 'If the Sahna Ovozi app (.exe) is open on this computer, it connects by itself. No internet needed, ~0 delay.'],
    '2 · Online xona kodi': ['2 · Онлайн-код комнаты', '2 · Online room code'],
    'Boshqa kompyuter, planshet yoki Sahna Ovozi sayti uchun. Shu kodni Sahna Ovozi → 💡 NURI oynasiga yozing.': ['Для другого компьютера, планшета или сайта Sahna Ovozi. Введите этот код в Sahna Ovozi → окно 💡 NURI.', 'For another computer, a tablet or the Sahna Ovozi website. Enter this code in Sahna Ovozi → 💡 NURI window.'],
    'NUSXALASH': ['КОПИРОВАТЬ', 'COPY'],
    'YANGI KOD': ['НОВЫЙ КОД', 'NEW CODE'],
    'Kutilmoqda…': ['Ожидание…', 'Waiting…'],
    'Hali signal kelmadi': ['Сигналов пока нет', 'No signal yet'],
    '🔊 OVOZ': ['🔊 ЗВУК', '🔊 SOUND'],
    '🔊 OVOZ: oʻchiq': ['🔊 ЗВУК: выкл', '🔊 SOUND: off'],
    '🔊 OVOZ · lokal': ['🔊 ЗВУК · локально', '🔊 SOUND · local'],
    '🔊 OVOZ · online': ['🔊 ЗВУК · онлайн', '🔊 SOUND · online'],
    '🔊 OVOZ: kutilmoqda': ['🔊 ЗВУК: ожидание', '🔊 SOUND: waiting'],
    'Oʻchiq': ['Выключено', 'Off'],
    'Sahna Ovozi ulangan': ['Sahna Ovozi подключён', 'Sahna Ovozi connected'],
    'Sahna Ovozi dasturi topilmadi': ['Программа Sahna Ovozi не найдена', 'Sahna Ovozi app not found'],
    'Serverga ulanib boʻlmadi (internet?)': ['Нет связи с сервером (интернет?)', 'Cannot reach the server (internet?)'],
    'Kod tayyor — Sahna Ovozi kutilmoqda': ['Код готов — ждём Sahna Ovozi', 'Code ready — waiting for Sahna Ovozi'],
    '🔊 Sahna Ovozi’dan sinov signali keldi': ['🔊 Получен тестовый сигнал от Sahna Ovozi', '🔊 Test signal received from Sahna Ovozi'],
    'Sahna Ovozi signallari yoqildi': ['Сигналы Sahna Ovozi включены', 'Sahna Ovozi signals on'],
    'Sahna Ovozi signallari oʻchirildi': ['Сигналы Sahna Ovozi выключены', 'Sahna Ovozi signals off'],
  };

  // ---------- qoliplar (dinamik matn) ----------
  const CORNERS = { 'chap orqa': ['левый задний', 'back left'], 'oʻng orqa': ['правый задний', 'back right'], 'oʻng old': ['правый передний', 'front right'], 'chap old': ['левый передний', 'front left'] };
  const UNIT = (u, i) => (/yil/i.test(u) ? ['год', 'year'] : ['мес.', 'month'])[i];
  const P = [
    [/^● Sahna Ovozi online \((.+)\)$/, (m, i) => [`● Sahna Ovozi онлайн (${m[1].replace(' s oldin', ' с назад').replace(' daq oldin', ' мин назад')})`, `● Sahna Ovozi online (${m[1].replace(' s oldin', ' s ago').replace(' daq oldin', ' min ago')})`][i]],
    [/^(.*) Tasdiqlash uchun yana bir marta bosing\.$/, (m, i) => tr(m[1]) + [' Нажмите ещё раз для подтверждения.', ' Press again to confirm.'][i]],
    [/^(.+) kalibrlash nuqtalari oʻchirilsinmi\?$/, (m, i) => [`Удалить точки калибровки ${m[1]}?`, `Delete calibration points of ${m[1]}?`][i]],
    [/^„(.+)“ nuqtasi oʻchirilsinmi\?$/, (m, i) => [`Удалить точку «${m[1]}»?`, `Delete point “${m[1]}”?`][i]],
    [/^(.+) oʻchirilsinmi\?$/, (m, i) => [`Удалить ${m[1]}?`, `Delete ${m[1]}?`][i]],
    [/^Roʻyxatdan (\d+) ta chiroq yoʻqolgan: (.+)$/, (m, i) => [`Из списка пропало приборов: ${m[1]} — ${m[2]}`, `${m[1]} fixture(s) missing from the list: ${m[2]}`][i]],
    [/^(\d+) ta chiroq tiklandi: (.+)$/, (m, i) => [`Восстановлено приборов: ${m[1]} — ${m[2]}`, `${m[1]} fixture(s) restored: ${m[2]}`][i]],
    [/^⚠ (\d+) ta kanal qoʻlda ushlab turilibdi$/, (m, i) => [`⚠ Вручную удерживается каналов: ${m[1]}`, `⚠ ${m[1]} channel(s) held manually`][i]],
    [/^✦ (\d+) ta bir xil chiroqqa birdaniga · alohida sozlash uchun chiroqni yana bir marta bosing$/, (m, i) => [`✦ Сразу на ${m[1]} одинаковых прибора · для отдельной настройки нажмите прибор ещё раз`, `✦ Applies to ${m[1]} identical fixtures · click a fixture again to edit it alone`][i]],
    [/^✦ (\d+) ta bir xil chiroqqa birdaniga$/, (m, i) => [`✦ Сразу на ${m[1]} одинаковых прибора`, `✦ Applies to ${m[1]} identical fixtures`][i]],
    [/^„(.+)“ saqlandi$/, (m, i) => [`«${m[1]}» сохранена`, `“${m[1]}” saved`][i]],
    [/^„(.+)“ — oʻzgarish yoʻq$/, (m, i) => [`«${m[1]}» — без изменений`, `“${m[1]}” — no changes`][i]],
    [/^● (\d+) ta chiroq oʻzgardi → „(.+)“ga yoziladi$/, (m, i) => [`● Изменено приборов: ${m[1]} → запишется в «${m[2]}»`, `● ${m[1]} fixture(s) changed → will be saved to “${m[2]}”`][i]],
    [/^● (\d+) ta chiroq programmerda — barcha sahnalar ustidan turadi$/, (m, i) => [`● В программере приборов: ${m[1]} — перекрывают все сцены`, `● ${m[1]} fixture(s) in the programmer — override every scene`][i]],
    [/^„(.+)“ yuklandi — (\d+) ta chiroq$/, (m, i) => [`«${m[1]}» загружен — приборов: ${m[2]}`, `“${m[1]}” loaded — ${m[2]} fixture(s)`][i]],
    [/^„(.+)“ → „(.+)“ga qoʻshildi$/, (m, i) => [`«${m[1]}» → добавлен в «${m[2]}»`, `“${m[1]}” → added to “${m[2]}”`][i]],
    [/^„(.+)“ — yangi sahna sifatida qoʻshildi$/, (m, i) => [`«${m[1]}» — добавлен как новая сцена`, `“${m[1]}” — added as a new scene`][i]],
    [/^„(.+)“ banki saqlandi — (\d+) ta chiroq, (\d+) tasi yoniq$/, (m, i) => [`Банк «${m[1]}» сохранён — приборов: ${m[2]}, горят: ${m[3]}`, `Bank “${m[1]}” saved — ${m[2]} fixtures, ${m[3]} lit`][i]],
    [/^Saqlanadi: „(.+)“ sahnasi( \+ (\d+) ta chiroqdagi oʻzgarish)?\. Nom yozilmasa — sahna nomi bilan\. Sahnani raqamidan ushlab shu panelga sudrasangiz ham boʻladi\.$/, (m, i) => [`Сохраняется: сцена «${m[1]}»${m[3] ? ` + изменения ${m[3]} приборов` : ''}. Без названия — именем сцены. Можно также перетащить сцену за номер на эту панель.`, `Saves scene “${m[1]}”${m[3] ? ` + changes on ${m[3]} fixtures` : ''}. Without a name the scene name is used. You can also drag a scene by its number onto this panel.`][i]],
    [/^„(.+)“ banki saqlandi$/, (m, i) => [`Банк «${m[1]}» сохранён`, `Bank “${m[1]}” saved`][i]],
    [/^„(.+)“ banki oʻchirilsinmi\?/, (m, i) => [`Удалить банк «${m[1]}»? Нажмите ещё раз для подтверждения.`, `Delete bank “${m[1]}”? Click again to confirm.`][i]],
    [/^(\d+) ta$/, (m, i) => [`${m[1]} шт.`, `${m[1]}`][i]],
    [/^✎ „(.+)“ tahrirda — oʻzgarishlar shu sahnaga yoziladi$/, (m, i) => [`✎ «${m[1]}» в правке — изменения записываются в эту сцену`, `✎ “${m[1]}” in edit — changes are written to this scene`][i]],
    [/^✎ „(.+)“ tahrirda( · (\d+) ta chiroq oʻzgardi)? — yana bossangiz saqlanadi$/, (m, i) => [`✎ «${m[1]}» в правке${m[3] ? ` · изменено приборов: ${m[3]}` : ''} — нажмите ещё раз, чтобы сохранить`, `✎ “${m[1]}” in edit${m[3] ? ` · ${m[3]} fixture(s) changed` : ''} — click again to save`][i]],
    [/^„(.+)“ — belgi olib tashlandi$/, (m, i) => [`«${m[1]}» — отметка снята`, `“${m[1]}” — mark cleared`][i]],
    [/^„(.+)“ (\d+)-oʻringa koʻchirildi$/, (m, i) => [`«${m[1]}» перемещена на ${m[2]}-е место`, `“${m[1]}” moved to position ${m[2]}`][i]],
    [/^„(.+)“ tanlandi — yana 2 marta bossangiz, ijroga oʻtadi$/, (m, i) => [`«${m[1]}» выбрана — нажмите ещё 2 раза, чтобы запустить`, `“${m[1]}” selected — click 2 more times to go live`][i]],
    [/^◆ „(.+)“ belgilandi — yana bir bossangiz, chiroqlar yonadi$/, (m, i) => [`◆ «${m[1]}» отмечена — ещё одно нажатие включит свет`, `◆ “${m[1]}” marked — one more click turns the lights on`][i]],
    [/^Gobo „(.+)“ — (\d+) ta chiroq$/, (m, i) => [`Гобо «${m[1]}» — приборов: ${m[2]}`, `Gobo “${m[1]}” — ${m[2]} fixtures`][i]],
    [/^(\d+) ta chiroq FreeStyler'dagidek joylashdi$/, (m, i) => [`${m[1]} приборов расставлено как во FreeStyler`, `${m[1]} fixtures placed as in FreeStyler`][i]],
    [/^(\d+) ta yoniq$/, (m, i) => [`Горят: ${m[1]}`, `${m[1]} lit`][i]],
    [/^(\d+) ta chiroq · (\d+) ta tanlangan$/, (m, i) => [`Приборов: ${m[1]} · выбрано: ${m[2]}`, `${m[1]} fixtures · ${m[2]} selected`][i]],
    [/^(\d+) ta chiroq · (\d+) \/ 512 kanal band$/, (m, i) => [`Приборов: ${m[1]} · занято ${m[2]} / 512 каналов`, `${m[1]} fixtures · ${m[2]} / 512 channels used`][i]],
    [/^(\d+) ta chiroqning manzili ustma-ust tushgan yoki 512 dan oshgan \(qizil qatorlar\)\. „Manzillarni ketma-ket qoʻyish“ tugmasi tuzatadi\.$/, (m, i) => [`У ${m[1]} приборов адреса пересекаются или выходят за 512 (красные строки). Исправит кнопка «Расставить адреса подряд».`, `${m[1]} fixtures overlap or exceed 512 (red rows). The “Auto-address in order” button fixes it.`][i]],
    [/^(\d+) ta cue$/, (m, i) => [`Cue: ${m[1]}`, `${m[1]} cues`][i]],
    [/^(IJRODA|PAUZA) · → (.+)$/, (m, i) => (m[1] === 'IJRODA' ? ['ИДЁТ', 'LIVE'] : ['ПАУЗА', 'PAUSE'])[i] + ' · → ' + m[2]],
    [/^Boʻlindi: (\d+) ta chapga, (\d+) ta oʻngga$/, (m, i) => [`Разделено: ${m[1]} влево, ${m[2]} вправо`, `Split: ${m[1]} left, ${m[2]} right`][i]],
    [/^Oxirgi sahna tiklandi: (.+)$/, (m, i) => [`Последняя сцена восстановлена: ${m[1]}`, `Last scene restored: ${m[1]}`][i]],
    [/^Joriy: (.+)$/, (m, i) => [`Текущий: ${m[1]}`, `Current: ${m[1]}`][i]],
    [/^(\d+) ta chiroq oʻzgartirilgan$/, (m, i) => [`Изменено приборов: ${m[1]}`, `${m[1]} fixtures changed`][i]],
    [/^(\d+) ta chiroq qoʻshildi$/, (m, i) => [`Добавлено приборов: ${m[1]}`, `${m[1]} fixtures added`][i]],
    [/^(\d+) ta chiroq bu nuqtaga yeta olmaydi \(burilish chegarasi\)$/, (m, i) => [`${m[1]} приб. не достают до этой точки (предел поворота)`, `${m[1]} fixtures cannot reach this point (rotation limit)`][i]],
    [/^(\d+) ta moving head balandligi (.+) m$/, (m, i) => [`Высота ${m[1]} moving head: ${m[2]} м`, `${m[1]} moving heads set to ${m[2]} m`][i]],
    [/^Cue (.+) yozildi$/, (m, i) => [`Cue ${m[1]} записан`, `Cue ${m[1]} recorded`][i]],
    [/^Cue (.+) yangilandi$/, (m, i) => [`Cue ${m[1]} обновлён`, `Cue ${m[1]} updated`][i]],
    [/^Start tarifida (\d+) tagacha cue\. PRO’ga oʻting\.$/, (m, i) => [`В тарифе Start до ${m[1]} cue. Перейдите на PRO.`, `The Start plan allows up to ${m[1]} cues. Upgrade to PRO.`][i]],
    [/^Start tarifida (\d+) tagacha chiroq\. PRO’ga oʻting\.$/, (m, i) => [`В тарифе Start до ${m[1]} приборов. Перейдите на PRO.`, `The Start plan allows up to ${m[1]} fixtures. Upgrade to PRO.`][i]],
    [/^(.+): (\d+)-nuqta saqlandi$/, (m, i) => [`${m[1]}: точка ${m[2]} сохранена`, `${m[1]}: point ${m[2]} saved`][i]],
    [/^(.+): (\d+) ta nuqta saqlangan · aniqlik ±(.+) DMX\.$/, (m, i) => [`${m[1]}: сохранено точек: ${m[2]} · точность ±${m[3]} DMX.`, `${m[1]}: ${m[2]} points saved · accuracy ±${m[3]} DMX.`][i]],
    [/^(.+): (\d+) ta nuqta saqlangan · yana kamida 1 ta nuqta qoʻshing\.$/, (m, i) => [`${m[1]}: сохранено точек: ${m[2]} · добавьте ещё минимум одну.`, `${m[1]}: ${m[2]} point saved · add at least one more.`][i]],
    [/^(.+): hali nuqta yoʻq\. Kalibrlanmagan chiroq taxminiy yoʻnaltiriladi\.$/, (m, i) => [`${m[1]}: точек пока нет. Без калибровки прибор наводится приблизительно.`, `${m[1]}: no points yet. Uncalibrated fixtures are aimed approximately.`][i]],
    [/^(\d+)-burchak: rasmda sahnaning (.+) burchagini bosing \(tomoshabin tomondan qaraganda\)\.$/, (m, i) => [`Угол ${m[1]}: нажмите на изображении ${(CORNERS[m[2]] || [m[2]])[0]} угол сцены (если смотреть из зала).`, `Corner ${m[1]}: click the ${(CORNERS[m[2]] || [, m[2]])[1]} corner of the stage in the image (as seen from the audience).`][i]],
    [/^(\d+)-burchak: suratda sahna POLINING (.+) burchagini bosing\.$/, (m, i) => [`Угол ${m[1]}: нажмите на фото ${(CORNERS[m[2]] || [m[2]])[0]} угол ПОЛА сцены.`, `Corner ${m[1]}: click the ${(CORNERS[m[2]] || [, m[2]])[1]} corner of the stage FLOOR in the photo.`][i]],
    [/^NISHON · (\d+) ta beam$/, (m, i) => [`ЦЕЛЬ · ${m[1]} beam`, `TARGET · ${m[1]} beam(s)`][i]],
    [/^(.+) m chapdan · (.+) m oldidan(?: · (.+) m)?$/, (m, i) => [`${m[1]} м слева · ${m[2]} м от авансцены${m[3] ? ` · ${m[3]} м` : ''}`, `${m[1]} m from left · ${m[2]} m from front${m[3] ? ` · ${m[3]} m` : ''}`][i]],
    [/^SAHNA PLANI · YUQORIDAN · (.+) m$/, (m, i) => [`ПЛАН СЦЕНЫ · ВИД СВЕРХУ · ${m[1]} м`, `STAGE PLAN · TOP VIEW · ${m[1]} m`][i]],
    [/^TANLANGAN: (\d+) TA CHIROQ$/, (m, i) => [`ВЫБРАНО: ${m[1]} ПРИБ.`, `SELECTED: ${m[1]} FIXTURES`][i]],
    [/^TANLANGAN: (.+)$/, (m, i) => [`ВЫБРАН: ${m[1]}`, `SELECTED: ${m[1]}`][i]],
    [/^„(.+)“ saqlandi$/, (m, i) => [`«${m[1]}» сохранено`, `“${m[1]}” saved`][i]],
    [/^(-?\d+) m$/, (m, i) => [`${m[1]} м`, `${m[1]} m`][i]],
    [/^(.+) \((\d+) kanal\)$/, (m, i) => [`${tr(m[1])} (${m[2]} кан.)`, `${tr(m[1])} (${m[2]} ch)`][i]],
    [/^(\d+) kanal · (\d+) ta$/, (m, i) => [`${m[1]} кан. · ${m[2]} шт.`, `${m[1]} ch · ${m[2]} units`][i]],
    [/^(\d+) ta chiroq shu profilda$/, (m, i) => [`Приборов с этим профилем: ${m[1]}`, `${m[1]} fixtures use this profile`][i]],
    [/^(.+) darajasi$/, (m, i) => [`Уровень: ${tr(m[1])}`, `${tr(m[1])} level`][i]],
    [/^(.+), tanlangan$/, (m, i) => [`${m[1]}, выбран`, `${m[1]}, selected`][i]],
    [/^DMX ulangan · (.+) · Universe 1$/, (m, i) => [`DMX подключён · ${tr(m[1])} · Universe 1`, `DMX connected · ${tr(m[1])} · Universe 1`][i]],
    [/^● Ulangan: (.+)$/, (m, i) => [`● Подключено: ${tr(m[1])}`, `● Connected: ${tr(m[1])}`][i]],
    [/^([●○]) (.+)$/, (m) => `${m[1]} ${tr(m[2])}`],
    [/^Ulandi: (.+)$/, (m, i) => [`Подключено: ${tr(m[1])}`, `Connected: ${tr(m[1])}`][i]],
    [/^Brauzer: USB (.) · Serial (.)$/, (m, i) => [`Браузер: USB ${m[1]} · Serial ${m[2]}`, `Browser: USB ${m[1]} · Serial ${m[2]}`][i]],
    [/^Qurilma bilan aloqa uzildi: (.+)$/, (m, i) => [`Связь с устройством потеряна: ${tr(m[1])}`, `Lost connection to the device: ${tr(m[1])}`][i]],
    [/^(Ochib boʻlmadi|Rasmni yuklab boʻlmadi|Saqlab boʻlmadi): (.+)$/, (m, i) => ({ 'Ochib boʻlmadi': ['Не удалось открыть', 'Could not open'], 'Rasmni yuklab boʻlmadi': ['Не удалось загрузить изображение', 'Could not upload image'], 'Saqlab boʻlmadi': ['Не удалось сохранить', 'Could not save'] }[m[1]][i] + ': ' + tr(m[2]))],
    [/^Ochildi: (.+)$/, (m, i) => [`Открыто: ${m[1]}`, `Opened: ${m[1]}`][i]],
    [/^Bepul sinov: (.+)$/, (m, i) => [`Пробный период: ${m[1]}`, `Free trial: ${m[1]}`][i]],
    [/^Sinov: (.+)$/, (m, i) => [`Пробный: ${m[1]}`, `Trial: ${m[1]}`][i]],
    [/^(START|PRO) · (\d+) kun qoldi$/, (m, i) => [`${m[1]} · осталось ${m[2]} дн.`, `${m[1]} · ${m[2]} days left`][i]],
    [/^(START|PRO) · cheksiz$/, (m, i) => [`${m[1]} · бессрочно`, `${m[1]} · unlimited`][i]],
    [/^(\d+) daqiqalik bepul sinov tugadi$/, (m, i) => [`${m[1]}-минутный пробный период окончен`, `The ${m[1]}-minute free trial has ended`][i]],
    [/^Bepul sinovda (.+) qoldi\. Hoziroq tarif olib, cheklovsiz ishlashingiz mumkin\.$/, (m, i) => [`Пробного времени осталось: ${m[1]}. Оформите тариф сейчас и работайте без ограничений.`, `${m[1]} of free trial left. Get a plan now to work without limits.`][i]],
    [/^Tarif: (.+?)(?:, (.+) gacha)?\. Uzaytirish uchun yangi kod olib, pastga kiriting\.$/, (m, i) => [`Тариф: ${tr(m[1])}${m[2] ? ', до ' + m[2] : ''}. Чтобы продлить, получите новый код и введите его ниже.`, `Plan: ${tr(m[1])}${m[2] ? ', until ' + m[2] : ''}. To extend, get a new code and enter it below.`][i]],
    [/^Faollashtirildi: (.+)\. Rahmat!$/, (m, i) => [`Активировано: ${tr(m[1])}. Спасибо!`, `Activated: ${tr(m[1])}. Thank you!`][i]],
    [/^(Start|PRO) · (\d+) (oy|yil)$/i, (m, i) => `${m[1]} · ${m[2]} ${UNIT(m[3], i)}`],
    [/^(\d+) tagacha chiroq · (\d+) cue$/, (m, i) => [`до ${m[1]} приборов · ${m[2]} cue`, `up to ${m[1]} fixtures · ${m[2]} cues`][i]],
    [/^(\d+) kun · cheksiz chiroq va cue$/, (m, i) => [`${m[1]} дн. · без ограничений приборов и cue`, `${m[1]} days · unlimited fixtures and cues`][i]],
    [/^(\d+) kun · oyiga ~(.+)$/, (m, i) => [`${m[1]} дн. · ~${tr(m[2])} в месяц`, `${m[1]} days · ~${tr(m[2])} per month`][i]],
    [/^([\d\s]+) so['ʻ]m$/, (m, i) => `${m[1]} ${['сум', 'UZS'][i]}`],
    [/^Kanal (\d+)$/, (m, i) => [`Канал ${m[1]}`, `Channel ${m[1]}`][i]],
    [/^Oxirgi signal: (.+)$/, (m, i) => [`Последний сигнал: ${m[1].replace(' s oldin', ' с назад').replace(' daq oldin', ' мин назад').replace('lokal', 'локально')}`, `Last signal: ${m[1].replace(' s oldin', ' s ago').replace(' daq oldin', ' min ago').replace('lokal', 'local')}`][i]],
    [/^Kod nusxalandi: (.+)$/, (m, i) => [`Код скопирован: ${m[1]}`, `Code copied: ${m[1]}`][i]],
    [/^Yangi kod: (\S+) — Sahna Ovozi’ga ham yozing$/, (m, i) => [`Новый код: ${m[1]} — введите его и в Sahna Ovozi`, `New code: ${m[1]} — enter it in Sahna Ovozi too`][i]],
    [/^🔊 (.+): Sahna Nuri’da „(.+)“ cue topilmadi$/, (m, i) => [`🔊 ${m[1]}: в Sahna Nuri нет cue «${m[2]}»`, `🔊 ${m[1]}: cue “${m[2]}” not found in Sahna Nuri`][i]],
  ];

  // ---------- murakkab HTML bloklar ----------
  const H = {
    install: [`<p class="muted">SAHNA NURI открывается на компьютере или телефоне как отдельное приложение: свой значок, отдельное окно, работает даже без интернета. Тариф и сохранённые спектакли не меняются.</p>
    <div class="inst-grid">
      <section class="inst-card" data-os="pc">
        <h2>💻 Компьютер <small>Windows · Chrome или Edge</small></h2>
        <ol><li>Нажмите значок <b>⊕ Установить</b> справа в адресной строке (или меню <b>⋮</b> → <b>Установить приложение</b>).</li><li>Подтвердите <b>Установить</b>.</li><li>Значок <b>SAHNA NURI</b> появится на рабочем столе и в меню Пуск.</li></ol>
      </section>
      <section class="inst-card" data-os="android">
        <h2>📱 Android <small>Chrome</small></h2>
        <ol><li>Откройте меню <b>⋮</b> справа вверху.</li><li>Нажмите <b>Установить приложение</b> или <b>Добавить на главный экран</b>.</li><li>Значок <b>SAHNA NURI</b> появится на главном экране.</li></ol>
      </section>
      <section class="inst-card" data-os="ios">
        <h2>📱 iPhone / iPad <small>Safari</small></h2>
        <ol><li>Нажмите кнопку <b>Поделиться ⬆</b> внизу.</li><li>Выберите <b>На экран «Домой»</b>.</li><li>Нажмите <b>Добавить</b> справа вверху.</li></ol>
      </section>
    </div>
    <p class="muted small">Сценой через USB-DMX кабель управляет только компьютер. На телефоне и планшете можно готовить cue, работать в симуляции и репетировать.</p>`,
      `<p class="muted">SAHNA NURI opens on a computer or phone as a separate app: its own icon, its own window, and it works even offline. Your plan and saved shows stay the same.</p>
    <div class="inst-grid">
      <section class="inst-card" data-os="pc">
        <h2>💻 Computer <small>Windows · Chrome or Edge</small></h2>
        <ol><li>Click the <b>⊕ Install</b> icon at the right of the address bar (or the <b>⋮</b> menu → <b>Install app</b>).</li><li>Confirm <b>Install</b>.</li><li>A <b>SAHNA NURI</b> icon appears on the desktop and in the Start menu.</li></ol>
      </section>
      <section class="inst-card" data-os="android">
        <h2>📱 Android <small>Chrome</small></h2>
        <ol><li>Open the <b>⋮</b> menu at the top right.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li><li>A <b>SAHNA NURI</b> icon appears on the home screen.</li></ol>
      </section>
      <section class="inst-card" data-os="ios">
        <h2>📱 iPhone / iPad <small>Safari</small></h2>
        <ol><li>Tap the <b>Share ⬆</b> button at the bottom.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b> at the top right.</li></ol>
      </section>
    </div>
    <p class="muted small">Only a computer drives the stage through the USB-DMX cable. On a phone or tablet you can prepare cues, use simulation and rehearse.</p>`],
    help: [
      `<p class="bridge-tip"><b>Самый простой путь — SAHNA NURI Bridge:</b> слева <b>СКАЧАТЬ (.exe)</b> → запустите файл один раз (если Windows пишет «Неизвестный издатель»: <b>Подробнее → Выполнить в любом случае</b>) → <b>ПОДКЛЮЧИТЬ BRIDGE</b>. Zadig не нужен, шаги ниже — только для подключения без Bridge.</p>
      <ol>
        <li><b>Закройте FreeStyler.</b> Кабелем одновременно может пользоваться только одна программа.</li>
        <li>Откройте программу в <b>Chrome</b> или <b>Edge</b>.</li>
        <li><b>ПОДКЛЮЧИТЬ uDMX</b> → в списке «uDMX» → <b>Подключить</b>.</li>
        <li>Если список пуст или появилась ошибка — замените драйвер на <b>WinUSB</b>:
          <ol type="a">
            <li>Скачайте и откройте Zadig с сайта <b>zadig.akeo.ie</b>.</li>
            <li><b>Options → List All Devices</b> → в списке <b>uDMX</b>.</li>
            <li>Справа <b>WinUSB</b> → <b>Replace Driver</b>.</li>
            <li>Перезапустите браузер и повторите шаг 3.</li>
          </ol>
        </li>
      </ol>
      <p class="muted small">Если нужно вернуться к FreeStyler — в Zadig снова поставьте драйвер <b>libusbK</b>.</p>
      <p class="muted small">После первого разрешения программа будет подключаться сама, как только вставлен кабель.</p>
      <p class="muted small"><b>iPad и iPhone:</b> Safari не даёт доступ к USB. На них программа работает в режиме симуляции и репетиций; сигнал на сцену идёт через компьютер.</p>`,
      `<p class="bridge-tip"><b>Easiest way — SAHNA NURI Bridge:</b> <b>DOWNLOAD (.exe)</b> on the left → run the file once (if Windows says “Unknown publisher”: <b>More info → Run anyway</b>) → <b>CONNECT BRIDGE</b>. No Zadig needed; the steps below are only for connecting without Bridge.</p>
      <ol>
        <li><b>Close FreeStyler.</b> Only one program can use the cable at a time.</li>
        <li>Open the program in <b>Chrome</b> or <b>Edge</b>.</li>
        <li><b>CONNECT uDMX</b> → “uDMX” in the list → <b>Connect</b>.</li>
        <li>If the list is empty or an error appears, switch the driver to <b>WinUSB</b>:
          <ol type="a">
            <li>Download and open Zadig from <b>zadig.akeo.ie</b>.</li>
            <li><b>Options → List All Devices</b> → <b>uDMX</b> in the list.</li>
            <li>On the right choose <b>WinUSB</b> → <b>Replace Driver</b>.</li>
            <li>Restart the browser and repeat step 3.</li>
          </ol>
        </li>
      </ol>
      <p class="muted small">To go back to FreeStyler, switch the driver back to <b>libusbK</b> in Zadig.</p>
      <p class="muted small">After the first permission, the program connects by itself whenever the cable is plugged in.</p>
      <p class="muted small"><b>iPad and iPhone:</b> Safari does not allow USB. On them the program runs in simulation and rehearsal mode; the stage signal goes through a computer.</p>`,
    ],
    steps: [
      `<li><i>1</i><span>Выберите тариф выше.</span></li>
       <li><i>2</i><span>Переведите <b class="pw-amount"></b> на карту. В комментарии укажите свой ID.</span></li>
       <li><i>3</i><span>Отправьте чек (скриншот) Telegram-боту или через <b>«Отправить чек отсюда»</b> ниже.</span></li>
       <li><i>4</i><span>После подтверждения админом тариф <b>включится сам</b> на этом устройстве. Бот также пришлёт <b>код активации</b> — при необходимости введите его ниже.</span></li>`,
      `<li><i>1</i><span>Choose a plan above.</span></li>
       <li><i>2</i><span>Transfer <b class="pw-amount"></b> to the card. Put your ID in the comment.</span></li>
       <li><i>3</i><span>Send the receipt (screenshot) to the Telegram bot or via <b>“Send receipt from here”</b> below.</span></li>
       <li><i>4</i><span>Once the admin confirms, the plan <b>activates by itself</b> on this device. The bot also sends an <b>activation code</b> — enter it below if needed.</span></li>`,
    ],
  };

  const idx = () => (lang === 'ru' ? 0 : 1);
  const SKIP = /^[\d\s.,:;%°×—–\-+/()±~|·✓✗✕→←↑↓…]*$/;
  function tr(s) {
    if (lang === 'uz' || s == null) return s;
    const t = String(s).trim();
    if (!t || SKIP.test(t)) return s;
    let out = null;
    if (D[t]) out = D[t][idx()];
    else for (const [re, fn] of P) { const m = t.match(re); if (m) { out = fn(m, idx()); break; } }
    if (out == null) return s;
    const lead = String(s).match(/^\s*/)[0], trail = String(s).match(/\s*$/)[0];
    return lead + out + trail;
  }

  // ---------- DOM ----------
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  let busy = false;
  function doText(n) {
    const v = n.data;
    if (v === n.__snTr) return;
    if (!v || !v.trim()) return;
    n.__snUz = v;
    const t = tr(v);
    n.__snTr = t;
    if (t !== v) n.data = t;
  }
  function doAttrs(el) {
    if (!el.getAttribute) return;
    el.__snA = el.__snA || {};
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const v = el.getAttribute(a), rec = el.__snA[a];
      if (rec && v === rec.tr) continue;
      const t = tr(v);
      el.__snA[a] = { uz: v, tr: t };
      if (t !== v) el.setAttribute(a, t);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { if (!inSkip(root.parentNode)) doText(root); return; }
    if (root.nodeType !== 1 || root.closest && root.closest('script,style,textarea')) return;
    doAttrs(root);
    const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) { if (!inSkip(n.parentNode)) doText(n); }
      else doAttrs(n);
    }
  }
  const inSkip = (el) => !el || /^(SCRIPT|STYLE|TEXTAREA)$/.test(el.nodeName) || (el.closest && el.closest('#mon'));
  // til almashganda: asl o'zbekcha matnga qaytib, qayta tarjima
  function resetAll(root) {
    const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) { if (n.__snUz != null && n.data === n.__snTr) n.data = n.__snUz; n.__snTr = undefined; }
      else if (n.__snA) { for (const a in n.__snA) { const r = n.__snA[a]; if (n.getAttribute(a) === r.tr) n.setAttribute(a, r.uz); } n.__snA = {}; }
    }
  }
  function applyHtml() {
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      if (el.__snHtml == null) el.__snHtml = el.innerHTML;
      const k = el.getAttribute('data-i18n-html');
      el.innerHTML = lang === 'uz' || !H[k] ? el.__snHtml : H[k][idx()];
    });
  }

  const obs = new MutationObserver((list) => {
    if (busy || lang === 'uz') return;
    busy = true;
    try {
      for (const m of list) {
        if (m.type === 'characterData') { if (!inSkip(m.target.parentNode)) doText(m.target); }
        else if (m.type === 'attributes') doAttrs(m.target);
        else m.addedNodes.forEach((n) => { if (n.nodeType === 3) { if (!inSkip(n.parentNode)) doText(n); } else if (n.nodeType === 1 && !inSkip(n)) walk(n); });
      }
    } finally { busy = false; }
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  const listeners = [];
  function setLang(l) {
    if (!['uz', 'ru', 'en'].includes(l)) return;
    busy = true;
    try { resetAll(document.body); } finally { busy = false; }
    lang = l;
    try { localStorage.setItem(LS, l); } catch (_) {}
    document.documentElement.lang = l;
    applyHtml();
    listeners.forEach((f) => { try { f(l); } catch (_) {} });
    refresh();
  }
  function refresh() {
    document.querySelectorAll('[data-lang]').forEach((b) => { const on = b.dataset.lang === lang; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if (lang === 'uz') return;
    busy = true;
    try { walk(document.body); } finally { busy = false; }
  }
  document.documentElement.lang = lang;
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });

  return { t: tr, lang: () => lang, setLang, refresh, applyHtml, onChange: (f) => listeners.push(f) };
})();
