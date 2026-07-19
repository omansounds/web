/* OMAN SOUNDS — interactions (specimen archive).
   Quiet homoglyph flickers, cursor-follow release previews,
   scroll reveals, nav state, contact form. No dependencies. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- lenis smooth scroll ---------- */

  var lenis = null;
  if (!reducedMotion && typeof Lenis === 'function') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: false });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }

  /* anchor links glide through lenis when it's active */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target && lenis) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      }
    });
  });

  /* ---------- unicode homoglyphs ---------- */

  var HOMOGLYPHS = {
    a: 'ａ∂α', b: 'ЬƄ', c: 'ϲс¢', d: 'ԁđ', e: 'ЄеΞ', g: 'ɡ9',
    h: 'һЋ', i: 'ⅰɪ¡', l: 'ⅼŀ', m: 'ⅿʍ', n: 'ոπ', o: 'øΘ0σ',
    p: 'ρр', r: 'ГЯ', s: 'ѕ§5', t: 'ϮŦ†', u: 'υսμ', v: 'νѵ',
    w: 'ѡω', x: '×χ', y: 'уγ', z: 'ʐ'
  };

  function glyphFor(ch) {
    var pool = HOMOGLYPHS[ch.toLowerCase()];
    if (!pool) return ch;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* rare, quiet: every few seconds one label flickers one character */

  var glitchEls = Array.prototype.slice.call(document.querySelectorAll('[data-glitch]'));
  glitchEls.forEach(function (el) { el.dataset.orig = el.textContent; });

  function flicker() {
    if (!glitchEls.length) return;
    var el = glitchEls[Math.floor(Math.random() * glitchEls.length)];
    var orig = el.dataset.orig;
    var letters = [];
    for (var i = 0; i < orig.length; i++) {
      if (/[a-z]/i.test(orig[i])) letters.push(i);
    }
    if (!letters.length) return;
    var pos = letters[Math.floor(Math.random() * letters.length)];
    el.textContent = orig.slice(0, pos) + glyphFor(orig[pos]) + orig.slice(pos + 1);
    setTimeout(function () { el.textContent = orig; }, 260 + Math.random() * 300);
  }

  if (!reducedMotion) {
    setInterval(function () {
      if (Math.random() < 0.5) flicker();
    }, 3200);
  }

  /* ---------- hero title: settle from glyphs once ---------- */

  if (!reducedMotion) {
    document.querySelectorAll('.hero-title [data-glitch]').forEach(function (el, idx) {
      var orig = el.dataset.orig;
      var steps = 5;
      var step = 0;
      setTimeout(function tick() {
        step++;
        if (step >= steps) { el.textContent = orig; return; }
        var out = '';
        for (var i = 0; i < orig.length; i++) {
          out += (Math.random() < step / steps) ? orig[i] : glyphFor(orig[i]);
        }
        el.textContent = out;
        setTimeout(tick, 130);
      }, 250 + idx * 180);
    });
  }

  /* ---------- scroll reveals ---------- */

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .sec-head').forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .sec-head').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- cursor dot + release previews ---------- */

  var dot = document.querySelector('.cursor-dot');
  var preview = document.getElementById('preview');
  var fine = window.matchMedia('(pointer: fine)').matches;

  if (fine && dot) {
    var px = -100, py = -100, tx = -100, ty = -100;
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px';
      dot.style.top = ty + 'px';
    }, { passive: true });

    document.querySelectorAll('a, button, input, select, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { dot.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { dot.classList.remove('is-hover'); });
    });

    if (preview) {
      (function previewLoop() {
        px += (tx - px) * 0.12;
        py += (ty - py) * 0.12;
        preview.style.transform = 'translate(' + (px + 26) + 'px,' + (py - 95) + 'px)';
        requestAnimationFrame(previewLoop);
      })();
      document.querySelectorAll('[data-preview]').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          preview.src = el.dataset.preview;
          preview.classList.add('on');
        });
        el.addEventListener('mouseleave', function () { preview.classList.remove('on'); });
      });
    }
  }

  /* ---------- nav active state ---------- */

  var navLinks = document.querySelectorAll('.nav nav a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          sections.forEach(function (s) {
            if (s.el === entry.target) s.link.classList.add('active');
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s.el); });
  }

  /* ---------- contact form ---------- */

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form && status && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.send');
      btn.disabled = true;
      status.textContent = 'transmitting…';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) { return res.json(); }).then(function (data) {
        if (data.success) {
          form.reset();
          status.textContent = 'transmission received — talk soon.';
        } else {
          status.textContent = 'error — try again, or reach out on instagram.';
        }
      }).catch(function () {
        status.textContent = 'connection lost — try again, or reach out on instagram.';
      }).finally(function () {
        btn.disabled = false;
      });
    });
  }

  /* ---------- impressum glass overlay ---------- */

  var impDialog = document.getElementById('impressum');
  var impLink = document.getElementById('impressum-link');
  var impClose = document.getElementById('impressum-close');
  if (impDialog && impLink && typeof impDialog.showModal === 'function') {
    impLink.addEventListener('click', function (e) {
      e.preventDefault();
      impDialog.showModal();
    });
    impClose.addEventListener('click', function () { impDialog.close(); });
    impDialog.addEventListener('click', function (e) {
      if (e.target === impDialog) impDialog.close(); // backdrop click
    });
  }

  /* ---------- theme toggle ---------- */

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('os-theme', next); } catch (e) {}
    });
  }

  /* ---------- footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
