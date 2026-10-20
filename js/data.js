/* Данные магазина Trend: категории, товары, акции, оплата, адреса.
   Фото — официальные изображения производителей (Apple Store, Samsung, Sony, ASUS),
   у каждого цвета свой набор снимков с разных сторон. Если фото недоступно — показывается иконка.
   Тексты товаров на трёх языках: tagline { ru, uz, en }, specs { ru, uz, en }. Названия цветов — по-русски,
   переводятся словарём COLOR_I18N из i18n.js. Цены в сумах (ориентир — цены США по курсу ~12 500). */

const CATEGORIES = [
  { id: 'phones',  icon: 'phone' },
  { id: 'laptops', icon: 'laptop' },
  { id: 'tablets', icon: 'tablet' },
  { id: 'audio',   icon: 'headphones' },
  { id: 'watches', icon: 'watch' },
];

/* ---------- генераторы ссылок на фото ---------- */
const AS = 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/';
const AV = 'https://www.apple.com/v/';
const NEWS = 'https://www.apple.com/newsroom/images/';
const iphoneShots = (model, color, date) => [
  `${AS}${model}-finish-select-${color}-${date}?wid=940&hei=1112&fmt=png-alpha`,
  `${AS}${model}-witb-${color}-${date}?wid=346&hei=784&fmt=jpeg&qlt=90`,
  `${AS}${model}-finish-select-${color}-${date}_AV3?wid=1246&hei=518&fmt=jpeg&qlt=90`,
  `${AS}${model}-finish-select-${color}-${date}_AV2?wid=724&hei=540&fmt=jpeg&qlt=90`,
];
const iphoneColor = (name, hex, model, color, date) => { const images = iphoneShots(model, color, date); return { name, hex, images, card: images[1] }; };
const mbaShots = color => [`${AS}mba13-${color}-select-202503?wid=904&hei=840&fmt=jpeg&qlt=90`, `${AS}mba13-${color}-witb-202503?wid=640&hei=680&fmt=jpeg&qlt=90`];
const ipadShots = (storeColor, pngName) => [
  `${AS}ipad-air-witb-${storeColor}-11in-wifi-202405?wid=640&hei=680&fmt=jpeg&qlt=90`,
  pngName ? `${AV}ipad-air/ah/images/overview/ipados/ipad_air_${pngName}_large.png` : `${AS}ipad-air-witb-${storeColor}-13in-wifi-202405?wid=704&hei=680&fmt=jpeg&qlt=90`,
];
const sonyShots = ids => ids.map(id => `https://sony.scene7.com/is/image/sonyglobalsolutions/WH1000XM6_Product_intro_${id}?wid=900&fmt=jpeg&qlt=85`);
const samsungShots = (code, first) => [2, 4, 0, 6].map(o => `https://images.samsung.com/is/image/samsung/p6pim/us/s2602/gallery/us-galaxy-s26-ultra-s948-sm-s948${code}xaa-${first + o}?$684_547_JPG$`);
const WATCH = NEWS + '2025/09/apple-debuts-apple-watch-series-11-featuring-groundbreaking-health-insights/article/';
const MEM = (...v) => ({ label: 'opt.memory', values: v.map(([name, add]) => ({ name, add })) });

const PRODUCTS = [
  {
    id: 'iphone-17', name: 'iPhone 17', brand: 'Apple', category: 'phones', icon: 'phone', price: 9990000, featured: true, tile: ['#dbeafe', '#c7d2fe'],
    tagline: { ru: 'Дисплей 6,3" ProMotion 120 Гц, чип A19, две камеры по 48 Мп', uz: '6,3" ProMotion 120 Gts displey, A19 chipi, ikkita 48 MP kamera', en: '6.3" ProMotion 120 Hz display, A19 chip, two 48 MP cameras' },
    colors: [iphoneColor('Чёрный', '#1f1f23', 'iphone-17', 'black', '202509'), iphoneColor('Белый', '#f2f2f4', 'iphone-17', 'white', '202509'), iphoneColor('Лавандовый', '#c9b8e8', 'iphone-17', 'lavender', '202509'), iphoneColor('Туманно-голубой', '#a9c8e6', 'iphone-17', 'mistblue', '202509'), iphoneColor('Шалфей', '#9fb8a3', 'iphone-17', 'sage', '202509')],
    variant: MEM(['256 ГБ', 0], ['512 ГБ', 2500000]),
    specs: {
      ru: [['Экран', '6,3" Super Retina XDR OLED, ProMotion 120 Гц, Always-On'], ['Процессор', 'Apple A19'], ['Камеры', '48 Мп Fusion + 48 Мп сверхширокая, фронтальная 18 Мп Center Stage'], ['Аккумулятор', 'до 30 ч воспроизведения видео'], ['Разъём', 'USB-C'], ['Защита', 'IP68, Ceramic Shield 2']],
      uz: [['Ekran', '6,3" Super Retina XDR OLED, ProMotion 120 Gts, Always-On'], ['Protsessor', 'Apple A19'], ['Kameralar', '48 MP Fusion + 48 MP ultra keng, old 18 MP Center Stage'], ['Batareya', '30 soatgacha video'], ['Port', 'USB-C'], ['Himoya', 'IP68, Ceramic Shield 2']],
      en: [['Display', '6.3" Super Retina XDR OLED, ProMotion 120 Hz, Always-On'], ['Chip', 'Apple A19'], ['Cameras', '48 MP Fusion + 48 MP Ultra Wide, 18 MP Center Stage front'], ['Battery', 'up to 30 h video playback'], ['Port', 'USB-C'], ['Protection', 'IP68, Ceramic Shield 2']],
    },
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', brand: 'Apple', category: 'phones', icon: 'phone', price: 13790000, featured: true, tile: ['#fde7d2', '#fbd0b0'],
    tagline: { ru: 'Алюминиевый юнибоди, A19 Pro, три камеры по 48 Мп и зум 8x', uz: 'Alyuminiy unibody, A19 Pro, uchta 48 MP kamera va 8x zum', en: 'Aluminium unibody, A19 Pro, three 48 MP cameras and 8x zoom' },
    colors: [iphoneColor('Космический оранжевый', '#e8762b', 'iphone-17-pro', 'cosmicorange', '202509'), iphoneColor('Серебристый', '#e3e4e6', 'iphone-17-pro', 'silver', '202509'), iphoneColor('Тёмно-синий', '#2b3f66', 'iphone-17-pro', 'deepblue', '202509')],
    variant: MEM(['256 ГБ', 0], ['512 ГБ', 2500000], ['1 ТБ', 5000000]),
    specs: {
      ru: [['Экран', '6,3" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A19 Pro, испарительная камера охлаждения'], ['Камеры', '48 Мп Fusion ×3: основная, сверхширокая, телефото 4x/8x'], ['Аккумулятор', 'до 33 ч воспроизведения видео'], ['Разъём', 'USB-C 3 (10 Гбит/с)'], ['Корпус', 'Алюминий, Ceramic Shield 2 с обеих сторон']],
      uz: [['Ekran', '6,3" Super Retina XDR OLED, ProMotion 120 Gts'], ['Protsessor', 'Apple A19 Pro, bug‘lanish kamerali sovutish'], ['Kameralar', '48 MP Fusion ×3: asosiy, ultra keng, 4x/8x telefoto'], ['Batareya', '33 soatgacha video'], ['Port', 'USB-C 3 (10 Gbit/s)'], ['Korpus', 'Alyuminiy, ikki tomondan Ceramic Shield 2']],
      en: [['Display', '6.3" Super Retina XDR OLED, ProMotion 120 Hz'], ['Chip', 'Apple A19 Pro with vapor chamber cooling'], ['Cameras', '48 MP Fusion ×3: Main, Ultra Wide, 4x/8x Telephoto'], ['Battery', 'up to 33 h video playback'], ['Port', 'USB-C 3 (10 Gb/s)'], ['Body', 'Aluminium, Ceramic Shield 2 front and back']],
    },
  },
  {
    id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', brand: 'Apple', category: 'phones', icon: 'phone', price: 14990000, tile: ['#e7e5e4', '#d6d3d1'],
    tagline: { ru: 'Экран 6,9" и самая долгая автономность среди iPhone 17', uz: '6,9" ekran va iPhone 17 ichida eng uzoq batareya', en: '6.9" display and the longest battery life in the iPhone 17 line' },
    colors: [iphoneColor('Космический оранжевый', '#e8762b', 'iphone-17-pro-max', 'cosmicorange', '202509'), iphoneColor('Серебристый', '#e3e4e6', 'iphone-17-pro-max', 'silver', '202509'), iphoneColor('Тёмно-синий', '#2b3f66', 'iphone-17-pro-max', 'deepblue', '202509')],
    variant: MEM(['256 ГБ', 0], ['512 ГБ', 2500000], ['1 ТБ', 5000000], ['2 ТБ', 10000000]),
    specs: {
      ru: [['Экран', '6,9" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A19 Pro'], ['Камеры', '48 Мп Fusion ×3, телефото до 8x оптического качества'], ['Аккумулятор', 'до 39 ч воспроизведения видео'], ['Разъём', 'USB-C 3 (10 Гбит/с)'], ['Корпус', 'Алюминий, Ceramic Shield 2']],
      uz: [['Ekran', '6,9" Super Retina XDR OLED, ProMotion 120 Gts'], ['Protsessor', 'Apple A19 Pro'], ['Kameralar', '48 MP Fusion ×3, 8x gacha optik sifatli telefoto'], ['Batareya', '39 soatgacha video'], ['Port', 'USB-C 3 (10 Gbit/s)'], ['Korpus', 'Alyuminiy, Ceramic Shield 2']],
      en: [['Display', '6.9" Super Retina XDR OLED, ProMotion 120 Hz'], ['Chip', 'Apple A19 Pro'], ['Cameras', '48 MP Fusion ×3, up to 8x optical-quality telephoto'], ['Battery', 'up to 39 h video playback'], ['Port', 'USB-C 3 (10 Gb/s)'], ['Body', 'Aluminium, Ceramic Shield 2']],
    },
  },
  {
    id: 'iphone-18-pro', name: 'iPhone 18 Pro', brand: 'Apple', category: 'phones', icon: 'phone', price: 15490000, featured: true, tag: 'new', tile: ['#ede9fe', '#ddd6fe'],
    tagline: { ru: 'Новинка 2026: A20 Pro на 2 нм, камера с переменной диафрагмой', uz: '2026 yangiligi: 2 nm A20 Pro, o‘zgaruvchan diafragmali kamera', en: 'New for 2026: 2 nm A20 Pro and a variable-aperture camera' },
    colors: [iphoneColor('Бордовый', '#6b1f2f', 'iphone-18-pro', 'burgundy', '202609'), iphoneColor('Ледниковый', '#bcd3e6', 'iphone-18-pro', 'glacier', '202609'), iphoneColor('Серебристый', '#e3e4e6', 'iphone-18-pro', 'silver', '202609'), iphoneColor('Чёрный', '#2a2a2e', 'iphone-18-pro', 'black', '202609')],
    variant: MEM(['256 ГБ', 0], ['512 ГБ', 2500000], ['1 ТБ', 5000000], ['2 ТБ', 10000000]),
    specs: {
      ru: [['Экран', '6,3" Super Retina XDR OLED, уменьшенный Dynamic Island'], ['Процессор', 'Apple A20 Pro (2 нм), GPU на 40 % быстрее A19 Pro'], ['Камеры', '48 Мп Fusion с переменной диафрагмой, 48 Мп сверхширокая, 48 Мп телефото'], ['Аккумулятор', 'до 36 ч видео, 50 % заряда за 15 мин'], ['Связь', 'Модем Apple C2, Wi-Fi 7, Bluetooth 6'], ['Разъём', 'USB-C 3']],
      uz: [['Ekran', '6,3" Super Retina XDR OLED, kichikroq Dynamic Island'], ['Protsessor', 'Apple A20 Pro (2 nm), GPU A19 Pro dan 40 % tezroq'], ['Kameralar', '48 MP Fusion o‘zgaruvchan diafragma, 48 MP ultra keng, 48 MP telefoto'], ['Batareya', '36 soatgacha video, 15 daqiqada 50 % quvvat'], ['Aloqa', 'Apple C2 modem, Wi-Fi 7, Bluetooth 6'], ['Port', 'USB-C 3']],
      en: [['Display', '6.3" Super Retina XDR OLED, smaller Dynamic Island'], ['Chip', 'Apple A20 Pro (2 nm), GPU 40% faster than A19 Pro'], ['Cameras', '48 MP Fusion with variable aperture, 48 MP Ultra Wide, 48 MP Telephoto'], ['Battery', 'up to 36 h video, 50% charge in 15 min'], ['Connectivity', 'Apple C2 modem, Wi-Fi 7, Bluetooth 6'], ['Port', 'USB-C 3']],
    },
  },
  {
    id: 'iphone-18-pro-max', name: 'iPhone 18 Pro Max', brand: 'Apple', category: 'phones', icon: 'phone', price: 16790000, featured: true, tag: 'new', tile: ['#fee2e2', '#fecaca'],
    tagline: { ru: 'Флагман 2026 года: до 45 часов видео и камера с переменной диафрагмой', uz: '2026 flagmani: 45 soatgacha video va o‘zgaruvchan diafragmali kamera', en: 'The 2026 flagship: up to 45 hours of video and a variable-aperture camera' },
    colors: [iphoneColor('Бордовый', '#6b1f2f', 'iphone-18-pro-max', 'burgundy', '202609'), iphoneColor('Ледниковый', '#bcd3e6', 'iphone-18-pro-max', 'glacier', '202609'), iphoneColor('Серебристый', '#e3e4e6', 'iphone-18-pro-max', 'silver', '202609'), iphoneColor('Чёрный', '#2a2a2e', 'iphone-18-pro-max', 'black', '202609')],
    variant: MEM(['256 ГБ', 0], ['512 ГБ', 2500000], ['1 ТБ', 5000000], ['2 ТБ', 10000000]),
    specs: {
      ru: [['Экран', '6,9" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A20 Pro (2 нм)'], ['Камеры', '48 Мп Fusion с переменной диафрагмой ×3'], ['Аккумулятор', 'до 45 ч видео; 5 мин зарядки = 7 ч видео'], ['Связь', 'Wi-Fi 7, Bluetooth 6, Thread'], ['Разъём', 'USB-C 3']],
      uz: [['Ekran', '6,9" Super Retina XDR OLED, ProMotion 120 Gts'], ['Protsessor', 'Apple A20 Pro (2 nm)'], ['Kameralar', '48 MP Fusion o‘zgaruvchan diafragma ×3'], ['Batareya', '45 soatgacha video; 5 daqiqa quvvat = 7 soat video'], ['Aloqa', 'Wi-Fi 7, Bluetooth 6, Thread'], ['Port', 'USB-C 3']],
      en: [['Display', '6.9" Super Retina XDR OLED, ProMotion 120 Hz'], ['Chip', 'Apple A20 Pro (2 nm)'], ['Cameras', '48 MP Fusion with variable aperture ×3'], ['Battery', 'up to 45 h video; 5 min charge = 7 h video'], ['Connectivity', 'Wi-Fi 7, Bluetooth 6, Thread'], ['Port', 'USB-C 3']],
    },
  },
  {
    id: 'galaxy-s26-ultra', name: 'Samsung Galaxy S26 Ultra', brand: 'Samsung', category: 'phones', icon: 'phone', price: 16290000, tag: 'new', tile: ['#e0f2fe', '#bae6fd'],
    tagline: { ru: 'Экран 6,9" с Privacy Display, S Pen и камера 200 Мп', uz: 'Privacy Display bilan 6,9" ekran, S Pen va 200 MP kamera', en: '6.9" display with Privacy Display, S Pen and a 200 MP camera' },
    colors: [
      { name: 'Чёрный', hex: '#2c2c2e', images: samsungShots('uzka', 550993324) }, { name: 'Белый', hex: '#f1f1f3', images: samsungShots('uzwa', 550994233) },
      { name: 'Кобальтовый фиолетовый', hex: '#8b85c4', images: samsungShots('uzva', 550993899) }, { name: 'Небесно-голубой', hex: '#b7d3e8', images: samsungShots('ulba', 550992879) },
      { name: 'Серебристая тень', hex: '#c9c9cc', images: samsungShots('uzsa', 550993694) }, { name: 'Розовое золото', hex: '#e8c1b8', images: samsungShots('uzda', 550993139) },
    ],
    variant: MEM(['12 ГБ / 256 ГБ', 0], ['12 ГБ / 512 ГБ', 1500000], ['16 ГБ / 1 ТБ', 4000000]),
    specs: {
      ru: [['Экран', '6,9" Dynamic AMOLED 2X QHD+, 120 Гц, Privacy Display'], ['Процессор', 'Snapdragon 8 Elite Gen 5 for Galaxy'], ['Камеры', '200 Мп основная + 50 Мп сверхширокая + 50 Мп 5x + 12 Мп 3x'], ['Аккумулятор', '5000 мА·ч, зарядка 60 Вт'], ['ПО', 'Android 16, One UI 8.5, 7 лет обновлений'], ['Особенности', 'S Pen в комплекте']],
      uz: [['Ekran', '6,9" Dynamic AMOLED 2X QHD+, 120 Gts, Privacy Display'], ['Protsessor', 'Snapdragon 8 Elite Gen 5 for Galaxy'], ['Kameralar', '200 MP asosiy + 50 MP ultra keng + 50 MP 5x + 12 MP 3x'], ['Batareya', '5000 mA·soat, 60 Vt quvvatlash'], ['Dasturiy ta’minot', 'Android 16, One UI 8.5, 7 yil yangilanish'], ['Xususiyat', 'S Pen to‘plamda']],
      en: [['Display', '6.9" Dynamic AMOLED 2X QHD+, 120 Hz, Privacy Display'], ['Chip', 'Snapdragon 8 Elite Gen 5 for Galaxy'], ['Cameras', '200 MP main + 50 MP ultra wide + 50 MP 5x + 12 MP 3x'], ['Battery', '5,000 mAh, 60 W charging'], ['Software', 'Android 16, One UI 8.5, 7 years of updates'], ['Extras', 'S Pen included']],
    },
  },
  {
    id: 'macbook-air-m4', name: 'MacBook Air 13" M4', brand: 'Apple', category: 'laptops', icon: 'laptop', price: 12490000, featured: true, tile: ['#e0f2fe', '#dbeafe'],
    tagline: { ru: 'Тонкий и бесшумный, чип M4, до 18 часов работы', uz: 'Yupqa va shovqinsiz, M4 chipi, 18 soatgacha ishlaydi', en: 'Thin and silent, M4 chip, up to 18 hours of battery life' },
    colors: [
      { name: 'Небесно-голубой', hex: '#b9d4e8', images: [...mbaShots('skyblue'), NEWS + '2025/03/apple-introduces-the-new-macbook-air-with-the-m4-chip-and-a-sky-blue-color/article/Apple-MacBook-Air-sky-blue-250305_big.jpg.large.jpg'] },
      { name: 'Серебристый', hex: '#e3e4e6', images: mbaShots('silver') }, { name: 'Сияющая звезда', hex: '#ecdcc4', images: mbaShots('starlight') }, { name: 'Тёмная ночь', hex: '#2e3440', images: mbaShots('midnight') },
    ],
    variant: { label: 'opt.config', values: [{ name: '16 ГБ / 256 ГБ', add: 0 }, { name: '16 ГБ / 512 ГБ', add: 2500000 }, { name: '24 ГБ / 512 ГБ', add: 5000000 }] },
    specs: {
      ru: [['Экран', '13,6" Liquid Retina, 500 нит'], ['Процессор', 'Apple M4: 10-ядерный CPU, до 10-ядерного GPU'], ['Память', '16 ГБ объединённой памяти (до 32 ГБ)'], ['Камера', '12 Мп Center Stage'], ['Автономность', 'до 18 ч'], ['Порты', '2× Thunderbolt 4, MagSafe 3, 3,5 мм'], ['Вес', '1,24 кг']],
      uz: [['Ekran', '13,6" Liquid Retina, 500 nit'], ['Protsessor', 'Apple M4: 10 yadroli CPU, 10 yadrogacha GPU'], ['Xotira', '16 GB birlashgan xotira (32 GB gacha)'], ['Kamera', '12 MP Center Stage'], ['Batareya', '18 soatgacha'], ['Portlar', '2× Thunderbolt 4, MagSafe 3, 3,5 mm'], ['Og‘irligi', '1,24 kg']],
      en: [['Display', '13.6" Liquid Retina, 500 nits'], ['Chip', 'Apple M4: 10-core CPU, up to 10-core GPU'], ['Memory', '16 GB unified memory (up to 32 GB)'], ['Camera', '12 MP Center Stage'], ['Battery', 'up to 18 h'], ['Ports', '2× Thunderbolt 4, MagSafe 3, 3.5 mm'], ['Weight', '1.24 kg']],
    },
  },
  {
    id: 'asus-zenbook-14', name: 'ASUS Zenbook 14 OLED (UX3405)', brand: 'ASUS', category: 'laptops', icon: 'laptop', price: 13490000, tile: ['#f1f5f9', '#e2e8f0'],
    tagline: { ru: 'OLED 3K 120 Гц, Intel Core Ultra и 75 Вт·ч батарея в корпусе 1,28 кг', uz: 'OLED 3K 120 Gts, Intel Core Ultra va 1,28 kg korpusda 75 Vt·soat batareya', en: '3K 120 Hz OLED, Intel Core Ultra and a 75 Wh battery in a 1.28 kg body' },
    images: ['https://dlcdnwebimgs.asus.com/files/media/87d135b1-7e5d-4637-8b58-a8651d4a4cc1/v1/features/images/large/1x/kv/kv.jpg', 'https://dlcdnwebimgs.asus.com/gain/7aadfea8-3d7b-4fd5-b2f5-44060507985f/w800'],
    colors: [{ name: 'Синий (Ponder Blue)', hex: '#2f4a6d' }, { name: 'Серебристый (Foggy Silver)', hex: '#b9bcc2' }],
    variant: { label: 'opt.config', values: [{ name: 'Core Ultra 7 / 16 ГБ / 1 ТБ', add: 0 }, { name: 'Core Ultra 9 / 32 ГБ / 1 ТБ', add: 2500000 }] },
    specs: {
      ru: [['Экран', '14" ASUS Lumina OLED 2880×1800, 120 Гц, 100 % DCI-P3'], ['Процессор', 'Intel Core Ultra 7 / Ultra 9, графика Intel Arc'], ['Память', 'LPDDR5X до 32 ГБ, SSD до 1 ТБ'], ['Аккумулятор', '75 Вт·ч, до 15 ч'], ['Порты', '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1, 3,5 мм'], ['Вес', '1,28 кг, толщина 1,49 см']],
      uz: [['Ekran', '14" ASUS Lumina OLED 2880×1800, 120 Gts, 100 % DCI-P3'], ['Protsessor', 'Intel Core Ultra 7 / Ultra 9, Intel Arc grafika'], ['Xotira', 'LPDDR5X 32 GB gacha, SSD 1 TB gacha'], ['Batareya', '75 Vt·soat, 15 soatgacha'], ['Portlar', '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1, 3,5 mm'], ['Og‘irligi', '1,28 kg, qalinligi 1,49 sm']],
      en: [['Display', '14" ASUS Lumina OLED 2880×1800, 120 Hz, 100% DCI-P3'], ['Chip', 'Intel Core Ultra 7 / Ultra 9, Intel Arc graphics'], ['Memory', 'LPDDR5X up to 32 GB, SSD up to 1 TB'], ['Battery', '75 Wh, up to 15 h'], ['Ports', '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1, 3.5 mm'], ['Weight', '1.28 kg, 1.49 cm thin']],
    },
  },
  {
    id: 'ipad-air-m3', name: 'iPad Air 11" M3', brand: 'Apple', category: 'tablets', icon: 'tablet', price: 7490000, tile: ['#fef3c7', '#fde68a'],
    tagline: { ru: 'Чип M3, поддержка Apple Pencil Pro и новой Magic Keyboard', uz: 'M3 chipi, Apple Pencil Pro va yangi Magic Keyboard qo‘llab-quvvatlanadi', en: 'M3 chip with support for Apple Pencil Pro and the new Magic Keyboard' },
    colors: [{ name: 'Синий', hex: '#a9bfd8', images: ipadShots('blue', 'blue__btrcc5x4t6j6') }, { name: 'Фиолетовый', hex: '#c7bde3', images: ipadShots('purple', 'purple__f8mkphpzreq2') }, { name: 'Сияющая звезда', hex: '#ecdcc4', images: ipadShots('starlight', 'starlight__bsd3afgeoij6') }, { name: 'Серый космос', hex: '#55575c', images: ipadShots('spacegray') }],
    variant: MEM(['128 ГБ', 0], ['256 ГБ', 1250000], ['512 ГБ', 3750000], ['1 ТБ', 6250000]),
    specs: {
      ru: [['Экран', '11" Liquid Retina, антибликовое покрытие'], ['Процессор', 'Apple M3, 8-ядерный CPU, 9-ядерный GPU'], ['Камеры', '12 Мп задняя, 12 Мп фронтальная с Center Stage'], ['Связь', 'Wi-Fi 6E, опционально 5G'], ['Аксессуары', 'Apple Pencil Pro, Magic Keyboard'], ['Вес', '460 г']],
      uz: [['Ekran', '11" Liquid Retina, aks etishga qarshi qoplama'], ['Protsessor', 'Apple M3, 8 yadroli CPU, 9 yadroli GPU'], ['Kameralar', '12 MP orqa, 12 MP old Center Stage bilan'], ['Aloqa', 'Wi-Fi 6E, ixtiyoriy 5G'], ['Aksessuarlar', 'Apple Pencil Pro, Magic Keyboard'], ['Og‘irligi', '460 g']],
      en: [['Display', '11" Liquid Retina, anti-reflective coating'], ['Chip', 'Apple M3, 8-core CPU, 9-core GPU'], ['Cameras', '12 MP rear, 12 MP front with Center Stage'], ['Connectivity', 'Wi-Fi 6E, optional 5G'], ['Accessories', 'Apple Pencil Pro, Magic Keyboard'], ['Weight', '460 g']],
    },
  },
  {
    id: 'airpods-pro-3', name: 'AirPods Pro 3', brand: 'Apple', category: 'audio', icon: 'earbuds', price: 3090000, featured: true, tile: ['#f8fafc', '#e2e8f0'],
    tagline: { ru: 'Шумоподавление в 2 раза сильнее, датчик пульса и живой перевод', uz: '2 barobar kuchli shovqin bostirish, puls sensori va jonli tarjima', en: '2x stronger noise cancellation, heart-rate sensing and live translation' },
    images: [1, 2, 3, 5].map(n => `${AS}airpods-pro-3-gallery-${n}-202509?wid=${n % 2 ? 1412 : 2028}&hei=1200&fmt=jpeg&qlt=90`),
    colors: [{ name: 'Белый', hex: '#f4f4f6' }],
    specs: {
      ru: [['Тип', 'Внутриканальные TWS, чип Apple H2'], ['Шумоподавление', 'Активное, в 2 раза эффективнее AirPods Pro 2'], ['Здоровье', 'Датчик пульса, проверка слуха, режим слухового аппарата'], ['Автономность', 'до 8 ч с ANC, до 10 ч в режиме прозрачности'], ['Защита', 'IP57'], ['Комплект', '5 размеров амбушюр, кейс с USB-C']],
      uz: [['Turi', 'Quloq ichi TWS, Apple H2 chipi'], ['Shovqin bostirish', 'Faol, AirPods Pro 2 dan 2 barobar samarali'], ['Salomatlik', 'Puls sensori, eshitish testi, eshitish apparati rejimi'], ['Batareya', 'ANC bilan 8 soatgacha, shaffoflik rejimida 10 soatgacha'], ['Himoya', 'IP57'], ['To‘plam', '5 o‘lchamli uchliklar, USB-C keys']],
      en: [['Type', 'In-ear TWS, Apple H2 chip'], ['Noise cancellation', 'Active, 2x more effective than AirPods Pro 2'], ['Health', 'Heart-rate sensor, hearing test, hearing aid mode'], ['Battery', 'up to 8 h with ANC, up to 10 h in Transparency'], ['Protection', 'IP57'], ['In the box', '5 ear tip sizes, USB-C case']],
    },
  },
  {
    id: 'sony-wh1000xm6', name: 'Sony WH-1000XM6', brand: 'Sony', category: 'audio', icon: 'headphones', price: 5590000, tile: ['#fce7f3', '#fbcfe8'],
    tagline: { ru: 'Флагманское шумоподавление с процессором QN3 и 30 часов музыки', uz: 'QN3 protsessorli flagman shovqin bostirish va 30 soat musiqa', en: 'Flagship noise cancelling with the QN3 processor and 30 hours of music' },
    colors: [{ name: 'Платиновый серебристый', hex: '#d9d9d9', images: sonyShots(['10_M', '11_M']) }, { name: 'Полночный синий', hex: '#2c3e63', images: sonyShots(['14_M', '12_M', '15_M']) }, { name: 'Песочно-розовый', hex: '#e5c6c0', images: sonyShots(['18_M', '16_M', '17_M']) }, { name: 'Песчаник', hex: '#d8cfc3', images: sonyShots(['23', '24', '25', '26']) }],
    specs: {
      ru: [['Тип', 'Полноразмерные, Bluetooth 5.3, мультипоинт'], ['Шумоподавление', 'HD Noise Cancelling Processor QN3, 12 микрофонов'], ['Драйверы', '30 мм, настройка Sony Music Studios'], ['Автономность', 'до 30 ч; 3 мин зарядки = 3 ч'], ['Кодеки', 'LDAC, AAC, SBC, LC3'], ['Вес', '254 г, складная конструкция']],
      uz: [['Turi', 'To‘liq o‘lchamli, Bluetooth 5.3, multipoint'], ['Shovqin bostirish', 'HD Noise Cancelling Processor QN3, 12 mikrofon'], ['Drayverlar', '30 mm, Sony Music Studios sozlamasi'], ['Batareya', '30 soatgacha; 3 daqiqa quvvat = 3 soat'], ['Kodeklar', 'LDAC, AAC, SBC, LC3'], ['Og‘irligi', '254 g, buklanadigan']],
      en: [['Type', 'Over-ear, Bluetooth 5.3, multipoint'], ['Noise cancellation', 'HD Noise Cancelling Processor QN3, 12 microphones'], ['Drivers', '30 mm, tuned with Sony Music Studios'], ['Battery', 'up to 30 h; 3 min charge = 3 h'], ['Codecs', 'LDAC, AAC, SBC, LC3'], ['Weight', '254 g, foldable']],
    },
  },
  {
    id: 'apple-watch-s11', name: 'Apple Watch Series 11', brand: 'Apple', category: 'watches', icon: 'watch', price: 4990000, tile: ['#fee2e2', '#fecaca'],
    tagline: { ru: 'Уведомления о гипертонии, оценка сна, 5G и до 24 часов работы', uz: 'Gipertoniya bildirishnomalari, uyqu bahosi, 5G va 24 soatgacha ishlash', en: 'Hypertension notifications, sleep score, 5G and up to 24 hours of battery' },
    colors: [
      { name: 'Чёрный', hex: '#2b2b2e', images: [WATCH + 'Apple-Watch-Series-11-aluminum-jet-black-250909_inline.jpg.large.jpg', WATCH + 'Apple-Watch-Series-11-hero-250909_big.jpg.large.jpg'] },
      { name: 'Серебристый', hex: '#dcdcde', images: [WATCH + 'Apple-Watch-Series-11-aluminum-silver-250909_inline.jpg.large.jpg'] },
      { name: 'Розовое золото', hex: '#e2b9ad', images: [WATCH + 'Apple-Watch-Series-11-aluminum-rose-gold-250909_inline.jpg.large.jpg'] },
      { name: 'Серый космос', hex: '#6d6e73', images: [WATCH + 'Apple-Watch-Series-11-aluminum-space-gray-250909_inline.jpg.large.jpg'] },
    ],
    variant: { label: 'opt.size', values: [{ name: '42 мм', add: 0 }, { name: '46 мм', add: 400000 }] },
    specs: {
      ru: [['Экран', 'Always-On Retina, стекло Ion-X в 2 раза прочнее к царапинам'], ['Здоровье', 'ЭКГ, SpO₂, уведомления о гипертонии, оценка сна'], ['Связь', '5G, Wi-Fi, GPS'], ['Автономность', 'до 24 ч, быстрая зарядка 15 мин = 8 ч'], ['Корпус', 'Алюминий из 100 % переработанного сырья, WR50'], ['ПО', 'watchOS 26, Workout Buddy']],
      uz: [['Ekran', 'Always-On Retina, tirnalishga 2 barobar chidamli Ion-X shisha'], ['Salomatlik', 'EKG, SpO₂, gipertoniya bildirishnomalari, uyqu bahosi'], ['Aloqa', '5G, Wi-Fi, GPS'], ['Batareya', '24 soatgacha, tez quvvat 15 daqiqa = 8 soat'], ['Korpus', '100 % qayta ishlangan alyuminiy, WR50'], ['Dasturiy ta’minot', 'watchOS 26, Workout Buddy']],
      en: [['Display', 'Always-On Retina, Ion-X glass 2x more scratch resistant'], ['Health', 'ECG, SpO₂, hypertension notifications, sleep score'], ['Connectivity', '5G, Wi-Fi, GPS'], ['Battery', 'up to 24 h, fast charge 15 min = 8 h'], ['Case', '100% recycled aluminium, WR50'], ['Software', 'watchOS 26, Workout Buddy']],
    },
  },
];

/* Акции на главной */
const PROMOS = [
  { id: 'iphone-18-pro-max', title: 'iPhone 18 Pro Max', badge: 'badge.new', theme: 'dark',
    text: { ru: 'Новинка 2026 с камерой с переменной диафрагмой. Рассрочка 0–0–12 и выкуп старого iPhone.', uz: 'O‘zgaruvchan diafragmali kamera bilan 2026 yangiligi. Muddatli to‘lov 0–0–12 va eski iPhone’ni sotib olish.', en: 'The 2026 flagship with a variable-aperture camera. 0% installments and iPhone trade-in.' } },
  { id: 'galaxy-s26-ultra', title: 'Galaxy S26 Ultra', badge: 'badge.gift', theme: 'blue',
    text: { ru: 'Privacy Display, S Pen и 200 Мп. Наушники Galaxy Buds в подарок при предзаказе.', uz: 'Privacy Display, S Pen va 200 MP. Oldindan buyurtmada Galaxy Buds sovg‘a.', en: 'Privacy Display, S Pen and 200 MP. Free Galaxy Buds with pre-order.' } },
  { id: 'macbook-air-m4', title: 'MacBook Air M4', badge: '−10 %', theme: 'sky', discount: 10,
    text: { ru: 'Скидка 10 % для студентов и до 18 часов автономности. Четыре цвета, включая небесно-голубой.', uz: 'Talabalarga 10 % chegirma va 18 soatgacha batareya. To‘rt rang, shu jumladan osmon-ko‘k.', en: '10% student discount and up to 18 hours of battery. Four colors including sky blue.' } },
];

/* Способы оплаты: id совпадает с ключами pay.* в переводах; цвет — для значка */
const PAYMENTS = [
  { id: 'payme', mark: 'Payme', color: '#00bfb3', online: true },
  { id: 'click', mark: 'Click', color: '#0f7cf5', online: true },
  { id: 'uzcard', mark: 'UZCARD · HUMO', color: '#1e40af', online: true },
  { id: 'visa', mark: 'VISA · MC', color: '#1a1f71', online: true },
  { id: 'cash', mark: '₸', color: '#6b7280', online: false },
];

const STORES = [
  { id: 1, name: 'Trend Центр',         address: 'пр. Амира Темура, 24',       lat: 41.3111, lng: 69.2797, hours: '10:00–22:00', phone: '+998 71 200-10-01' },
  { id: 2, name: 'Trend Юнусабад',      address: 'ул. Амира Темура, 107',      lat: 41.3640, lng: 69.2890, hours: '10:00–21:00', phone: '+998 71 200-10-02' },
  { id: 3, name: 'Trend Чиланзар',      address: 'ул. Катартал, 60',           lat: 41.2750, lng: 69.2030, hours: '10:00–21:00', phone: '+998 71 200-10-03' },
  { id: 4, name: 'Trend Сергели',       address: 'ул. Янги Сергели, 12',       lat: 41.2250, lng: 69.2210, hours: '10:00–20:00', phone: '+998 71 200-10-04' },
  { id: 5, name: 'Trend Мирзо-Улугбек', address: 'ул. Буюк Ипак Йули, 180',    lat: 41.3320, lng: 69.3340, hours: '10:00–21:00', phone: '+998 71 200-10-05' },
];

const MAP_CENTER = { lat: 41.3111, lng: 69.2797, zoom: 11 };
