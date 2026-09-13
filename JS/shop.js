/* OMAN SOUNDS — shop (PROTOTYPE).
   General store: digital goods (fonts, delivered as instant downloads)
   AND physical merch (posters, tees — shipped). Front-end only: a
   localStorage cart + mock checkout. No payment, no data leaves the browser.

   ── PAYMENTS: Lemon Squeezy / Paddle (recommended) ────────────────
   Both are "merchant of record": THEY collect payment, handle EU/DE VAT
   (MwSt./OSS), issue invoices, and — key for you — deliver digital files
   automatically. You upload each font .zip as the product's file; on a
   successful purchase the buyer is emailed a secure, expiring download
   link (and a licence key) instantly. No download server to run yourself.

   To go live:
     1. Create the products in Lemon Squeezy (or Paddle). For each font,
        attach the .zip and set the licence tiers as variants.
     2. Put the resulting checkout URL / variant id for each variant into
        PAYMENTS below.
     3. Load their JS (lemon.js / paddle.js) in index.html and flip
        PAYMENTS.provider. checkout() then opens their overlay instead of
        the mock. Everything else here (catalogue, cart, UI) stays.
   ── PRIVACY (DE): Datenschutzerklärung + consent banner only once an
   external checkout/analytics loads. This prototype loads nothing external.
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  var money = function (n) { return '€' + (Math.round(n * 100) / 100).toLocaleString('en', { minimumFractionDigits: n % 1 ? 2 : 0 }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- payment provider (wire up later) ---------- */
  var PAYMENTS = {
    provider: null,            // 'lemonsqueezy' | 'paddle' — null keeps the mock
    // Lemon Squeezy: 'productId|variantLabel' -> hosted checkout URL
    // Paddle:        'productId|variantLabel' -> priceId
    map: {}
  };

  /* ---------- catalogue ----------
     A product has variants [{label, price}]. Fonts get licence tiers +
     a `file`; merch gets an image + sizes/options and ships. Swap these
     for the real catalogue — add merch freely. */
  var LICENCE = [
    { label: 'Desktop — up to 5 devices', price: 39 },
    { label: 'Web (@font-face)', price: 59 },
    { label: 'App / embedding', price: 120 },
    { label: 'Complete — all uses', price: 199 }
  ];
  var sizes = function (price) { return ['S', 'M', 'L', 'XL'].map(function (s) { return { label: 'Size ' + s, price: price }; }); };

  var PRODUCTS = [
    { id: 'slanted-data', type: 'font', name: 'Slanted Data', kind: 'display typeface',
      face: 'arpon', glyph: 'Aa', meta: '6 weights + italics · 12 styles', file: 'slanted-data.zip',
      blurb: 'The flagship display cut — sharp, off-axis letterforms drawn for covers, posters and the oman sounds identity.',
      variants: LICENCE },
    { id: 'slanted-data-var', type: 'font', name: 'Slanted Data Variable', kind: 'variable typeface',
      face: 'geist', glyph: 'Bb', meta: '1 variable file · wght + slnt', file: 'slanted-data-variable.zip',
      blurb: 'One file, the full range. Animate weight and slant on the web, or pick any static instance for print.',
      variants: LICENCE },
    { id: 'hell-poster', type: 'merch', name: 'hell01101111 Poster', kind: 'A2 riso print',
      image: '../MEDIA/ALBUM_ART/hell01101111_ART.webp', meta: 'A2 · 200gsm · numbered edition',
      blurb: 'A2 print of the hell01101111 artwork. Numbered, shipped rolled in a tube.',
      variants: [{ label: 'A2 print', price: 35 }] },
    { id: 'spectral-poster', type: 'merch', name: 'Spectral Complications Poster', kind: 'A2 riso print',
      image: '../MEDIA/ALBUM_ART/SPECTRAL_COMPLICATIONS.webp', meta: 'A2 · 200gsm · numbered edition',
      blurb: 'A2 print of the Spectral Complications cover. Numbered, shipped rolled.',
      variants: [{ label: 'A2 print', price: 35 }] },
    { id: 'sigil-tee', type: 'merch', name: 'Sigil Tee', kind: 'heavyweight shirt',
      image: '../MEDIA/OS_LOGO_BLACK.png', meta: 'heavyweight cotton · unisex',
      blurb: 'Heavyweight tee screen-printed with the O sigil. Unisex fit — see the size guide before ordering.',
      variants: sizes(40) }
  ];
  var byId = function (id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; };
  var minPrice = function (p) { return p.variants.reduce(function (m, v) { return Math.min(m, v.price); }, Infinity); };
  var isFont = function (p) { return p.type === 'font'; };

  /* ---------- cart ---------- */
  var CART_KEY = 'os-shop-cart';
  function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} }
  var cart = loadCart();
  var cartTotal = function () { return cart.reduce(function (s, i) { return s + i.price; }, 0); };

  /* ---------- grid ---------- */
  function media(p) {
    return isFont(p)
      ? '<div class="card-specimen face-' + p.face + '">' + p.glyph + '</div>'
      : '<div class="card-media"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy"></div>';
  }
  function renderGrid() {
    var grid = $('#product-grid'); if (!grid) return;
    grid.innerHTML = '';
    PRODUCTS.forEach(function (p) {
      var single = p.variants.length === 1;
      var card = document.createElement('button');
      card.className = 'card'; card.type = 'button'; card.setAttribute('aria-label', p.name);
      card.innerHTML = media(p) +
        '<div class="card-info"><span><span class="card-name">' + p.name + '</span>' +
        '<span class="card-kind">' + p.kind + '</span></span>' +
        '<span class="card-from">' + (single ? '' : 'from&nbsp;') + '<b>' + money(minPrice(p)) + '</b></span></div>';
      card.addEventListener('click', function () { openProduct(p.id); });
      grid.appendChild(card);
    });
  }

  /* ---------- product dialog ---------- */
  var modal = $('#product-modal');
  var current = null;

  function openProduct(id) {
    var p = byId(id); if (!p || !modal) return;
    current = p;
    var spec = $('#pm-specimen');
    if (isFont(p)) { spec.className = 'pmodal-specimen face-' + p.face; spec.innerHTML = p.glyph; }
    else { spec.className = 'pmodal-specimen pmodal-media'; spec.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '">'; }
    $('#pm-kind').textContent = p.kind;
    $('#pm-name').textContent = p.name;
    $('#pm-blurb').textContent = p.blurb;

    // meta rows differ per type
    var rows = isFont(p)
      ? [['styles', p.meta], ['formats', 'otf · woff2 · variable'], ['licence', '<a href="../eula/">EULA v1.0 →</a>']]
      : [['details', p.meta], ['delivery', 'ships worldwide · 3–5 days']];
    $('#pm-meta').innerHTML = rows.map(function (r) {
      return '<dt class="mono dim">' + r[0] + '</dt><dd>' + r[1] + '</dd>';
    }).join('');

    $('#pm-tier-label').textContent = isFont(p) ? 'licence type' : (p.variants.length > 1 ? 'size' : 'option');
    var tier = $('#pm-tier'); tier.innerHTML = '';
    p.variants.forEach(function (v, i) {
      var o = document.createElement('option'); o.value = i;
      o.textContent = v.label + (p.variants.length > 1 || isFont(p) ? '  ·  ' + money(v.price) : '');
      tier.appendChild(o);
    });
    tier.style.display = p.variants.length > 1 ? '' : 'none';
    $('#pm-note').textContent = isFont(p) ? 'prices incl. 19% VAT (DE) · instant download' : 'prices incl. 19% VAT (DE) · shipped';
    updatePrice();
    if (typeof modal.showModal === 'function') modal.showModal();
  }
  function curVariant() { return current.variants[+$('#pm-tier').value || 0]; }
  function updatePrice() { $('#pm-price').textContent = money(curVariant().price); }

  if (modal) {
    $('#pm-tier').addEventListener('change', updatePrice);
    $('#pm-add').addEventListener('click', function () {
      var v = curVariant();
      cart.push({ id: current.id, name: current.name, type: current.type, variant: v.label, price: v.price, file: current.file || null });
      saveCart(cart); renderCart(); modal.close(); openCart();
    });
    modal.querySelector('[data-close]').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  }

  /* ---------- cart drawer ---------- */
  var cartEl = $('#cart'), scrim = $('#cart-scrim');
  function openCart() { if (!cartEl) return; cartEl.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); scrim.hidden = false; }
  function closeCart() { if (!cartEl) return; cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); scrim.hidden = true; }

  function renderCart() {
    var count = $('#cart-count'); if (count) count.textContent = cart.length;
    var wrap = $('#cart-items'); if (!wrap) return;
    wrap.innerHTML = '';
    cart.forEach(function (item, idx) {
      var tag = item.type === 'font' ? '⬇ download' : '✦ ships';
      var line = document.createElement('div'); line.className = 'cart-line';
      line.innerHTML =
        '<span class="cl-name">' + item.name + '</span>' +
        '<span class="cl-price">' + money(item.price) + '</span>' +
        '<span class="cl-tier">' + item.variant + ' · ' + tag + '</span>' +
        '<button type="button" class="cl-remove" data-i="' + idx + '">remove</button>';
      wrap.appendChild(line);
    });
    wrap.querySelectorAll('.cl-remove').forEach(function (b) {
      b.addEventListener('click', function () { cart.splice(+b.dataset.i, 1); saveCart(cart); renderCart(); });
    });
    $('#cart-total').textContent = money(cartTotal());
    var empty = cart.length === 0;
    $('#cart-checkout').disabled = empty;
    $('#cart-empty-note').style.display = empty ? '' : 'none';
  }
  if ($('#cart-btn')) $('#cart-btn').addEventListener('click', openCart);
  if (scrim) scrim.addEventListener('click', closeCart);
  if (cartEl) cartEl.querySelector('[data-close-cart]').addEventListener('click', closeCart);

  /* ---------- checkout ---------- */
  var checkout = $('#checkout');
  function openCheckout() {
    if (!checkout || !cart.length) return;
    var gross = cartTotal(), net = gross / 1.19, vat = gross - net;
    var hasShip = cart.some(function (i) { return i.type !== 'font'; });
    $('#co-ship').hidden = !hasShip;   // show address only if merch in cart
    var sum = $('#co-summary'); sum.innerHTML = '';
    cart.forEach(function (i) {
      sum.insertAdjacentHTML('beforeend', '<div class="co-sum-row"><span>' + i.name + ' · ' + i.variant + '</span><span>' + money(i.price) + '</span></div>');
    });
    sum.insertAdjacentHTML('beforeend',
      '<div class="co-sum-row"><span>net</span><span>' + money(net) + '</span></div>' +
      '<div class="co-sum-row"><span>VAT 19% (DE)</span><span>' + money(vat) + '</span></div>' +
      '<div class="co-sum-row total"><span>total</span><span>' + money(gross) + '</span></div>');
    $('#co-pay-amt').textContent = money(gross);
    closeCart();
    if (typeof checkout.showModal === 'function') checkout.showModal();
  }
  if ($('#cart-checkout')) $('#cart-checkout').addEventListener('click', openCheckout);

  // Real integration lands here: build line items from `cart`, then
  // provider.checkout(...) — Lemon Squeezy overlay or Paddle.Checkout.open.
  function completeOrder(email) {
    var downloads = cart.filter(function (i) { return i.type === 'font'; });
    var dl = downloads.map(function (i) {
      return '<button type="button" class="co-dl" data-file="' + (i.file || '') + '">⬇&nbsp;download ' + i.name + '</button>';
    }).join('');
    $('#checkout-form').innerHTML =
      '<p class="mono dim eyebrow">◍&nbsp;prototype</p><h2>order captured</h2>' +
      '<p>Live, the payment provider charges the card and emails everything to <b>' + email + '</b>. Nothing was charged.</p>' +
      (downloads.length ? '<p class="mono dim" style="margin:1.2rem 0 .6rem;letter-spacing:.1em">your downloads (delivered instantly):</p><div class="co-dls">' + dl + '</div>' : '') +
      '<p class="mono dim" style="margin-top:1.2rem;letter-spacing:.1em">cart cleared — you can close this.</p>';
    $('#checkout-form').querySelectorAll('.co-dl').forEach(function (b) {
      b.addEventListener('click', function () {
        alert('Prototype: your real, secure download link for "' + b.textContent.replace('⬇ download ', '').trim() +
              '" is generated and emailed automatically by Lemon Squeezy / Paddle after payment.');
      });
    });
    cart = []; saveCart(cart); renderCart();
  }

  if (checkout) {
    checkout.querySelector('[data-close-checkout]').addEventListener('click', function () { checkout.close(); });
    $('#checkout-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (this.querySelector('[name=email]') || {}).value || 'your email';
      completeOrder(email);
    });
  }

  /* ---------- misc ---------- */
  if ($('#privacy-link')) $('#privacy-link').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Datenschutzerklärung (privacy policy) — to be added before launch. This prototype keeps your cart only in your own browser and sends nothing to a server.');
  });
  if ($('#theme-toggle')) $('#theme-toggle').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('os-theme', next); } catch (e) {}
  });
  if ($('#y')) $('#y').textContent = String(new Date().getFullYear());

  renderGrid();
  renderCart();
})();
