const SUPABASE_URL = 'https://ovheehjwoaoabeedmxtf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ICu-p7MayHGAY7UYYBTYRA_pLagX_8b';

const clothes = ['XS', 'S', 'M', 'L', 'XL'];

const demo = [
  { id: 1, name: 'Асимметричное пальто', price: 42000, gender: 'women', category: 'outerwear', sizes: clothes, image_url: '', description: 'Тяжёлая шерсть, запах со смещением и длинный левый борт. Сидит свободно, форму держит сама.' },
  { id: 2, name: 'Укороченная куртка из хлопка', price: 28500, gender: 'men', category: 'outerwear', sizes: clothes, image_url: '', description: 'Плотный хлопок, прямой силуэт, спрятанные карманы. Без лишних деталей.' },
  { id: 3, name: 'Рубашка с удлинённой спинкой', price: 14800, gender: 'men', category: 'tops', sizes: clothes, image_url: '', description: 'Спинка заметно длиннее переда. Воротник-стойка, пуговицы скрыты планкой.' },
  { id: 4, name: 'Драпированный топ', price: 11200, gender: 'women', category: 'tops', sizes: clothes, image_url: '', description: 'Мягкий трикотаж, складки собраны на одном плече.' },
  { id: 5, name: 'Широкие брюки со складками', price: 17600, gender: 'men', category: 'trousers', sizes: clothes, image_url: '', description: 'Высокая посадка, глубокие складки, штанина сужается книзу.' },
  { id: 6, name: 'Юбка-кокон', price: 15900, gender: 'women', category: 'dresses', sizes: clothes, image_url: '', description: 'Объём по бёдрам, узкий низ. Чёрная костюмная ткань.' },
  { id: 7, name: 'Платье-рубашка', price: 24500, gender: 'women', category: 'dresses', sizes: clothes, image_url: '', description: 'Длинное, прямое, с асимметричным подолом.' },
  { id: 8, name: 'Худи свободного кроя', price: 13900, gender: 'unisex', category: 'tops', sizes: clothes, image_url: '', description: 'Тяжёлый футер, капюшон без шнурков, заниженная линия плеча.' },
  { id: 9, name: 'Кожаный пояс', price: 6400, gender: 'unisex', category: 'accessories', sizes: ['one size'], image_url: '', description: 'Широкий, без логотипов. Пряжка из матовой стали.' },
  { id: 10, name: 'Шерстяной шарф', price: 5200, gender: 'unisex', category: 'accessories', sizes: ['one size'], image_url: '', description: 'Длинный, с необработанным краем.' }
];

const names = {
  gender: { men: 'Мужское', women: 'Женское', unisex: 'Унисекс' },
  category: { outerwear: 'Верхняя одежда', tops: 'Верх', trousers: 'Брюки', dresses: 'Платья и юбки', accessories: 'Аксессуары' },
  sort: { asc: 'Сначала дешевле', desc: 'Сначала дороже' }
};

const db = (SUPABASE_URL && SUPABASE_KEY && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const $ = (sel) => document.querySelector(sel);
const money = (n) => Number(n).toLocaleString('ru-RU') + ' ₽';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadProducts() {
  if (!db) return demo;
  const { data, error } = await db.from('products').select('*').order('id');
  if (error) {
    console.error(error);
    return demo;
  }
  return data;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('kuro_cart')) || []; }
  catch (e) { return []; }
}

function setCart(cart) {
  try { localStorage.setItem('kuro_cart', JSON.stringify(cart)); } catch (e) {}
  drawHeader();
}

function addToCart(id, size) {
  const cart = getCart();
  const found = cart.find((l) => l.id == id && l.size === size);
  if (found) found.qty++;
  else cart.push({ id: id, size: size, qty: 1 });
  setCart(cart);
}

function drawHeader() {
  const count = getCart().reduce((n, l) => n + l.qty, 0);
  const page = location.pathname.split('/').pop() || 'index.html';
  const gender = new URLSearchParams(location.search).get('gender');
  const link = (href, text, here) => `<a href="${href}"${here ? ' class="here"' : ''}>${text}</a>`;
  $('#top').innerHTML = `
    <a class="logo" href="index.html">KURO</a>
    <nav>
      ${link('shop.html', 'Каталог', page === 'shop.html' && !gender)}
      ${link('shop.html?gender=men', 'Мужское', gender === 'men')}
      ${link('shop.html?gender=women', 'Женское', gender === 'women')}
      ${link('cart.html', 'Корзина' + (count ? ' (' + count + ')' : ''), page === 'cart.html')}
    </nav>`;
}

function card(p) {
  const img = p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">` : '';
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="pic">${img}</div>
    <div class="name">${esc(p.name)}</div>
    <div class="price">${money(p.price)}</div>
  </a>`;
}

async function homePage() {
  const all = await loadProducts();
  $('#featured').innerHTML = all.slice(0, 4).map(card).join('');
}

async function shopPage() {
  const all = await loadProducts();
  const params = new URLSearchParams(location.search);
  const state = {
    gender: params.get('gender') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || ''
  };

  function draw() {
    const groups = [['gender', 'Для кого'], ['category', 'Тип вещи'], ['sort', 'Порядок']];
    $('#filters').innerHTML = groups.map(([key, title]) => {
      const opts = Object.entries(names[key]);
      const buttons = [['', 'Все']].concat(opts).map(([val, label]) =>
        `<button data-key="${key}" data-val="${val}"${state[key] === val ? ' class="on"' : ''}>${label}</button>`
      ).join('');
      return `<div class="group"><span>${title}</span>${buttons}</div>`;
    }).join('');

    let list = all.filter((p) =>
      (!state.gender || p.gender === state.gender || p.gender === 'unisex') &&
      (!state.category || p.category === state.category)
    );
    if (state.sort === 'asc') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list.sort((a, b) => b.price - a.price);

    $('#count').textContent = list.length ? 'Вещей: ' + list.length : '';
    $('#list').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">По этим условиям ничего нет. Сбросьте один из фильтров.</p>';

    const q = new URLSearchParams();
    for (const k in state) if (state[k]) q.set(k, state[k]);
    history.replaceState(null, '', q.toString() ? '?' + q : location.pathname);
    drawHeader();
  }

  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state[b.dataset.key] = b.dataset.val;
    draw();
  });
  draw();
}

async function productPage() {
  const id = new URLSearchParams(location.search).get('id');
  const all = await loadProducts();
  const p = all.find((x) => String(x.id) === id);
  if (!p) {
    $('#item').innerHTML = '<p class="empty">Такой вещи нет. <a class="line" href="shop.html">Вернуться в каталог</a></p>';
    return;
  }
  document.title = p.name + ' — KURO';
  const sizes = (p.sizes && p.sizes.length) ? p.sizes : clothes;
  let chosen = sizes.length === 1 ? sizes[0] : '';
  const img = p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}">` : '';

  $('#item').innerHTML = `
    <div class="pic">${img}</div>
    <div>
      <h1>${esc(p.name)}</h1>
      <div class="price">${money(p.price)}</div>
      <p class="desc">${esc(p.description)}</p>
      <div>Размер</div>
      <div class="sizes">${sizes.map((s) => `<button data-size="${esc(s)}"${s === chosen ? ' class="on"' : ''}>${esc(s)}</button>`).join('')}</div>
      <button class="btn" id="add">В корзину</button>
      <div class="note" id="note"></div>
    </div>`;

  $('.sizes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    chosen = b.dataset.size;
    document.querySelectorAll('.sizes button').forEach((x) => x.classList.toggle('on', x === b));
  });
  $('#add').addEventListener('click', () => {
    if (!chosen) { $('#note').textContent = 'Выберите размер.'; return; }
    addToCart(p.id, chosen);
    $('#note').innerHTML = 'Добавлено. <a class="line" href="cart.html">Перейти в корзину</a>';
  });
}

async function cartPage() {
  const all = await loadProducts();

  function draw() {
    const cart = getCart().filter((l) => all.some((p) => p.id == l.id));
    const root = $('#cart');
    if (!cart.length) {
      root.innerHTML = '<div><h1>Корзина</h1><p class="empty">Пока пусто. <a class="line" href="shop.html">Выбрать вещи</a></p></div>';
      return;
    }
    const total = cart.reduce((s, l) => s + all.find((p) => p.id == l.id).price * l.qty, 0);
    const rows = cart.map((l, i) => {
      const p = all.find((x) => x.id == l.id);
      return `<div class="row">
        <div>${esc(p.name)}<small>Размер: ${esc(l.size)}</small></div>
        <div class="qty"><button data-act="minus" data-i="${i}">−</button>${l.qty}<button data-act="plus" data-i="${i}">+</button></div>
        <div>${money(p.price * l.qty)}</div>
      </div>`;
    }).join('');

    root.innerHTML = `
      <div><h1>Корзина</h1>${rows}<div class="total"><span>Итого</span><span>${money(total)}</span></div></div>
      <div>
        <h1>Доставка</h1>
        <label for="name">Имя</label><input id="name" autocomplete="name">
        <label for="phone">Телефон</label><input id="phone" autocomplete="tel" inputmode="tel">
        <label for="address">Адрес</label><input id="address" autocomplete="street-address">
        <button class="btn" id="pay">Оплатить ${money(total)}</button>
        <div class="note" id="note"></div>
      </div>`;
  }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const cart = getCart();

    if (b.dataset.act) {
      const line = cart[b.dataset.i];
      line.qty += b.dataset.act === 'plus' ? 1 : -1;
      setCart(cart.filter((l) => l.qty > 0));
      draw();
    }

    if (b.id === 'pay') {
      const name = $('#name').value.trim();
      const phone = $('#phone').value.trim();
      const address = $('#address').value.trim();
      if (!name || !phone || !address) { $('#note').textContent = 'Заполните все поля.'; return; }

      const items = cart.map((l) => {
        const p = all.find((x) => x.id == l.id);
        return { id: p.id, name: p.name, size: l.size, qty: l.qty, price: p.price };
      });
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);

      b.disabled = true;
      if (db) {
        const { error } = await db.from('orders').insert({
          customer_name: name, phone: phone, address: address,
          items: items, total: total, status: 'paid'
        });
        if (error) {
          console.error(error);
          $('#note').textContent = 'Не получилось оформить заказ. Попробуйте ещё раз.';
          b.disabled = false;
          return;
        }
      }
      setCart([]);
      $('#cart').innerHTML = `<div class="done"><h1>Заказ оплачен</h1><p>Спасибо, ${esc(name)}. Мы свяжемся с вами по номеру ${esc(phone)}.</p><p style="margin-top:28px"><a class="line" href="shop.html">Вернуться в каталог</a></p></div>`;
    }
  });
  draw();
}

drawHeader();
const page = document.body.dataset.page;
if (page === 'home') homePage();
if (page === 'shop') shopPage();
if (page === 'product') productPage();
if (page === 'cart') cartPage();
