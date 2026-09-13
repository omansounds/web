/* OMAN SOUNDS — shop manager (local, no backend).
   Loads the catalogue (window.OS_PRODUCTS), lets you edit it visually,
   and exports an updated products.js you drop into shop/ and commit.
   Edits autosave to localStorage so you don't lose work. */

(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var DRAFT = 'os-admin-draft';
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var slug = function (s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var money = function (n) { return '€' + (Math.round(n * 100) / 100).toLocaleString('en', { minimumFractionDigits: n % 1 ? 2 : 0 }); };

  function fresh() { return clone((window.OS_PRODUCTS || [])); }
  function loadDraft() { try { var d = localStorage.getItem(DRAFT); if (d) return JSON.parse(d); } catch (e) {} return fresh(); }
  function saveDraft() { try { localStorage.setItem(DRAFT, JSON.stringify(state)); } catch (e) {} }

  var state = loadDraft();
  var sel = state.length ? 0 : -1;

  /* ---------- product list ---------- */
  function renderList() {
    var list = $('#adm-list');
    list.innerHTML = '';
    state.forEach(function (p, i) {
      var li = document.createElement('div');
      li.className = 'adm-li' + (i === sel ? ' sel' : '');
      li.innerHTML =
        '<span class="ali-badge">' + esc(p.type || 'font') + '</span>' +
        '<span class="ali-name">' + esc(p.name || '(untitled)') + (p.soldOut ? ' · sold out' : '') + '</span>' +
        '<span class="ali-move"><button data-up="' + i + '" title="up">↑</button><button data-down="' + i + '" title="down">↓</button>' +
        '<button class="ali-del" data-del="' + i + '" title="delete">✕</button></span>';
      li.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        sel = i; renderList(); renderForm(); renderPreview();
      });
      list.appendChild(li);
    });
    list.querySelectorAll('[data-up]').forEach(function (b) { b.onclick = function () { move(+b.dataset.up, -1); }; });
    list.querySelectorAll('[data-down]').forEach(function (b) { b.onclick = function () { move(+b.dataset.down, 1); }; });
    list.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { del(+b.dataset.del); }; });
  }
  function move(i, d) {
    var j = i + d; if (j < 0 || j >= state.length) return;
    var t = state[i]; state[i] = state[j]; state[j] = t;
    if (sel === i) sel = j; else if (sel === j) sel = i;
    saveDraft(); renderList(); renderForm(); renderPreview();
  }
  function del(i) {
    if (!confirm('Delete "' + (state[i].name || 'this product') + '"?')) return;
    state.splice(i, 1);
    if (sel >= state.length) sel = state.length - 1;
    saveDraft(); renderList(); renderForm(); renderPreview();
  }

  /* ---------- editor form ---------- */
  function field(label, key, val, type) {
    return '<label class="af"><span>' + label + '</span><input data-k="' + key + '" type="' + (type || 'text') + '" value="' + esc(val) + '"></label>';
  }
  function area(label, key, val) {
    return '<label class="af"><span>' + label + '</span><textarea data-k="' + key + '">' + esc(val) + '</textarea></label>';
  }
  function sel1(label, key, val, opts) {
    return '<label class="af"><span>' + label + '</span><select data-k="' + key + '">' +
      opts.map(function (o) { return '<option value="' + o + '"' + (o === val ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>';
  }

  function renderForm() {
    var form = $('#adm-form');
    if (sel < 0) { form.innerHTML = '<div class="adm-empty">No products yet. Click <b>+ product</b> to add one.</div>'; return; }
    var p = state[sel];
    var isFont = (p.type || 'font') === 'font';
    var html = '';
    html += '<div class="adm-sec">product</div>';
    html += sel1('type', 'type', p.type || 'font', ['font', 'merch']);
    html += field('name', 'name', p.name);
    html += field('id (url slug — leave blank to auto)', 'id', p.id);
    html += field('kind (e.g. display typeface / A2 print)', 'kind', p.kind);
    html += area('description', 'blurb', p.blurb);
    html += field('meta line (styles / material)', 'meta', p.meta);
    html += sel1('delivery', 'delivery', p.delivery || (isFont ? 'download' : 'ship'), ['download', 'ship']);
    html += '<label class="af af-check"><input data-k="soldOut" type="checkbox"' + (p.soldOut ? ' checked' : '') + '><span>sold out</span></label>';

    html += '<div class="adm-sec">display</div>';
    if (isFont) {
      html += '<div class="af-row">' + sel1('specimen face', 'face', p.face || 'arpon', ['arpon', 'geist']) + field('specimen glyph', 'glyph', p.glyph) + '</div>';
      html += field('deliverable file (uploaded in Lemon Squeezy)', 'file', p.file);
    } else {
      html += field('image path or URL', 'image', p.image);
    }

    html += '<div class="adm-sec">variants · price (€) · checkout link (Lemon Squeezy / Paddle)</div>';
    html += '<div id="vrows">' + (p.variants || []).map(vrowHTML).join('') + '</div>';
    html += '<button type="button" class="vadd" id="vadd">+ variant</button>';

    form.innerHTML = html;
    wireForm();
  }
  function vrowHTML(v, i) {
    return '<div class="vrow">' +
      '<input data-vi="' + i + '" data-vk="label" value="' + esc(v.label) + '" placeholder="Desktop / Size M">' +
      '<input data-vi="' + i + '" data-vk="price" type="number" step="0.01" value="' + esc(v.price) + '" placeholder="0">' +
      '<input data-vi="' + i + '" data-vk="checkout" value="' + esc(v.checkout || '') + '" placeholder="https://…checkout">' +
      '<button type="button" class="vdel" data-vdel="' + i + '">✕</button></div>';
  }
  function wireForm() {
    $('#adm-form').querySelectorAll('[data-k]').forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.dataset.k;
        var p = state[sel];
        if (el.type === 'checkbox') p[k] = el.checked;
        else p[k] = el.value;
        if (k === 'type') { renderForm(); } // toggle font/merch fields
        if (k === 'name' && !p.id) { /* keep */ }
        saveDraft(); renderList(); renderPreview();
      });
    });
    $('#adm-form').querySelectorAll('[data-vi]').forEach(function (el) {
      el.addEventListener('input', function () {
        var v = state[sel].variants[+el.dataset.vi];
        v[el.dataset.vk] = el.dataset.vk === 'price' ? parseFloat(el.value) || 0 : el.value;
        saveDraft(); renderPreview();
      });
    });
    $('#adm-form').querySelectorAll('[data-vdel]').forEach(function (b) {
      b.onclick = function () { state[sel].variants.splice(+b.dataset.vdel, 1); saveDraft(); renderForm(); renderPreview(); };
    });
    if ($('#vadd')) $('#vadd').onclick = function () {
      state[sel].variants = state[sel].variants || [];
      state[sel].variants.push({ label: '', price: 0, checkout: '' });
      saveDraft(); renderForm(); renderPreview();
    };
  }

  /* ---------- live preview (same look as the shop card) ---------- */
  function renderPreview() {
    var box = $('#adm-preview');
    if (sel < 0) { box.innerHTML = ''; return; }
    var p = state[sel];
    var isFont = (p.type || 'font') === 'font';
    var prices = (p.variants || []).map(function (v) { return +v.price || 0; });
    var mn = prices.length ? Math.min.apply(null, prices) : 0;
    var mx = prices.length ? Math.max.apply(null, prices) : 0;
    var priceLabel = p.soldOut ? 'sold out' : (mn === mx ? money(mn) : money(mn) + ' – ' + money(mx));
    var fig = isFont
      ? '<div class="card-figure"><span class="card-specimen face-' + (p.face || 'arpon') + '">' + esc(p.glyph || 'Aa') + '</span></div>'
      : '<div class="card-figure"><img class="card-media" src="' + esc(p.image) + '" alt=""></div>';
    box.innerHTML =
      '<p class="prev-label">live preview</p>' +
      '<div class="card' + (p.soldOut ? ' is-sold' : '') + '" style="cursor:default">' + fig +
      '<div class="card-cap"><span class="card-name">' + esc(p.name || '(untitled)') + '</span>' +
      '<span class="card-price mono">' + priceLabel + '</span></div></div>';
  }

  /* ---------- toolbar ---------- */
  $('#adm-add').onclick = function () {
    state.push({ id: '', type: 'font', name: 'New product', kind: '', blurb: '', meta: '',
      face: 'arpon', glyph: 'Aa', file: '', delivery: 'download', soldOut: false,
      variants: [{ label: 'Desktop — up to 5 devices', price: 39, checkout: '' }] });
    sel = state.length - 1; saveDraft(); renderList(); renderForm(); renderPreview();
    window.scrollTo(0, 0);
  };
  $('#adm-load').onclick = function () {
    if (!confirm('Discard your unsaved edits and reload from products.js?')) return;
    try { localStorage.removeItem(DRAFT); } catch (e) {}
    state = fresh(); sel = state.length ? 0 : -1;
    renderList(); renderForm(); renderPreview();
  };
  $('#adm-export').onclick = function () {
    // auto-fill blank ids from names
    state.forEach(function (p) { if (!p.id) p.id = slug(p.name); });
    saveDraft(); renderList();
    var js = '/* OMAN SOUNDS — shop catalogue (generated by shop/admin.html). */\n' +
             'window.OS_PRODUCTS = ' + JSON.stringify(state, null, 2) + ';\n';
    var blob = new Blob([js], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'products.js';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  renderList(); renderForm(); renderPreview();
})();
