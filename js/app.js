/* Trend — приложение без зависимостей.
   Хранение: localStorage (корзина, пользователи, сессия, заказы, тема, вариант дизайна).
   Карта: Leaflet подгружается только при открытии раздела «Магазины». */
(() => {
  'use strict';

  const CONFIG = {
    brand: 'Trend',
    currency: 'сум',
    deliveryPrice: 50000,          // курьерская доставка
    freeDeliveryFrom: 5000000,     // бесплатно от этой суммы
    leaflet: {
      css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
      js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
  };

  /* ---------- утилиты ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $('#app');
  const root = document.documentElement;
  const fmt = n => n.toLocaleString('ru-RU') + ' ' + CONFIG.currency;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, few, many) => { const m10 = n % 10, m100 = n % 100; return n + ' ' + (m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many); };
  const monthly = price => fmt(Math.ceil(price / 12 / 1000) * 1000);
  const SKINS = { premium: 'Premium: насыщенный', lite: 'Lite: лёгкий и простой', green: 'Зелёный с золотым акцентом', mono: 'Чёрно-белый', uzbek: 'Узбекистан: гирих, бирюза и золото' };
  const skin = () => (root.dataset.skin in SKINS) ? root.dataset.skin : 'premium';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим */ } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------- SVG-иконки устройств (запасной вариант, если фото не загрузилось) ---------- */
  const STROKE = 'stroke="rgba(0,0,0,.18)" stroke-width="1"';
  const ICONS = {
    phone: c => `<rect x="34" y="8" width="52" height="104" rx="11" fill="${c}" ${STROKE}/><rect x="39" y="14" width="42" height="92" rx="7" fill="#0b0f19"/><rect x="50" y="18" width="20" height="5" rx="2.5" fill="#1f2937"/>`,
    tablet: c => `<rect x="18" y="10" width="84" height="100" rx="10" fill="${c}" ${STROKE}/><rect x="24" y="16" width="72" height="88" rx="5" fill="#0b0f19"/>`,
    laptop: c => `<rect x="18" y="20" width="84" height="58" rx="6" fill="${c}" ${STROKE}/><rect x="23" y="25" width="74" height="48" rx="3" fill="#0b0f19"/><rect x="8" y="80" width="104" height="9" rx="4" fill="${c}" ${STROKE}/><rect x="48" y="80" width="24" height="3.5" rx="1.75" fill="rgba(0,0,0,.25)"/>`,
    headphones: c => `<path d="M26 72V58a34 34 0 0 1 68 0v14" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/><rect x="16" y="64" width="20" height="36" rx="9" fill="${c}" ${STROKE}/><rect x="84" y="64" width="20" height="36" rx="9" fill="${c}" ${STROKE}/><rect x="21" y="70" width="10" height="24" rx="4" fill="rgba(0,0,0,.35)"/><rect x="89" y="70" width="10" height="24" rx="4" fill="rgba(0,0,0,.35)"/>`,
    earbuds: c => `<rect x="22" y="34" width="76" height="58" rx="18" fill="${c}" ${STROKE}/><rect x="22" y="34" width="76" height="24" rx="12" fill="rgba(0,0,0,.07)"/><rect x="48" y="60" width="24" height="8" rx="4" fill="rgba(0,0,0,.18)"/><circle cx="60" cy="78" r="3" fill="#22c55e"/>`,
    watch: c => `<rect x="42" y="4" width="36" height="30" rx="8" fill="${c}" ${STROKE}/><rect x="42" y="86" width="36" height="30" rx="8" fill="${c}" ${STROKE}/><rect x="30" y="28" width="60" height="64" rx="16" fill="${c}" ${STROKE}/><rect x="36" y="34" width="48" height="52" rx="12" fill="#0b0f19"/><rect x="90" y="50" width="4" height="12" rx="2" fill="${c}" ${STROKE}/>`,
  };
  const deviceSvg = (icon, color) => `<svg viewBox="0 0 120 120" aria-hidden="true">${(ICONS[icon] || ICONS.phone)(color)}</svg>`;
  const tileStyle = p => `style="background:linear-gradient(145deg,${p.tile[0]},${p.tile[1]})"`;
  const ICON_UI = {
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  };

  /* ---------- товары и фото ---------- */
  const byId = id => PRODUCTS.find(p => p.id === id);
  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || '';
  const variantPrice = (p, vi = 0) => p.price + (p.variant ? p.variant.values[vi].add : 0);
  /* Набор фото выбранного цвета; если у цвета нет своих — общие фото товара */
  const imagesFor = (p, color) => (color && color.images && color.images.length ? color.images : p.images) || [];
  const imageFor = (p, color) => (color && color.card) || imagesFor(p, color)[0] || '';
  /* Версия фото в 2 раза крупнее для Retina-экранов и главного фото товара (у всех источников есть такие размеры) */
  function hiRes(src) {
    if (/store\.storeimages\.cdn-apple\.com/.test(src) && /fmt=jpeg/.test(src)) return src.replace(/wid=(\d+)&hei=(\d+)/, (m, w, h) => `wid=${w * 2}&hei=${h * 2}`);
    if (/images\.samsung\.com/.test(src)) return src.replace('$684_547_JPG$', '$1300_1038_JPG$');
    if (/sony\.scene7\.com/.test(src)) return src.replace('wid=900', 'wid=1800');
    if (/apple\.com\/newsroom/.test(src)) return src.replace(/\.large\.jpg$/, '.large_2x.jpg');
    return src;
  }
  const imgTag = (src, alt, eager = false, big = false) => {
    const hi = hiRes(src);
    const srcset = hi !== src ? `srcset="${big ? hi : src + ' 1x, ' + hi + ' 2x'}"` : '';
    return `<img src="${big ? hi : src}" ${srcset} alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${eager ? 'high' : 'low'}" width="600" height="600" onload="this.classList.add('loaded')" onerror="this.hidden=true">`;
  };
  /* Подсказка браузеру: главное фото страницы качать первым */
  function preload(src) { if (!src) return; const l = document.createElement('link'); l.rel = 'preload'; l.as = 'image'; l.href = src; l.fetchPriority = 'high'; document.head.appendChild(l); }
  function tileInner(p, color, eager = false, index = null) {
    const list = imagesFor(p, color), src = index === null ? imageFor(p, color) : (list[index] || list[0]);
    const svg = deviceSvg(p.icon, (color || p.colors[0]).hex);
    if (!src) return svg;
    return imgTag(src, p.name + (color ? ', ' + color.name : ''), eager, index !== null) + svg;
  }
  const tileClass = (p, color) => 'tile' + (imageFor(p, color) ? ' tile--photo' : '');
  const promoFor = p => PROMOS.find(x => x.id === p.id && x.discount);
  const tagHtml = p => promoFor(p) ? `<span class="card__tag card__tag--sale">−${promoFor(p).discount} %</span>` : p.tag === 'new' ? '<span class="card__tag card__tag--new">Новинка</span>' : p.featured ? '<span class="card__tag card__tag--hit">Хит</span>' : '';

  /* ---------- корзина ---------- */
  let cart = store.get('tr_cart', store.get('ts_cart', []));
  const cartKey = (id, ci, vi) => `${id}|${ci}|${vi}`;
  function saveCart() { store.set('tr_cart', cart); updateCartBadge(); }
  function cartLines() {
    return cart.map(it => {
      const p = byId(it.id); if (!p) return null;
      const color = p.colors[it.ci] || p.colors[0];
      const variant = p.variant ? p.variant.values[it.vi] : null;
      const price = variantPrice(p, it.vi);
      return { ...it, p, color, variant, price, sum: price * it.qty, key: cartKey(it.id, it.ci, it.vi) };
    }).filter(Boolean);
  }
  const cartTotal = () => cartLines().reduce((s, l) => s + l.sum, 0);
  const cartCount = () => cart.reduce((s, it) => s + it.qty, 0);
  function addToCart(id, ci, vi) {
    const found = cart.find(it => it.id === id && it.ci === ci && it.vi === vi);
    if (found) found.qty += 1; else cart.push({ id, ci, vi, qty: 1 });
    saveCart();
  }
  function updateCartBadge() {
    const n = cartCount(), el = $('#cart-count');
    el.textContent = n > 99 ? '99+' : n;
    el.hidden = n === 0;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }

  /* ---------- пользователи ---------- */
  const Auth = {
    users: () => store.get('tr_users', store.get('ts_users', {})),
    current() { const e = store.get('tr_session', store.get('ts_session', null)); return e ? this.users()[e] || null : null; },
    async hash(pass) {
      if (window.crypto?.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ts:' + pass));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      }
      return 'plain:' + pass;
    },
    async register(name, email, pass) {
      const users = this.users();
      email = email.trim().toLowerCase();
      if (users[email]) throw new Error('Пользователь с такой почтой уже есть');
      users[email] = { name: name.trim(), email, hash: await this.hash(pass), orders: [], created: Date.now() };
      store.set('tr_users', users);
      store.set('tr_session', email);
      updateHeader();
    },
    async login(email, pass) {
      const u = this.users()[email.trim().toLowerCase()];
      if (!u || u.hash !== await this.hash(pass)) throw new Error('Неверная почта или пароль');
      store.set('tr_session', u.email);
      updateHeader();
    },
    logout() { store.del('tr_session'); store.del('ts_session'); updateHeader(); },
    save(user) { const users = this.users(); users[user.email] = user; store.set('tr_users', users); },
  };
  function updateHeader() {
    const u = Auth.current(), av = $('#account-avatar');
    av.hidden = !u;
    if (u) av.textContent = u.name.trim().charAt(0).toUpperCase() || 'U';
  }

  /* ---------- роутер ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs = ''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { page: parts[0] || '', param: parts[1] ? decodeURIComponent(parts[1]) : null, query: new URLSearchParams(qs) };
  }
  const go = hash => { location.hash = hash; };
  const routes = { '': renderHome, catalog: renderCatalog, product: renderProduct, cart: renderCart, checkout: renderCheckout, login: renderAuth, account: renderAccount, stores: renderStores };
  let currentPage = '';
  function navigate() {
    const r = parseHash();
    currentPage = r.page;
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    stopSlider();
    (routes[r.page] || renderNotFound)(r);
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === r.page));
    $('#search-input').value = r.page === 'catalog' ? (r.query.get('q') || '') : '';
    window.scrollTo(0, 0);
    observeReveal();
  }

  /* Плавное появление секций (Premium); в Lite классы просто игнорируются стилями */
  let revealObs = null;
  function observeReveal() {
    const items = app.querySelectorAll('.reveal:not(.in)');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || skin() === 'lite') { items.forEach(el => el.classList.add('in')); return; }
    revealObs = revealObs || new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => revealObs.observe(el));
  }

  /* ---------- общие фрагменты ---------- */
  function productCard(p) {
    const min = variantPrice(p, 0), promo = promoFor(p);
    const price = promo ? Math.round(min * (1 - promo.discount / 100) / 10000) * 10000 : min;
    return `<a class="card" href="#/product/${p.id}">
      ${tagHtml(p)}
      <div class="${tileClass(p, p.colors[0])}" ${tileStyle(p)}>${tileInner(p, p.colors[0])}</div>
      <div class="card__body">
        <div class="card__brand">${esc(p.brand)}</div>
        <div class="card__title">${esc(p.name)}</div>
        <div class="card__tagline">${esc(p.tagline)}</div>
        <div class="card__footer">
          <div><div class="card__price">${promo ? `<span class="card__old">${fmt(min)}</span>` : ''}${p.variant && p.variant.values.length > 1 ? 'от ' : ''}${fmt(price)}</div><div class="card__installment">от ${monthly(price)}/мес</div></div>
          <div class="dots">${p.colors.map(c => `<span class="dot" style="background:${c.hex}" title="${esc(c.name)}"></span>`).join('')}</div>
        </div>
      </div></a>`;
  }
  const catIcon = (icon, color) => deviceSvg(icon, color);

  /* ---------- главная ---------- */
  function renderHome() {
    const featured = PRODUCTS.filter(p => p.featured);
    const count = id => PRODUCTS.filter(p => p.category === id).length;
    const promos = PROMOS.map(pr => ({ ...pr, p: byId(pr.id) })).filter(x => x.p);
    preload(imageFor(promos[0].p, promos[0].p.colors[0]));
    const heroHtml = skin() === 'lite' ? heroLite(promos) : sliderHtml(promos);
    const promoA = byId('macbook-air-m4'), promoB = byId('sony-wh1000xm6'), promoC = byId('ipad-air-m3');
    app.innerHTML = `
      ${heroHtml}
      <section class="perks reveal">
        <div class="perk">${ICON_UI.truck}<div><strong>Доставка за 1–2 дня</strong><span>Бесплатно от ${fmt(CONFIG.freeDeliveryFrom)}</span></div></div>
        <div class="perk">${ICON_UI.shield}<div><strong>Официальная гарантия</strong><span>12 месяцев на всю технику</span></div></div>
        <div class="perk">${ICON_UI.card}<div><strong>Рассрочка 0–0–12</strong><span>Без переплаты и первого взноса</span></div></div>
        <div class="perk">${ICON_UI.pin}<div><strong>5 магазинов в Ташкенте</strong><span>Самовывоз в день заказа</span></div></div>
      </section>
      <section class="section reveal">
        <div class="section__head"><h2>Хиты продаж</h2><a href="#/catalog">Смотреть всё →</a></div>
        <div class="grid">${featured.map(productCard).join('')}</div>
      </section>
      <section class="section reveal">
        <div class="section__head"><h2>Категории</h2><a href="#/catalog">Все товары →</a></div>
        <div class="cats">${CATEGORIES.map(c => `<a class="cat" href="#/catalog?cat=${c.id}"><span class="cat__icon">${catIcon(c.icon, 'var(--primary)')}</span><span>${c.name}</span><small>${plural(count(c.id), 'товар', 'товара', 'товаров')}</small></a>`).join('')}</div>
      </section>
      <section class="section promo reveal">
        <a class="promo__card" href="#/product/${promoA.id}">
          ${imgTag(imageFor(promoA, promoA.colors[0]), '')}
          <h3>MacBook Air M4</h3><p>Тонкий, бесшумный, до 18 часов без розетки. Теперь в небесно-голубом.</p>
          <span class="btn btn--primary btn--sm">от ${fmt(promoA.price)}</span>
        </a>
        <a class="promo__card promo__card--warm" href="#/product/${promoB.id}">
          ${imgTag(imageFor(promoB, promoB.colors[2]), '')}
          <h3>Sony WH-1000XM6</h3><p>Эталон шумоподавления. Четыре цвета, 30 часов музыки.</p>
          <span class="btn btn--primary btn--sm">${fmt(promoB.price)}</span>
        </a>
      </section>
      <section class="section promo reveal" style="grid-template-columns:1fr">
        <a class="promo__card promo__card--violet" href="#/product/${promoC.id}">
          ${imgTag(imageFor(promoC, promoC.colors[1]), '')}
          <h3>iPad Air M3 — от ${fmt(promoC.price)}</h3><p>Apple Pencil Pro в подарок при покупке до конца месяца. Четыре цвета, Wi-Fi 6E.</p>
          <span class="btn btn--primary btn--sm">Подробнее</span>
        </a>
      </section>`;
    if (skin() !== 'lite') startSlider(promos.length);
  }
  function promoPrice(x) {
    const base = x.p.price, price = x.discount ? Math.round(base * (1 - x.discount / 100) / 10000) * 10000 : base;
    return `${fmt(price)}${x.discount ? `<small>${fmt(base)}</small>` : ''}`;
  }
  function sliderHtml(promos) {
    return `<section class="slider" id="slider" aria-roledescription="карусель">
      <div class="slider__track" id="slider-track">${promos.map((x, i) => `
        <article class="slide slide--${x.theme} ${i === 0 ? 'active' : ''}">
          <div>
            <div class="slide__badge">${esc(x.badge)}</div>
            <h2>${esc(x.title)}</h2>
            <p>${esc(x.text)}</p>
            <div class="slide__price">от ${promoPrice(x)}</div>
            <div class="slide__actions"><a class="btn btn--primary btn--lg" href="#/product/${x.p.id}">Смотреть</a><a class="btn btn--ghost btn--lg" href="#/catalog?cat=${x.p.category}">Все ${catName(x.p.category).toLowerCase()}</a></div>
          </div>
          <a class="slide__media" href="#/product/${x.p.id}">${imgTag(imageFor(x.p, x.p.colors[0]), x.p.name, i === 0)}</a>
        </article>`).join('')}</div>
      <button class="slider__arrow slider__arrow--prev" data-action="slide" data-d="-1" aria-label="Предыдущая акция">${ICON_UI.prev}</button>
      <button class="slider__arrow slider__arrow--next" data-action="slide" data-d="1" aria-label="Следующая акция">${ICON_UI.next}</button>
      <div class="slider__dots">${promos.map((_, i) => `<button type="button" data-action="slide-to" data-i="${i}" class="${i === 0 ? 'active' : ''}" aria-label="Акция ${i + 1}"></button>`).join('')}</div>
    </section>`;
  }
  function heroLite(promos) {
    const x = promos[0];
    return `<section class="hero-lite">
        <div>
          <h1>${esc(x.title)}: ${esc(x.badge).toLowerCase()} уже в Trend</h1>
          <p>${esc(x.text)}</p>
          <div class="slide__actions"><a class="btn btn--primary btn--lg" href="#/product/${x.p.id}">Смотреть за ${fmt(x.p.price)}</a><a class="btn btn--lg" href="#/catalog">Каталог</a></div>
        </div>
        <a class="hero-lite__media" href="#/product/${x.p.id}">${imgTag(imageFor(x.p, x.p.colors[0]), x.p.name, true)}</a>
      </section>
      <section class="deals">${promos.map(x => `<a class="deal" href="#/product/${x.p.id}">
        <div class="deal__img">${imgTag(imageFor(x.p, x.p.colors[0]), '')}</div>
        <div><span class="deal__badge">${esc(x.badge)}</span><div class="deal__title">${esc(x.title)} · ${promoPrice(x).replace(/<small>.*<\/small>/, '')}</div><div class="deal__text">${esc(x.text)}</div></div>
      </a>`).join('')}</section>`;
  }
  /* Слайдер: один таймер, сдвиг через transform, пауза при наведении */
  let slideIdx = 0, slideTimer = null, slideCount = 0;
  function showSlide(i) {
    const track = $('#slider-track'); if (!track) return;
    slideIdx = (i + slideCount) % slideCount;
    track.style.transform = `translateX(-${slideIdx * 100}%)`;
    track.querySelectorAll('.slide').forEach((s, k) => s.classList.toggle('active', k === slideIdx));
    document.querySelectorAll('.slider__dots button').forEach((b, k) => b.classList.toggle('active', k === slideIdx));
  }
  function startSlider(n) {
    stopSlider();
    slideCount = n; slideIdx = 0;
    if (n < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    slideTimer = setInterval(() => showSlide(slideIdx + 1), 6000);
    const el = $('#slider');
    el.addEventListener('mouseenter', stopSlider);
    el.addEventListener('mouseleave', () => { if (!slideTimer && $('#slider')) slideTimer = setInterval(() => showSlide(slideIdx + 1), 6000); });
  }
  function stopSlider() { clearInterval(slideTimer); slideTimer = null; }

  /* ---------- каталог ---------- */
  function renderCatalog({ query }) {
    const cat = query.get('cat') || '';
    const q = (query.get('q') || '').trim().toLowerCase();
    const sort = query.get('sort') || 'popular';
    let list = PRODUCTS.filter(p => (!cat || p.category === cat) && (!q || `${p.name} ${p.brand} ${p.tagline}`.toLowerCase().includes(q)));
    if (sort === 'asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    const link = (c) => { const sp = new URLSearchParams(); if (c) sp.set('cat', c); if (q) sp.set('q', q); if (sort !== 'popular') sp.set('sort', sort); const s = sp.toString(); return '#/catalog' + (s ? '?' + s : ''); };
    app.innerHTML = `
      <h1>${cat ? esc(catName(cat)) : q ? `Поиск: «${esc(q)}»` : 'Каталог'}</h1>
      <div class="toolbar">
        <div class="chips">
          <a class="chip ${!cat ? 'chip--active' : ''}" href="${link('')}">Все</a>
          ${CATEGORIES.map(c => `<a class="chip ${cat === c.id ? 'chip--active' : ''}" href="${link(c.id)}">${c.name}</a>`).join('')}
        </div>
        <label class="muted" style="display:flex;gap:8px;align-items:center;font-size:.92rem">Сортировка
          <select class="input" id="sort-select">
            <option value="popular" ${sort === 'popular' ? 'selected' : ''}>Сначала популярные</option>
            <option value="asc" ${sort === 'asc' ? 'selected' : ''}>Сначала дешевле</option>
            <option value="desc" ${sort === 'desc' ? 'selected' : ''}>Сначала дороже</option>
            <option value="name" ${sort === 'name' ? 'selected' : ''}>По названию</option>
          </select></label>
      </div>
      ${list.length ? `<div class="grid">${list.map(productCard).join('')}</div>`
        : `<div class="empty"><h3>Ничего не найдено</h3><p>Попробуйте изменить запрос или выбрать другую категорию.</p><a class="btn" href="#/catalog">Сбросить фильтры</a></div>`}
      <p class="muted" style="margin-top:16px;font-size:.9rem">${plural(list.length, 'товар', 'товара', 'товаров')}</p>`;
    $('#sort-select').addEventListener('change', e => {
      const sp = new URLSearchParams(query); sp.set('sort', e.target.value); if (e.target.value === 'popular') sp.delete('sort');
      go('#/catalog' + (sp.toString() ? '?' + sp : ''));
    });
  }

  /* ---------- товар ---------- */
  let sel = { ci: 0, vi: 0, img: 0 };
  function renderProduct({ param }) {
    const p = byId(param);
    if (!p) return renderNotFound();
    sel = { ci: 0, vi: 0, img: 0 };
    preload(hiRes(imagesFor(p, p.colors[0])[0]));
    const promo = promoFor(p);
    app.innerHTML = `
      <div class="breadcrumbs"><a href="#/">Главная</a> › <a href="#/catalog">Каталог</a> › <a href="#/catalog?cat=${p.category}">${esc(catName(p.category))}</a> › <span>${esc(p.name)}</span></div>
      <div class="product">
        <div class="product__gallery">
          <div class="${tileClass(p, p.colors[0])}" ${tileStyle(p)} id="product-tile">${tileInner(p, p.colors[0], true, 0)}</div>
          <div class="product__thumbs" id="thumbs">${thumbsHtml(p, p.colors[0])}</div>
        </div>
        <div>
          <div class="product__brand">${esc(p.brand)}</div>
          <h1>${esc(p.name)}</h1>
          <p class="product__tagline">${esc(p.tagline)}</p>
          <div class="buybox">
            <div class="buybox__price" id="product-price">${priceHtml(p, 0)}</div>
            <div class="buybox__installment">или <b id="product-monthly">${monthly(finalPrice(p, 0))}</b> × 12 мес в рассрочку без переплаты${promo ? ` · акция −${promo.discount} %` : ''}</div>
            <div class="stock">В наличии в магазинах и на складе</div>
            <div class="opt">
              <div class="opt__label">Цвет: <span id="color-name">${esc(p.colors[0].name)}</span></div>
              <div class="swatches" id="swatches">${p.colors.map((c, i) => `<button class="swatch ${i === 0 ? 'swatch--active' : ''}" style="background:${c.hex}" data-action="pick-color" data-i="${i}" title="${esc(c.name)}" aria-label="${esc(c.name)}"></button>`).join('')}</div>
            </div>
            ${p.variant ? `<div class="opt">
              <div class="opt__label">${esc(p.variant.label)}</div>
              <div class="pills" id="pills">${p.variant.values.map((v, i) => `<button class="pill ${i === 0 ? 'pill--active' : ''}" data-action="pick-variant" data-i="${i}">${esc(v.name)}</button>`).join('')}</div>
            </div>` : ''}
            <div class="buybox__actions">
              <button class="btn btn--primary btn--lg" data-action="add-to-cart" data-id="${p.id}">В корзину</button>
              <button class="btn btn--dark btn--lg" data-action="buy-now" data-id="${p.id}">Купить сейчас</button>
            </div>
            <div class="delivery">
              <div>${ICON_UI.pin}<b>Самовывоз сегодня</b><span>· 5 магазинов, бесплатно</span></div>
              <div>${ICON_UI.truck}<b>Курьером 1–2 дня</b><span>· ${fmt(CONFIG.deliveryPrice)}, бесплатно от ${fmt(CONFIG.freeDeliveryFrom)}</span></div>
              <div>${ICON_UI.shield}<b>Гарантия 12 месяцев</b><span>· официальная</span></div>
            </div>
          </div>
          <div class="panel specs-panel">
            <h3>Характеристики</h3>
            <table class="specs">${p.specs.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
          </div>
        </div>
      </div>`;
    // Первые фото остальных цветов подгружаем в фоне, чтобы переключение было мгновенным
    const extra = p.colors.slice(1).map(c => imageFor(p, c)).filter(Boolean);
    if (extra.length) (window.requestIdleCallback || (fn => setTimeout(fn, 800)))(() => extra.forEach(src => { const im = new Image(); im.src = src; }));
  }
  const finalPrice = (p, vi) => { const promo = promoFor(p), v = variantPrice(p, vi); return promo ? Math.round(v * (1 - promo.discount / 100) / 10000) * 10000 : v; };
  const priceHtml = (p, vi) => promoFor(p) ? `${fmt(finalPrice(p, vi))} <span class="card__old" style="font-size:1rem">${fmt(variantPrice(p, vi))}</span>` : fmt(variantPrice(p, vi));
  /* Миниатюры ракурсов выбранного цвета */
  function thumbsHtml(p, color) {
    const list = imagesFor(p, color);
    if (list.length < 2) return '';
    return list.map((src, i) => `<button type="button" class="${i === sel.img ? 'active' : ''}" data-action="pick-image" data-i="${i}" aria-label="Фото ${i + 1}"><img src="${src}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.hidden=true"></button>`).join('');
  }
  function updateProductView(p, what) {
    const color = p.colors[sel.ci], tile = $('#product-tile');
    if (what === 'color' || what === 'image') {
      tile.className = tileClass(p, color);
      tile.innerHTML = tileInner(p, color, true, sel.img);
    }
    if (what === 'color') $('#thumbs').innerHTML = thumbsHtml(p, color);
    document.querySelectorAll('#thumbs button').forEach((b, i) => b.classList.toggle('active', i === sel.img));
    $('#color-name').textContent = color.name;
    $('#product-price').innerHTML = priceHtml(p, sel.vi);
    $('#product-monthly').textContent = monthly(finalPrice(p, sel.vi));
    document.querySelectorAll('#swatches .swatch').forEach((b, i) => b.classList.toggle('swatch--active', i === sel.ci));
    document.querySelectorAll('#pills .pill').forEach((b, i) => b.classList.toggle('pill--active', i === sel.vi));
  }

  /* ---------- корзина ---------- */
  function renderCart() {
    const lines = cartLines();
    if (!lines.length) {
      app.innerHTML = `<h1>Корзина</h1><div class="empty"><h3>В корзине пока пусто</h3><p>Добавьте что-нибудь из каталога.</p><a class="btn btn--primary" href="#/catalog">В каталог</a></div>`;
      return;
    }
    const total = cartTotal();
    app.innerHTML = `
      <h1>Корзина</h1>
      <div class="cart">
        <div class="panel" id="cart-list">${lines.map(cartItemHtml).join('')}</div>
        <aside class="panel cart__summary">
          <h3>Итого</h3>
          <div class="summary-row"><span class="muted">${plural(cartCount(), 'товар', 'товара', 'товаров')}</span><span id="sum-items">${fmt(total)}</span></div>
          <div class="summary-row"><span class="muted">Доставка</span><span class="muted">рассчитаем при оформлении</span></div>
          <div class="summary-row summary-row--total"><span>К оплате</span><span id="sum-total">${fmt(total)}</span></div>
          <a class="btn btn--primary btn--block btn--lg" href="#/checkout" style="margin-top:16px">Оформить заказ</a>
          <button class="btn btn--block" data-action="clear-cart" style="margin-top:10px">Очистить корзину</button>
          <div class="trust"><span>Гарантия 12 мес</span><span>Рассрочка 0–0–12</span><span>Возврат 14 дней</span></div>
        </aside>
      </div>`;
  }
  function cartItemHtml(l) {
    return `<div class="cart-item" data-key="${l.key}">
      <a class="${tileClass(l.p, l.color)}" ${tileStyle(l.p)} href="#/product/${l.p.id}">${tileInner(l.p, l.color)}</a>
      <div>
        <a class="cart-item__title" href="#/product/${l.p.id}">${esc(l.p.name)}</a>
        <div class="cart-item__meta">${esc(l.color.name)}${l.variant ? ' · ' + esc(l.variant.name) : ''}</div>
        <div class="cart-item__meta">${fmt(l.price)} / шт.</div>
      </div>
      <div class="cart-item__right">
        <div class="cart-item__price" data-sum>${fmt(l.sum)}</div>
        <div class="qty"><button data-action="qty" data-d="-1" aria-label="Меньше">−</button><span data-qty>${l.qty}</span><button data-action="qty" data-d="1" aria-label="Больше">+</button></div>
        <button class="link-btn" data-action="remove">Удалить</button>
      </div></div>`;
  }
  function refreshCartTotals() {
    const total = cartTotal();
    const items = $('#sum-items'), tot = $('#sum-total');
    if (items) items.textContent = fmt(total);
    if (tot) tot.textContent = fmt(total);
    const label = $('.summary-row .muted');
    if (label) label.textContent = plural(cartCount(), 'товар', 'товара', 'товаров');
  }

  /* ---------- оформление ---------- */
  function renderCheckout() {
    const user = Auth.current();
    if (!user) { go('#/login?next=checkout'); return; }
    const lines = cartLines();
    if (!lines.length) { go('#/cart'); return; }
    const total = cartTotal();
    const delivery = total >= CONFIG.freeDeliveryFrom ? 0 : CONFIG.deliveryPrice;
    app.innerHTML = `
      <h1>Оформление заказа</h1>
      <div class="cart">
        <form class="panel" id="checkout-form" novalidate>
          <h3>Получатель</h3>
          <div class="field"><label for="co-name">Имя</label><input class="input" id="co-name" name="name" required value="${esc(user.name)}"></div>
          <div class="field"><label for="co-phone">Телефон</label><input class="input" id="co-phone" name="phone" type="tel" required placeholder="+998 90 123-45-67" value="${esc(user.phone || '')}"></div>
          <h3 style="margin-top:20px">Способ получения</h3>
          <label class="radio-card"><input type="radio" name="method" value="pickup" checked><div><strong>Самовывоз</strong> — бесплатно<div class="muted" style="font-size:.9rem">Заберёте в удобном магазине сегодня или завтра</div></div></label>
          <label class="radio-card"><input type="radio" name="method" value="courier"><div><strong>Курьером</strong> — ${delivery ? fmt(delivery) : 'бесплатно'}<div class="muted" style="font-size:.9rem">Бесплатно при заказе от ${fmt(CONFIG.freeDeliveryFrom)}</div></div></label>
          <div class="field" id="pickup-field"><label for="co-store">Магазин</label>
            <select class="input" id="co-store" name="store">${STORES.map(s => `<option value="${s.id}">${esc(s.name)} — ${esc(s.address)}</option>`).join('')}</select>
            <a href="#/stores" class="muted" style="font-size:.88rem">Найти ближайший на карте →</a></div>
          <div class="field" id="address-field" hidden><label for="co-address">Адрес доставки</label><input class="input" id="co-address" name="address" placeholder="Город, улица, дом, квартира"></div>
          <div class="form-error" id="co-error"></div>
          <button class="btn btn--primary btn--lg btn--block" type="submit">Подтвердить заказ</button>
        </form>
        <aside class="panel cart__summary">
          <h3>Ваш заказ</h3>
          ${lines.map(l => `<div class="summary-row" style="font-size:.92rem"><span>${esc(l.p.name)} × ${l.qty}<br><span class="muted">${esc(l.color.name)}${l.variant ? ' · ' + esc(l.variant.name) : ''}</span></span><span>${fmt(l.sum)}</span></div>`).join('')}
          <div class="summary-row" style="margin-top:8px"><span class="muted">Доставка</span><span id="co-delivery">бесплатно</span></div>
          <div class="summary-row summary-row--total"><span>К оплате</span><span id="co-total">${fmt(total)}</span></div>
        </aside>
      </div>`;
    const form = $('#checkout-form');
    form.addEventListener('change', e => {
      if (e.target.name !== 'method') return;
      const courier = e.target.value === 'courier';
      $('#pickup-field').hidden = courier; $('#address-field').hidden = !courier;
      $('#co-delivery').textContent = courier && delivery ? fmt(delivery) : 'бесплатно';
      $('#co-total').textContent = fmt(total + (courier ? delivery : 0));
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form), err = $('#co-error');
      const name = fd.get('name').trim(), phone = fd.get('phone').trim(), method = fd.get('method');
      if (!name) return err.textContent = 'Укажите имя';
      if (!/^\+?[\d\s()-]{9,}$/.test(phone)) return err.textContent = 'Укажите корректный телефон';
      const address = method === 'courier' ? fd.get('address').trim() : '';
      if (method === 'courier' && address.length < 5) return err.textContent = 'Укажите адрес доставки';
      const storeObj = STORES.find(s => s.id === Number(fd.get('store')));
      const shipping = method === 'courier' ? delivery : 0;
      const order = {
        id: 'TR-' + Date.now().toString(36).toUpperCase(),
        date: Date.now(), status: 'В обработке',
        items: lines.map(l => ({ name: l.p.name, color: l.color.name, variant: l.variant ? l.variant.name : '', qty: l.qty, price: l.price, sum: l.sum })),
        subtotal: total, shipping, total: total + shipping,
        delivery: method === 'courier' ? { type: 'Курьером', address } : { type: 'Самовывоз', store: storeObj ? `${storeObj.name}, ${storeObj.address}` : '' },
        name, phone,
      };
      const u = Auth.current();
      u.orders.unshift(order); u.name = name; u.phone = phone; Auth.save(u);
      cart = []; saveCart();
      toast('Заказ оформлен!');
      go('#/account?order=' + order.id);
    });
  }

  /* ---------- вход / регистрация ---------- */
  function renderAuth({ query }) {
    if (Auth.current()) { go('#/account'); return; }
    const next = query.get('next') || 'account';
    let mode = query.get('mode') === 'register' ? 'register' : 'login';
    const draw = () => {
      app.innerHTML = `<div class="auth panel">
        <div class="tabs"><button type="button" data-action="auth-tab" data-mode="login" class="${mode === 'login' ? 'active' : ''}">Вход</button><button type="button" data-action="auth-tab" data-mode="register" class="${mode === 'register' ? 'active' : ''}">Регистрация</button></div>
        <form id="auth-form" novalidate>
          ${mode === 'register' ? `<div class="field"><label for="a-name">Имя</label><input class="input" id="a-name" name="name" autocomplete="name" required></div>` : ''}
          <div class="field"><label for="a-email">Электронная почта</label><input class="input" id="a-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="a-pass">Пароль</label><input class="input" id="a-pass" name="pass" type="password" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" required minlength="6"></div>
          <div class="form-error" id="auth-error"></div>
          <button class="btn btn--primary btn--block btn--lg" type="submit">${mode === 'register' ? 'Создать аккаунт' : 'Войти'}</button>
        </form>
        <p class="muted" style="font-size:.85rem;margin:14px 0 0">Демо: данные хранятся только в вашем браузере.</p>
      </div>`;
      $('#auth-form').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target), err = $('#auth-error');
        const email = (fd.get('email') || '').trim(), pass = fd.get('pass') || '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err.textContent = 'Введите корректную почту';
        if (pass.length < 6) return err.textContent = 'Пароль не короче 6 символов';
        try {
          if (mode === 'register') {
            const name = (fd.get('name') || '').trim();
            if (name.length < 2) return err.textContent = 'Введите имя';
            await Auth.register(name, email, pass);
            toast('Добро пожаловать, ' + name + '!');
          } else {
            await Auth.login(email, pass);
            toast('Вы вошли');
          }
          go('#/' + next);
        } catch (ex) { err.textContent = ex.message; }
      });
    };
    draw();
    app._switchAuth = m => { mode = m; draw(); };
  }

  /* ---------- личный кабинет ---------- */
  function renderAccount({ query }) {
    const u = Auth.current();
    if (!u) { go('#/login'); return; }
    const hl = query.get('order');
    const dateFmt = ts => new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    app.innerHTML = `
      <h1>Личный кабинет</h1>
      <div class="account">
        <aside class="panel">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div class="avatar" style="position:static;width:48px;height:48px;font-size:1.2rem;border-radius:12px">${esc(u.name.charAt(0).toUpperCase())}</div>
            <div><div style="font-weight:700">${esc(u.name)}</div><div class="muted" style="font-size:.9rem">${esc(u.email)}</div></div>
          </div>
          ${u.phone ? `<div class="muted" style="font-size:.92rem">Телефон: ${esc(u.phone)}</div>` : ''}
          <div class="stats">
            <div class="stat"><b>${u.orders.length}</b><span>${plural(u.orders.length, 'заказ', 'заказа', 'заказов').replace(/^\d+ /, '')}</span></div>
            <div class="stat"><b>${fmt(u.orders.reduce((s, o) => s + o.total, 0))}</b><span>сумма покупок</span></div>
          </div>
          <button class="btn btn--block" data-action="logout">Выйти</button>
        </aside>
        <section class="panel">
          <h3>Мои покупки</h3>
          ${u.orders.length ? u.orders.map(o => `
            <details class="order" ${o.id === hl ? 'open' : ''}>
              <summary><span>Заказ ${esc(o.id)} <span class="muted" style="font-weight:400">· ${dateFmt(o.date)}</span></span><span><span class="order__status">${esc(o.status)}</span> &nbsp; ${fmt(o.total)}</span></summary>
              <div class="order__items">
                <ul>${o.items.map(i => `<li><span>${esc(i.name)} × ${i.qty}<br><span class="muted">${esc(i.color)}${i.variant ? ' · ' + esc(i.variant) : ''}</span></span><span>${fmt(i.sum)}</span></li>`).join('')}</ul>
                <div class="summary-row" style="margin-top:8px"><span class="muted">Доставка</span><span>${o.shipping ? fmt(o.shipping) : 'бесплатно'}</span></div>
                <div class="muted" style="font-size:.9rem;margin-top:6px">${esc(o.delivery.type)}: ${esc(o.delivery.address || o.delivery.store)}</div>
              </div>
            </details>`).join('')
          : `<div class="empty"><p>Покупок пока нет.</p><a class="btn btn--primary" href="#/catalog">В каталог</a></div>`}
        </section>
      </div>`;
  }

  /* ---------- магазины и карта ---------- */
  let mapInstance = null, leafletPromise = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CONFIG.leaflet.css; document.head.appendChild(link);
      const s = document.createElement('script'); s.src = CONFIG.leaflet.js; s.async = true;
      s.onload = resolve; s.onerror = () => { leafletPromise = null; reject(new Error('Не удалось загрузить карту')); };
      document.head.appendChild(s);
    });
    return leafletPromise;
  }
  const distKm = (a, b) => {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  function renderStores() {
    app.innerHTML = `
      <h1>Магазины</h1>
      <p class="muted">Нажмите «Найти ближайший», чтобы определить магазин рядом с вами, или выберите точку на карте.</p>
      <div class="stores">
        <div>
          <button class="btn btn--primary btn--block" data-action="locate" id="locate-btn" style="margin-bottom:12px">Найти ближайший магазин</button>
          <div class="form-error" id="geo-error"></div>
          <div class="store-list" id="store-list">${STORES.map(s => storeHtml(s)).join('')}</div>
        </div>
        <div class="map" id="map">Загрузка карты…</div>
      </div>`;
    loadLeaflet().then(initMap).catch(() => { const m = $('#map'); if (m) m.textContent = 'Карта недоступна без интернета. Список магазинов выше.'; });
  }
  function storeHtml(s, d) {
    return `<div class="store ${d && d.nearest ? 'store--nearest' : ''}" data-action="focus-store" data-id="${s.id}">
      <div class="store__name"><span>${esc(s.name)}</span>${d ? `<span class="store__dist">${d.km < 1 ? Math.round(d.km * 1000) + ' м' : d.km.toFixed(1) + ' км'}</span>` : ''}</div>
      <div class="store__meta">${esc(s.address)}</div>
      <div class="store__meta">${esc(s.hours)} · ${esc(s.phone)}</div>
      ${d && d.nearest ? `<div class="muted" style="font-size:.85rem;margin-top:4px">Ближайший к вам</div>` : ''}
    </div>`;
  }
  const markers = {};
  function initMap() {
    const el = $('#map');
    if (!el || currentPage !== 'stores') return;
    el.textContent = '';
    mapInstance = L.map(el, { scrollWheelZoom: false }).setView([MAP_CENTER.lat, MAP_CENTER.lng], MAP_CENTER.zoom);
    L.tileLayer(CONFIG.leaflet.tiles, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(mapInstance);
    STORES.forEach(s => {
      markers[s.id] = L.marker([s.lat, s.lng]).addTo(mapInstance)
        .bindPopup(`<strong>${esc(s.name)}</strong><br>${esc(s.address)}<br>${esc(s.hours)}`);
    });
  }
  function focusStore(id) {
    const s = STORES.find(x => x.id === Number(id));
    if (!s || !mapInstance) return;
    mapInstance.setView([s.lat, s.lng], 15, { animate: true });
    markers[s.id] && markers[s.id].openPopup();
    $('#map').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function locate() {
    const btn = $('#locate-btn'), err = $('#geo-error');
    err.textContent = '';
    if (!navigator.geolocation) { err.textContent = 'Геолокация не поддерживается браузером'; return; }
    btn.disabled = true; btn.textContent = 'Определяем местоположение…';
    navigator.geolocation.getCurrentPosition(pos => {
      const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const sorted = STORES.map(s => ({ s, km: distKm(me, s) })).sort((a, b) => a.km - b.km);
      $('#store-list').innerHTML = sorted.map((x, i) => storeHtml(x.s, { km: x.km, nearest: i === 0 })).join('');
      btn.disabled = false; btn.textContent = 'Обновить местоположение';
      toast('Ближайший: ' + sorted[0].s.name);
      if (mapInstance && window.L) {
        L.circleMarker([me.lat, me.lng], { radius: 9, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(mapInstance).bindPopup('Вы здесь');
        const n = sorted[0].s;
        mapInstance.fitBounds([[me.lat, me.lng], [n.lat, n.lng]], { padding: [60, 60], maxZoom: 15 });
        markers[n.id] && markers[n.id].openPopup();
      }
    }, e => {
      btn.disabled = false; btn.textContent = 'Найти ближайший магазин';
      err.textContent = e.code === 1 ? 'Доступ к геолокации запрещён. Разрешите его в настройках браузера.' : 'Не удалось определить местоположение.';
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function renderNotFound() {
    app.innerHTML = `<div class="empty"><h1>Страница не найдена</h1><a class="btn btn--primary" href="#/">На главную</a></div>`;
  }

  /* ---------- делегирование событий ---------- */
  app.addEventListener('click', e => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'pick-color' || a === 'pick-variant' || a === 'pick-image') {
      const p = byId(parseHash().param); if (!p) return;
      if (a === 'pick-color') { sel.ci = Number(t.dataset.i); sel.img = 0; updateProductView(p, 'color'); }
      else if (a === 'pick-image') { sel.img = Number(t.dataset.i); updateProductView(p, 'image'); }
      else { sel.vi = Number(t.dataset.i); updateProductView(p, 'variant'); }
    } else if (a === 'add-to-cart') {
      addToCart(t.dataset.id, sel.ci, sel.vi);
      toast('Добавлено в корзину');
      t.textContent = 'Добавлено ✓'; setTimeout(() => { t.textContent = 'В корзину'; }, 1200);
    } else if (a === 'buy-now') {
      addToCart(t.dataset.id, sel.ci, sel.vi);
      go('#/checkout');
    } else if (a === 'qty' || a === 'remove') {
      const row = t.closest('.cart-item'), [id, ci, vi] = row.dataset.key.split('|');
      const idx = cart.findIndex(it => it.id === id && it.ci === +ci && it.vi === +vi);
      if (idx < 0) return;
      if (a === 'remove') cart.splice(idx, 1);
      else { cart[idx].qty += Number(t.dataset.d); if (cart[idx].qty <= 0) cart.splice(idx, 1); }
      saveCart();
      if (!cart.length) return renderCart();
      const line = cartLines().find(l => l.key === row.dataset.key);
      if (!line) row.remove(); else { row.querySelector('[data-qty]').textContent = line.qty; row.querySelector('[data-sum]').textContent = fmt(line.sum); }
      refreshCartTotals();
    } else if (a === 'clear-cart') {
      cart = []; saveCart(); renderCart();
    } else if (a === 'auth-tab') {
      app._switchAuth && app._switchAuth(t.dataset.mode);
    } else if (a === 'logout') {
      Auth.logout(); toast('Вы вышли'); go('#/');
    } else if (a === 'locate') {
      locate();
    } else if (a === 'focus-store') {
      focusStore(t.dataset.id);
    } else if (a === 'slide') {
      stopSlider(); showSlide(slideIdx + Number(t.dataset.d));
    } else if (a === 'slide-to') {
      stopSlider(); showSlide(Number(t.dataset.i));
    }
  });

  /* Переключатель темы: сохраняем выбор, иначе следуем системной */
  $('#theme-btn').addEventListener('click', () => {
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : systemDark;
    root.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('tr_theme', root.dataset.theme); } catch {}
    if (mapInstance) mapInstance.invalidateSize();
  });

  /* Переключатель варианта дизайна: меняем файл скина и перерисовываем страницу */
  const skinSelect = $('#skin-select');
  function applySkinButtons() { skinSelect.value = skin(); }
  skinSelect.addEventListener('change', () => {
    const s = skinSelect.value;
    if (!(s in SKINS) || s === skin()) return;
    root.dataset.skin = s;
    $('#skin-css').href = `css/skin-${s}.css`;
    try { localStorage.setItem('tr_skin', s); } catch {}
    navigate();
    toast(SKINS[s]);
  });

  $('#search-form').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('#search-input').value.trim();
    go('#/catalog' + (q ? '?q=' + encodeURIComponent(q) : ''));
  });

  window.addEventListener('hashchange', navigate);
  applySkinButtons();
  updateCartBadge();
  updateHeader();
  navigate();
})();
