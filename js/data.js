/* Данные магазина Trend: категории, товары, адреса.
   Фото — официальные изображения производителей (Apple Store, apple.com, Samsung, Sony, ASUS),
   у каждого цвета свой набор снимков с разных сторон. Если фото недоступно — показывается иконка.
   Цены в сумах (ориентир — рекомендованные цены США по курсу ~12 500). Валюта — CONFIG в app.js. */

const CATEGORIES = [
  { id: 'phones',  name: 'Смартфоны', icon: 'phone' },
  { id: 'laptops', name: 'Ноутбуки',  icon: 'laptop' },
  { id: 'tablets', name: 'Планшеты',  icon: 'tablet' },
  { id: 'audio',   name: 'Наушники',  icon: 'headphones' },
  { id: 'watches', name: 'Часы',      icon: 'watch' },
];

/* ---------- генераторы ссылок на фото ---------- */
const AS = 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/';
const AV = 'https://www.apple.com/v/';
const NEWS = 'https://www.apple.com/newsroom/images/';
/* iPhone в Apple Store: четыре ракурса на каждый цвет (перед и зад целиком, задняя панель, камеры).
   Для карточек в каталоге берётся лёгкое фото (card), большое PNG грузится только на странице товара. */
const iphoneShots = (model, color, date) => [
  `${AS}${model}-finish-select-${color}-${date}?wid=940&hei=1112&fmt=png-alpha`,
  `${AS}${model}-witb-${color}-${date}?wid=346&hei=784&fmt=jpeg&qlt=90`,
  `${AS}${model}-finish-select-${color}-${date}_AV3?wid=1246&hei=518&fmt=jpeg&qlt=90`,
  `${AS}${model}-finish-select-${color}-${date}_AV2?wid=724&hei=540&fmt=jpeg&qlt=90`,
];
const iphoneColor = (name, hex, model, color, date) => { const images = iphoneShots(model, color, date); return { name, hex, images, card: images[1] }; };
const mbaShots = color => [
  `${AS}mba13-${color}-select-202503?wid=904&hei=840&fmt=jpeg&qlt=90`,
  `${AS}mba13-${color}-witb-202503?wid=640&hei=680&fmt=jpeg&qlt=90`,
];
const ipadShots = (storeColor, pngName) => [
  `${AS}ipad-air-witb-${storeColor}-11in-wifi-202405?wid=640&hei=680&fmt=jpeg&qlt=90`,
  pngName ? `${AV}ipad-air/ah/images/overview/ipados/ipad_air_${pngName}_large.png` : `${AS}ipad-air-witb-${storeColor}-13in-wifi-202405?wid=704&hei=680&fmt=jpeg&qlt=90`,
];
const sonyShots = ids => ids.map(id => `https://sony.scene7.com/is/image/sonyglobalsolutions/WH1000XM6_Product_intro_${id}?wid=900&fmt=jpeg&qlt=85`);
const samsungShots = (code, first) => [2, 4, 0, 6].map(o => `https://images.samsung.com/is/image/samsung/p6pim/us/s2602/gallery/us-galaxy-s26-ultra-s948-sm-s948${code}xaa-${first + o}?$684_547_JPG$`);
const WATCH = NEWS + '2025/09/apple-debuts-apple-watch-series-11-featuring-groundbreaking-health-insights/article/';

const PRODUCTS = [
  {
    id: 'iphone-17', name: 'iPhone 17', brand: 'Apple', category: 'phones', icon: 'phone',
    price: 9990000, featured: true, tile: ['#dbeafe', '#c7d2fe'],
    tagline: 'Дисплей 6,3" ProMotion 120 Гц, чип A19, две камеры по 48 Мп',
    colors: [
      iphoneColor('Чёрный', '#1f1f23', 'iphone-17', 'black', '202509'),
      iphoneColor('Белый', '#f2f2f4', 'iphone-17', 'white', '202509'),
      iphoneColor('Лавандовый', '#c9b8e8', 'iphone-17', 'lavender', '202509'),
      iphoneColor('Туманно-голубой', '#a9c8e6', 'iphone-17', 'mistblue', '202509'),
      iphoneColor('Шалфей', '#9fb8a3', 'iphone-17', 'sage', '202509'),
    ],
    variant: { label: 'Память', values: [{ name: '256 ГБ', add: 0 }, { name: '512 ГБ', add: 2500000 }] },
    specs: [['Экран', '6,3" Super Retina XDR OLED, ProMotion 120 Гц, Always-On'], ['Процессор', 'Apple A19'], ['Камеры', '48 Мп Fusion + 48 Мп сверхширокая, фронтальная 18 Мп Center Stage'], ['Аккумулятор', 'до 30 ч воспроизведения видео'], ['Разъём', 'USB-C'], ['Защита', 'IP68, Ceramic Shield 2']],
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', brand: 'Apple', category: 'phones', icon: 'phone',
    price: 13790000, featured: true, tile: ['#fde7d2', '#fbd0b0'],
    tagline: 'Алюминиевый юнибоди, A19 Pro, три камеры по 48 Мп и зум 8x',
    colors: [
      iphoneColor('Космический оранжевый', '#e8762b', 'iphone-17-pro', 'cosmicorange', '202509'),
      iphoneColor('Серебристый', '#e3e4e6', 'iphone-17-pro', 'silver', '202509'),
      iphoneColor('Тёмно-синий', '#2b3f66', 'iphone-17-pro', 'deepblue', '202509'),
    ],
    variant: { label: 'Память', values: [{ name: '256 ГБ', add: 0 }, { name: '512 ГБ', add: 2500000 }, { name: '1 ТБ', add: 5000000 }] },
    specs: [['Экран', '6,3" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A19 Pro, испарительная камера охлаждения'], ['Камеры', '48 Мп Fusion ×3: основная, сверхширокая, телефото 4x/8x'], ['Аккумулятор', 'до 33 ч воспроизведения видео'], ['Разъём', 'USB-C 3 (10 Гбит/с)'], ['Корпус', 'Алюминий, Ceramic Shield 2 с обеих сторон']],
  },
  {
    id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', brand: 'Apple', category: 'phones', icon: 'phone',
    price: 14990000, tile: ['#e7e5e4', '#d6d3d1'],
    tagline: 'Экран 6,9" и самая долгая автономность среди iPhone 17',
    colors: [
      iphoneColor('Космический оранжевый', '#e8762b', 'iphone-17-pro-max', 'cosmicorange', '202509'),
      iphoneColor('Серебристый', '#e3e4e6', 'iphone-17-pro-max', 'silver', '202509'),
      iphoneColor('Тёмно-синий', '#2b3f66', 'iphone-17-pro-max', 'deepblue', '202509'),
    ],
    variant: { label: 'Память', values: [{ name: '256 ГБ', add: 0 }, { name: '512 ГБ', add: 2500000 }, { name: '1 ТБ', add: 5000000 }, { name: '2 ТБ', add: 10000000 }] },
    specs: [['Экран', '6,9" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A19 Pro'], ['Камеры', '48 Мп Fusion ×3, телефото до 8x оптического качества'], ['Аккумулятор', 'до 39 ч воспроизведения видео'], ['Разъём', 'USB-C 3 (10 Гбит/с)'], ['Корпус', 'Алюминий, Ceramic Shield 2']],
  },
  {
    id: 'iphone-18-pro', name: 'iPhone 18 Pro', brand: 'Apple', category: 'phones', icon: 'phone',
    price: 15490000, featured: true, tag: 'new', tile: ['#ede9fe', '#ddd6fe'],
    tagline: 'Новинка 2026: A20 Pro на 2 нм, камера с переменной диафрагмой',
    colors: [
      iphoneColor('Бордовый', '#6b1f2f', 'iphone-18-pro', 'burgundy', '202609'),
      iphoneColor('Ледниковый', '#bcd3e6', 'iphone-18-pro', 'glacier', '202609'),
      iphoneColor('Серебристый', '#e3e4e6', 'iphone-18-pro', 'silver', '202609'),
      iphoneColor('Чёрный', '#2a2a2e', 'iphone-18-pro', 'black', '202609'),
    ],
    variant: { label: 'Память', values: [{ name: '256 ГБ', add: 0 }, { name: '512 ГБ', add: 2500000 }, { name: '1 ТБ', add: 5000000 }, { name: '2 ТБ', add: 10000000 }] },
    specs: [['Экран', '6,3" Super Retina XDR OLED, уменьшенный Dynamic Island'], ['Процессор', 'Apple A20 Pro (2 нм), GPU на 40 % быстрее A19 Pro'], ['Камеры', '48 Мп Fusion с переменной диафрагмой, 48 Мп сверхширокая, 48 Мп телефото'], ['Аккумулятор', 'до 36 ч видео, 50 % заряда за 15 мин'], ['Связь', 'Модем Apple C2, Wi-Fi 7, Bluetooth 6'], ['Разъём', 'USB-C 3']],
  },
  {
    id: 'iphone-18-pro-max', name: 'iPhone 18 Pro Max', brand: 'Apple', category: 'phones', icon: 'phone',
    price: 16790000, featured: true, tag: 'new', tile: ['#fee2e2', '#fecaca'],
    tagline: 'Флагман 2026 года: до 45 часов видео и камера с переменной диафрагмой',
    colors: [
      iphoneColor('Бордовый', '#6b1f2f', 'iphone-18-pro-max', 'burgundy', '202609'),
      iphoneColor('Ледниковый', '#bcd3e6', 'iphone-18-pro-max', 'glacier', '202609'),
      iphoneColor('Серебристый', '#e3e4e6', 'iphone-18-pro-max', 'silver', '202609'),
      iphoneColor('Чёрный', '#2a2a2e', 'iphone-18-pro-max', 'black', '202609'),
    ],
    variant: { label: 'Память', values: [{ name: '256 ГБ', add: 0 }, { name: '512 ГБ', add: 2500000 }, { name: '1 ТБ', add: 5000000 }, { name: '2 ТБ', add: 10000000 }] },
    specs: [['Экран', '6,9" Super Retina XDR OLED, ProMotion 120 Гц'], ['Процессор', 'Apple A20 Pro (2 нм)'], ['Камеры', '48 Мп Fusion с переменной диафрагмой ×3'], ['Аккумулятор', 'до 45 ч видео; 5 мин зарядки = 7 ч видео'], ['Связь', 'Wi-Fi 7, Bluetooth 6, Thread'], ['Разъём', 'USB-C 3']],
  },
  {
    id: 'galaxy-s26-ultra', name: 'Samsung Galaxy S26 Ultra', brand: 'Samsung', category: 'phones', icon: 'phone',
    price: 16290000, tag: 'new', tile: ['#e0f2fe', '#bae6fd'],
    tagline: 'Экран 6,9" с Privacy Display, S Pen и камера 200 Мп',
    colors: [
      { name: 'Чёрный', hex: '#2c2c2e', images: samsungShots('uzka', 550993324) },
      { name: 'Белый', hex: '#f1f1f3', images: samsungShots('uzwa', 550994233) },
      { name: 'Кобальтовый фиолетовый', hex: '#8b85c4', images: samsungShots('uzva', 550993899) },
      { name: 'Небесно-голубой', hex: '#b7d3e8', images: samsungShots('ulba', 550992879) },
      { name: 'Серебристая тень', hex: '#c9c9cc', images: samsungShots('uzsa', 550993694) },
      { name: 'Розовое золото', hex: '#e8c1b8', images: samsungShots('uzda', 550993139) },
    ],
    variant: { label: 'Память', values: [{ name: '12 ГБ / 256 ГБ', add: 0 }, { name: '12 ГБ / 512 ГБ', add: 1500000 }, { name: '16 ГБ / 1 ТБ', add: 4000000 }] },
    specs: [['Экран', '6,9" Dynamic AMOLED 2X QHD+, 120 Гц, Privacy Display'], ['Процессор', 'Snapdragon 8 Elite Gen 5 for Galaxy'], ['Камеры', '200 Мп основная + 50 Мп сверхширокая + 50 Мп 5x + 12 Мп 3x'], ['Аккумулятор', '5000 мА·ч, зарядка 60 Вт'], ['ПО', 'Android 16, One UI 8.5, 7 лет обновлений'], ['Особенности', 'S Pen в комплекте']],
  },
  {
    id: 'macbook-air-m4', name: 'MacBook Air 13" M4', brand: 'Apple', category: 'laptops', icon: 'laptop',
    price: 12490000, featured: true, tile: ['#e0f2fe', '#dbeafe'],
    tagline: 'Тонкий и бесшумный, чип M4, до 18 часов работы',
    colors: [
      { name: 'Небесно-голубой', hex: '#b9d4e8', images: [...mbaShots('skyblue'), NEWS + '2025/03/apple-introduces-the-new-macbook-air-with-the-m4-chip-and-a-sky-blue-color/article/Apple-MacBook-Air-sky-blue-250305_big.jpg.large.jpg'] },
      { name: 'Серебристый', hex: '#e3e4e6', images: mbaShots('silver') },
      { name: 'Сияющая звезда', hex: '#ecdcc4', images: mbaShots('starlight') },
      { name: 'Тёмная ночь', hex: '#2e3440', images: mbaShots('midnight') },
    ],
    variant: { label: 'Конфигурация', values: [{ name: '16 ГБ / 256 ГБ', add: 0 }, { name: '16 ГБ / 512 ГБ', add: 2500000 }, { name: '24 ГБ / 512 ГБ', add: 5000000 }] },
    specs: [['Экран', '13,6" Liquid Retina, 500 нит'], ['Процессор', 'Apple M4: 10-ядерный CPU, до 10-ядерного GPU'], ['Память', '16 ГБ объединённой памяти (до 32 ГБ)'], ['Камера', '12 Мп Center Stage'], ['Автономность', 'до 18 ч'], ['Порты', '2× Thunderbolt 4, MagSafe 3, 3,5 мм'], ['Вес', '1,24 кг']],
  },
  {
    id: 'asus-zenbook-14', name: 'ASUS Zenbook 14 OLED (UX3405)', brand: 'ASUS', category: 'laptops', icon: 'laptop',
    price: 13490000, tile: ['#f1f5f9', '#e2e8f0'],
    tagline: 'OLED 3K 120 Гц, Intel Core Ultra и 75 Вт·ч батарея в корпусе 1,28 кг',
    images: ['https://dlcdnwebimgs.asus.com/files/media/87d135b1-7e5d-4637-8b58-a8651d4a4cc1/v1/features/images/large/1x/kv/kv.jpg', 'https://dlcdnwebimgs.asus.com/gain/7aadfea8-3d7b-4fd5-b2f5-44060507985f/w800'],
    colors: [{ name: 'Синий (Ponder Blue)', hex: '#2f4a6d' }, { name: 'Серебристый (Foggy Silver)', hex: '#b9bcc2' }],
    variant: { label: 'Конфигурация', values: [{ name: 'Core Ultra 7 / 16 ГБ / 1 ТБ', add: 0 }, { name: 'Core Ultra 9 / 32 ГБ / 1 ТБ', add: 2500000 }] },
    specs: [['Экран', '14" ASUS Lumina OLED 2880×1800, 120 Гц, 100 % DCI-P3'], ['Процессор', 'Intel Core Ultra 7 / Ultra 9, графика Intel Arc'], ['Память', 'LPDDR5X до 32 ГБ, SSD до 1 ТБ'], ['Аккумулятор', '75 Вт·ч, до 15 ч'], ['Порты', '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1, 3,5 мм'], ['Вес', '1,28 кг, толщина 1,49 см']],
  },
  {
    id: 'ipad-air-m3', name: 'iPad Air 11" M3', brand: 'Apple', category: 'tablets', icon: 'tablet',
    price: 7490000, tile: ['#fef3c7', '#fde68a'],
    tagline: 'Чип M3, поддержка Apple Pencil Pro и новой Magic Keyboard',
    colors: [
      { name: 'Синий', hex: '#a9bfd8', images: ipadShots('blue', 'blue__btrcc5x4t6j6') },
      { name: 'Фиолетовый', hex: '#c7bde3', images: ipadShots('purple', 'purple__f8mkphpzreq2') },
      { name: 'Сияющая звезда', hex: '#ecdcc4', images: ipadShots('starlight', 'starlight__bsd3afgeoij6') },
      { name: 'Серый космос', hex: '#55575c', images: ipadShots('spacegray') },
    ],
    variant: { label: 'Память', values: [{ name: '128 ГБ', add: 0 }, { name: '256 ГБ', add: 1250000 }, { name: '512 ГБ', add: 3750000 }, { name: '1 ТБ', add: 6250000 }] },
    specs: [['Экран', '11" Liquid Retina, антибликовое покрытие'], ['Процессор', 'Apple M3, 8-ядерный CPU, 9-ядерный GPU'], ['Камеры', '12 Мп задняя, 12 Мп фронтальная с Center Stage'], ['Связь', 'Wi-Fi 6E, опционально 5G'], ['Аксессуары', 'Apple Pencil Pro, Magic Keyboard'], ['Вес', '460 г']],
  },
  {
    id: 'airpods-pro-3', name: 'AirPods Pro 3', brand: 'Apple', category: 'audio', icon: 'earbuds',
    price: 3090000, featured: true, tile: ['#f8fafc', '#e2e8f0'],
    tagline: 'Шумоподавление в 2 раза сильнее, датчик пульса и живой перевод',
    images: [1, 2, 3, 5].map(n => `${AS}airpods-pro-3-gallery-${n}-202509?wid=${n % 2 ? 1412 : 2028}&hei=1200&fmt=jpeg&qlt=90`),
    colors: [{ name: 'Белый', hex: '#f4f4f6' }],
    specs: [['Тип', 'Внутриканальные TWS, чип Apple H2'], ['Шумоподавление', 'Активное, в 2 раза эффективнее AirPods Pro 2'], ['Здоровье', 'Датчик пульса, проверка слуха, режим слухового аппарата'], ['Автономность', 'до 8 ч с ANC, до 10 ч в режиме прозрачности'], ['Защита', 'IP57'], ['Комплект', '5 размеров амбушюр, кейс с USB-C']],
  },
  {
    id: 'sony-wh1000xm6', name: 'Sony WH-1000XM6', brand: 'Sony', category: 'audio', icon: 'headphones',
    price: 5590000, tile: ['#fce7f3', '#fbcfe8'],
    tagline: 'Флагманское шумоподавление с процессором QN3 и 30 часов музыки',
    colors: [
      { name: 'Платиновый серебристый', hex: '#d9d9d9', images: sonyShots(['10_M', '11_M']) },
      { name: 'Полночный синий', hex: '#2c3e63', images: sonyShots(['14_M', '12_M', '15_M']) },
      { name: 'Песочно-розовый', hex: '#e5c6c0', images: sonyShots(['18_M', '16_M', '17_M']) },
      { name: 'Песчаник', hex: '#d8cfc3', images: sonyShots(['23', '24', '25', '26']) },
    ],
    specs: [['Тип', 'Полноразмерные, Bluetooth 5.3, мультипоинт'], ['Шумоподавление', 'HD Noise Cancelling Processor QN3, 12 микрофонов'], ['Драйверы', '30 мм, настройка Sony Music Studios'], ['Автономность', 'до 30 ч; 3 мин зарядки = 3 ч'], ['Кодеки', 'LDAC, AAC, SBC, LC3'], ['Вес', '254 г, складная конструкция']],
  },
  {
    id: 'apple-watch-s11', name: 'Apple Watch Series 11', brand: 'Apple', category: 'watches', icon: 'watch',
    price: 4990000, tile: ['#fee2e2', '#fecaca'],
    tagline: 'Уведомления о гипертонии, оценка сна, 5G и до 24 часов работы',
    colors: [
      { name: 'Чёрный', hex: '#2b2b2e', images: [WATCH + 'Apple-Watch-Series-11-aluminum-jet-black-250909_inline.jpg.large.jpg', WATCH + 'Apple-Watch-Series-11-hero-250909_big.jpg.large.jpg'] },
      { name: 'Серебристый', hex: '#dcdcde', images: [WATCH + 'Apple-Watch-Series-11-aluminum-silver-250909_inline.jpg.large.jpg'] },
      { name: 'Розовое золото', hex: '#e2b9ad', images: [WATCH + 'Apple-Watch-Series-11-aluminum-rose-gold-250909_inline.jpg.large.jpg'] },
      { name: 'Серый космос', hex: '#6d6e73', images: [WATCH + 'Apple-Watch-Series-11-aluminum-space-gray-250909_inline.jpg.large.jpg'] },
    ],
    variant: { label: 'Размер корпуса', values: [{ name: '42 мм', add: 0 }, { name: '46 мм', add: 400000 }] },
    specs: [['Экран', 'Always-On Retina, стекло Ion-X в 2 раза прочнее к царапинам'], ['Здоровье', 'ЭКГ, SpO₂, уведомления о гипертонии, оценка сна'], ['Связь', '5G, Wi-Fi, GPS'], ['Автономность', 'до 24 ч, быстрая зарядка 15 мин = 8 ч'], ['Корпус', 'Алюминий из 100 % переработанного сырья, WR50'], ['ПО', 'watchOS 26, Workout Buddy']],
  },
];

/* Акции на главной: привязаны к товарам, цена «до» считается от скидки */
const PROMOS = [
  { id: 'iphone-18-pro-max', title: 'iPhone 18 Pro Max', text: 'Новинка 2026 с камерой с переменной диафрагмой. Рассрочка 0–0–12 и выкуп старого iPhone.', badge: 'Новинка', theme: 'dark' },
  { id: 'galaxy-s26-ultra', title: 'Galaxy S26 Ultra', text: 'Privacy Display, S Pen и 200 Мп. Наушники Galaxy Buds в подарок при предзаказе.', badge: 'Подарок', theme: 'blue' },
  { id: 'macbook-air-m4', title: 'MacBook Air M4', text: 'Скидка 10 % для студентов и до 18 часов автономности. Четыре цвета, включая небесно-голубой.', badge: '−10 %', theme: 'sky', discount: 10 },
];

const STORES = [
  { id: 1, name: 'Trend Центр',         address: 'пр. Амира Темура, 24',       lat: 41.3111, lng: 69.2797, hours: '10:00–22:00', phone: '+998 71 200-10-01' },
  { id: 2, name: 'Trend Юнусабад',      address: 'ул. Амира Темура, 107',      lat: 41.3640, lng: 69.2890, hours: '10:00–21:00', phone: '+998 71 200-10-02' },
  { id: 3, name: 'Trend Чиланзар',      address: 'ул. Катартал, 60',           lat: 41.2750, lng: 69.2030, hours: '10:00–21:00', phone: '+998 71 200-10-03' },
  { id: 4, name: 'Trend Сергели',       address: 'ул. Янги Сергели, 12',       lat: 41.2250, lng: 69.2210, hours: '10:00–20:00', phone: '+998 71 200-10-04' },
  { id: 5, name: 'Trend Мирзо-Улугбек', address: 'ул. Буюк Ипак Йули, 180',    lat: 41.3320, lng: 69.3340, hours: '10:00–21:00', phone: '+998 71 200-10-05' },
];

const MAP_CENTER = { lat: 41.3111, lng: 69.2797, zoom: 11 };
