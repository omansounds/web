/* OMAN SOUNDS — type shop (PROTOTYPE).
   Front-end only: catalogue, licence tiers, a localStorage cart and a
   mock checkout. No network calls, no payment, no personal data leaves
   the browser.

   ── WIRING IT UP LATER ────────────────────────────────────────────
   A static site can't take card payments by itself; you add a provider.
   Options, roughly easiest → most control:
     · Lemon Squeezy / Paddle — "merchant of record". THEY handle EU/DE
       VAT (MwSt./OSS), invoices and fraud. Best for a solo foundry in
       Germany — least legal/tax burden. Drop-in overlay checkout.
     · Gumroad — you already have one; simplest, but least on-brand.
     · Stripe (Checkout / Payment Links) — full control & lowest fees,
       BUT you become responsible for German VAT + invoicing yourself.
     · Shopify / WooCommerce — full platforms; overkill for a few fonts.
   Whichever we choose, "checkout" below is replaced by a call that
   creates a session on that provider and redirects/opens their overlay;
   the font files are delivered by their download/license system.

   ── PRIVACY / GERMANY (to do before launch) ───────────────────────
   · Datenschutzerklärung (privacy policy) + working Impressum (exists).
   · Cookie/consent banner ONLY if you load anything non-essential
     (analytics, embedded checkout that sets cookies) — consent BEFORE
     load (TTDSG/GDPR). This prototype loads nothing external, so none
     needed yet.
   · Show gross prices incl. MwSt., provide an invoice, and get the
     explicit "start download now, waive 14-day withdrawal" consent
     (already in the checkout form).
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  var money = function (n) { return '€' + (Math.round(n * 100) / 100).toLocaleString('en', { minimumFractionDigits: n % 1 ? 2 : 0 }); };

  var TIERS = [
    { id: 'desktop',  label: 'Desktop — up to 5 devices', price: 39 },
    { id: 'web',      label: 'Web (@font-face)',          price: 59 },
    { id: 'app',      label: 'App / embedding',           price: 120 },
    { id: 'complete', label: 'Complete — all uses',       price: 199 }
  ];
  var tierById = function (id) { for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i]; return TIERS[0]; };

  // Placeholder catalogue — swap specimens/prices for the real release.
  // `face` picks which installed face renders the specimen (arpon | geist).
  var PRODUCTS = [
    { id: 'slanted-data', name: 'Slanted Data', kind: 'display', face: 'arpon',
      glyph: 'Aa', sample: 'oman sounds', styles: '6 weights + italics · 12 styles',
      blurb: 'The flagship display cut — sharp, off-axis letterforms drawn for covers, posters and the oman sounds identity.' },
    { id: 'slanted-data-mono', name: 'Slanted Data Mono', kind: 'monospace', face: 'geist',
      glyph: '01', sample: '01101111', styles: '5 weights',
      blurb: 'A fixed-width companion for tracklists, code and captions. Tabular by default, with the same slanted DNA.' },
    { id: 'slanted-data-var', name: 'Slanted Data Variable', kind: 'variable', face: 'geist',
      glyph: 'Bb', sample: 'wght 100–900', styles: '1 variable file · wght + slnt',
      blurb: 'One file, the full range. Animate weight and slant on the web, or pick any static instance for print.' }
  ];
  var productById = function (id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; };

  /* ---------- cart state (localStorage) ---------- */
  var CART_KEY = 'os-shop-cart';
  function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} }
  var cart = loadCart();

  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- product grid ---------- */
  function renderGrid() {
    var grid = $('#product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PRODUCTS.forEach(function (p) {
      var min = TIERS[0].price;
      var card = document.createElement('button');
      card.className = 'card';
      card.type = 'button';
      card.setAttribute('aria-label', p.name);
      card.innerHTML =
        '<div class="card-specimen face-' + p.face + '">' + p.glyph + '</div>' +
        '<div class="card-info"><span><span class="card-name">' + p.name + '</span>' +
        '<span class="card-kind">' + p.kind + ' · ' + p.styles + '</span></span>' +
        '<span class="card-from">from&nbsp;<b>' + money(min) + '</b></span></div>';
      card.addEventListener('click', function () { openProduct(p.id); });
      grid.appendChild(card);
    });
  }

  /* ---------- product dialog ---------- */
  var modal = $('#product-modal');
  var currentProduct = null;

  function openProduct(id) {
    var p = productById(id); if (!p || !modal) return;
    currentProduct = p;
    $('#pm-specimen').className = 'pmodal-specimen face-' + p.face;
    $('#pm-specimen').textContent = p.glyph;
    $('#pm-kind').textContent = p.kind;
    $('#pm-name').textContent = p.name;
    $('#pm-blurb').textContent = p.blurb;
    $('#pm-styles').textContent = p.styles;
    var tier = $('#pm-tier');
    tier.innerHTML = '';
    TIERS.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.id; o.textContent = t.label + '  ·  ' + money(t.price);
      tier.appendChild(o);
    });
    updatePmPrice();
    if (typeof modal.showModal === 'function') modal.showModal();
  }
  function updatePmPrice() { $('#pm-price').textContent = money(tierById($('#pm-tier').value).price); }

  if (modal) {
    $('#pm-tier').addEventListener('change', updatePmPrice);
    $('#pm-add').addEventListener('click', function () {
      var t = tierById($('#pm-tier').value);
      cart.push({ id: currentProduct.id, name: currentProduct.name, tier: t.id, tierLabel: t.label, price: t.price });
      saveCart(cart); renderCart(); modal.close(); openCart();
    });
    modal.querySelector('[data-close]').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  }

  /* ---------- cart drawer ---------- */
  var cartEl = $('#cart'), scrim = $('#cart-scrim');
  function openCart() { if (!cartEl) return; cartEl.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); scrim.hidden = false; }
  function closeCart() { if (!cartEl) return; cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); scrim.hidden = true; }

  function cartTotal() { return cart.reduce(function (s, i) { return s + i.price; }, 0); }

  function renderCart() {
    var count = $('#cart-count'); if (count) count.textContent = cart.length;
    var wrap = $('#cart-items'); if (!wrap) return;
    wrap.innerHTML = '';
    cart.forEach(function (item, idx) {
      var line = document.createElement('div');
      line.className = 'cart-line';
      line.innerHTML =
        '<span class="cl-name">' + item.name + '</span>' +
        '<span class="cl-price">' + money(item.price) + '</span>' +
        '<span class="cl-tier">' + item.tierLabel + '</span>' +
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

  /* ---------- checkout (mock) ---------- */
  var checkout = $('#checkout');
  function openCheckout() {
    if (!checkout || !cart.length) return;
    var gross = cartTotal(), net = gross / 1.19, vat = gross - net;
    var sum = $('#co-summary'); sum.innerHTML = '';
    cart.forEach(function (i) {
      sum.insertAdjacentHTML('beforeend',
        '<div class="co-sum-row"><span>' + i.name + ' · ' + i.tierLabel + '</span><span>' + money(i.price) + '</span></div>');
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

  if (checkout) {
    checkout.querySelector('[data-close-checkout]').addEventListener('click', function () { checkout.close(); });
    $('#checkout-form').addEventListener('submit', function (e) {
      e.preventDefault();
      // ── real integration goes here: create a provider checkout session
      //    for `cart`, then redirect / open the provider overlay. ──
      var email = (this.querySelector('[name=email]') || {}).value || 'your email';
      this.innerHTML =
        '<p class="mono dim eyebrow">◍&nbsp;prototype</p>' +
        '<h2>order captured</h2>' +
        '<p>In the live shop the payment provider takes over here and emails the ' +
        'download link to <b>' + email + '</b>. Nothing was charged.</p>' +
        '<p class="mono dim" style="margin-top:1.2rem;letter-spacing:.1em">cart cleared&nbsp;— you can close this.</p>';
      cart = []; saveCart(cart); renderCart();
    });
  }

  /* ---------- privacy placeholder ---------- */
  if ($('#privacy-link')) $('#privacy-link').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Datenschutzerklärung (privacy policy) — to be added before launch. ' +
          'This prototype stores your cart only in your own browser and sends nothing to a server.');
  });

  /* ---------- theme toggle + year ---------- */
  if ($('#theme-toggle')) $('#theme-toggle').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('os-theme', next); } catch (e) {}
  });
  if ($('#y')) $('#y').textContent = String(new Date().getFullYear());

  renderGrid();
  renderCart();
})();
