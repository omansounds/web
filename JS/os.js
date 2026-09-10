/* OMAN SOUNDS — interactions (specimen archive).
   Quiet homoglyph flickers, cursor-follow release previews,
   scroll reveals, nav state, contact form. No dependencies. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- lenis smooth scroll ---------- */

  var lenis = null;
  if (!reducedMotion && typeof Lenis === 'function') {
    lenis = new Lenis({
      duration: 1.3,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }
  window.__lenis = lenis; // exposed so wild.js can sync ScrollTrigger

  /* anchor links glide through lenis when it's active.
     land past each section's top padding so the content sits just
     below the nav instead of behind a big empty gap. */
  var NAV_CLEARANCE = 96;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target && lenis) {
        e.preventDefault();
        var offset = 0;
        if (target.classList.contains('section')) {
          var padTop = parseFloat(getComputedStyle(target).paddingTop) || 0;
          offset = padTop - NAV_CLEARANCE;
        }
        lenis.scrollTo(target, {
          offset: offset,
          duration: 1.4,
          easing: function (t) { return 1 - Math.pow(1 - t, 4); }
        });
      }
    });
  });

  /* ============================================================
     GLITCH TEXT — customise the "oman sounds" header effect here
     ============================================================ */

  // Characters the header can scramble into. Add / remove / reorder
  // freely — anything you can type works (letters, symbols, unicode).
  var GLITCH_POOL = '#%& ҈҈҈҉҉҉҉҈҈҈҈҈҉҉҉҉҈҈҈҉҉҉҈҈҈҉҉҉҈҈҈҈҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҈҈҈҈҈҈҈‌҉҉҉҉҈҈ًًًًًًًٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍّّّّّّّّّّّّ֟֟֟֟֟֟֟֟֟֟֟֟֟֓֓֓֓֓֓֓֓֓֓֓֓֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֓֓֓֓֓֓֓֓֒֒֒֘֘֘֘֘֘֘֗֗֗֗֗֗֗֗֗֗֗֗֗֗֗ؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؕؕؕؕؕؕؕؕؕؕؕؖؖؖؖؖؖؖؖؖؖؖٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞ٘ ҈҈҈҉҉҉҉҈҈҈҈҈҉҉҉҉҈҈҈҉҉҉҈҈҈҉҉҉҈҈҈҈҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҈҈҈҈҈҈҈‌҉҉҉҉҈҈֟֟֟֟֟֟֟֟֟֟֟֟֟֓֓֓֓֓֓֓֓֓֓֓֓֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֓֓֓֓֓֓֓֓֒֒֒֘֘֘֘֘֘֘֗֗֗֗֗֗֗֗֗֗֗֗֗֗֗* ҈҈҈҉҉҉҉҈҈҈҈҈҉҉҉҉҈҈҈҉҉҉҈҈҈҉҉҉҈҈҈҈҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҈҈҈҈҈҈҈‌҉҉҉҉҈҈ًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًًٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍٍّّّّّّّّّّّّܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑܑ๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊๊ܻܻܻܻܻܻܻܻܻܻ݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆ܻܻࣩࣩࣩࣩࣩࣩ࣯ࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩࣩ֟֟֟֟֟֟֟֟֟֟֟֟֟֓֓֓֓֓֓֓֓֓֓֓֓֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֓֓֓֓֓֓֓֓֒֒֒֘֘֘֘֘֘֘֗֗֗֗֗֗֗֗֗֗֗֗֗֗֗ؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؖؕؕؕؕؕؕؕؕؕؕؕؖؖؖؖؖؖؖؖؖؖؖٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞٞ٘ۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛۛܺܺܺܺܺܺܺܺ݉݉݉݉݊݊݊݊݊݊݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅ࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣧࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣨࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤࣤ ݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆݆ܻܻࣩࣩࣩࣩࣩࣩ࣯ࣩࣩࣩࣩࣩ݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅݅ ҈҈҈҉҉҉҉҈҈҈҈҈҉҉҉҉҈҈҈҉҉҉҈҈҈҉҉҉҈҈҈҈҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҉҈҈҈҈҈҈҈‌҉҉҉҉҈҈֟֟֟֟֟֟֟֟֟֟֟֟֟֓֓֓֓֓֓֓֓֓֓֓֓֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒֒‡§▓▒░アก็็็็็็็็็็็็็็็็็็็็'.split('');

  // Hero header tuning:
  var HERO_GLITCH_EVERY = 8950;  // ms between glitch bursts (lower = more often)
  var HERO_GLITCH_COUNT = 2;    // how many letters scramble per burst
  var HERO_GLITCH_HOLD  = 190;  // ms the scrambled letters hold before resetting

  function poolChar() {
    return GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
  }

  /* per-letter homoglyphs — used only for the subtle ambient flicker */
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

  var glitchEls = Array.prototype.slice.call(document.querySelectorAll('[data-glitch]'));
  glitchEls.forEach(function (el) { el.dataset.orig = el.textContent; });

  var heroGlitchEls = Array.prototype.slice.call(document.querySelectorAll('.hero-title [data-glitch]'));
  // ambient flicker touches everything except the hero title (handled below)
  var ambientEls = glitchEls.filter(function (el) { return heroGlitchEls.indexOf(el) === -1; });

  /* rare, quiet: every few seconds one label flickers one character */
  function flicker() {
    if (!ambientEls.length) return;
    var el = ambientEls[Math.floor(Math.random() * ambientEls.length)];
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

  if (!reducedMotion && !window.__WILD) {
    setInterval(function () {
      if (Math.random() < 0.5) flicker();
    }, 3200);
  }

  /* ---------- hero title: settle on load, then keep glitching ---------- */

  if (!reducedMotion && !window.__WILD) {
    // one-time settle out of scrambled glyphs
    heroGlitchEls.forEach(function (el, idx) {
      var orig = el.dataset.orig;
      var steps = 5;
      var step = 0;
      setTimeout(function tick() {
        step++;
        if (step >= steps) { el.textContent = orig; return; }
        var out = '';
        for (var i = 0; i < orig.length; i++) {
          out += (Math.random() < step / steps) ? orig[i] : poolChar();
        }
        el.textContent = out;
        setTimeout(tick, 130);
      }, 250 + idx * 180);
    });

    // ongoing bursts — scramble several letters briefly, on a fast interval
    setTimeout(function () {
      setInterval(function () {
        heroGlitchEls.forEach(function (el) {
          var orig = el.dataset.orig;
          var chars = orig.split('');
          var n = Math.min(HERO_GLITCH_COUNT, chars.length);
          for (var k = 0; k < n; k++) {
            chars[Math.floor(Math.random() * chars.length)] = poolChar();
          }
          el.textContent = chars.join('');
          setTimeout(function () { el.textContent = orig; }, HERO_GLITCH_HOLD);
        });
      }, HERO_GLITCH_EVERY);
    }, 1600);
  }

  /* ---------- scroll reveals ---------- */

  if (!window.__WILD && 'IntersectionObserver' in window) {
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
  } else if (!window.__WILD) {
    document.querySelectorAll('.reveal, .sec-head').forEach(function (el) { el.classList.add('in'); });
  }
  /* when __WILD is set, wild.js (GSAP) owns all reveals & text effects */

  /* ---------- cursor dot + release previews ---------- */

  var preview = document.getElementById('preview');
  var fine = window.matchMedia('(pointer: fine)').matches;
  var ring = document.querySelector('.cursor-ring');

  if (fine && ring) {
    var px = -100, py = -100, tx = -100, ty = -100;
    var rx = -100, ry = -100, rs = 1, rsTarget = 1;
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    var ringPrev = performance.now();
    (function ringLoop(now) {
      var dt = Math.min(((now || performance.now()) - ringPrev) / 1000, 0.25);
      ringPrev = now || performance.now();
      var k = 1 - Math.pow(1 - 0.16, dt * 60); // frame-rate independent lag
      rx += (tx - rx) * k;
      ry += (ty - ry) * k;
      rs += (rsTarget - rs) * k;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(' + rs + ')';
      requestAnimationFrame(ringLoop);
    })(performance.now());

    // delegated so dynamically added cards (e.g. instagram) also enlarge it
    var HOVER_SEL = 'a, button, input, select, textarea';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SEL)) {
        ring.classList.add('is-hover'); rsTarget = 1.45;
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SEL)) {
        var to = e.relatedTarget;
        var stillInside = to && to.closest && to.closest(HOVER_SEL);
        if (!stillInside) { ring.classList.remove('is-hover'); rsTarget = 1; }
      }
    });

    if (preview) {
      var prevPrev = performance.now();
      (function previewLoop(now) {
        var dt = Math.min(((now || performance.now()) - prevPrev) / 1000, 0.25);
        prevPrev = now || performance.now();
        var kp = 1 - Math.pow(1 - 0.12, dt * 60);
        px += (tx - px) * kp;
        py += (ty - py) * kp;
        preview.style.transform = 'translate(' + (px + 26) + 'px,' + (py - 95) + 'px)';
        requestAnimationFrame(previewLoop);
      })(performance.now());
      document.querySelectorAll('[data-preview]').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          preview.src = el.dataset.preview;
          preview.classList.add('on');
        });
        el.addEventListener('mouseleave', function () { preview.classList.remove('on'); });
      });
    }
  }

  /* ---------- works: scroll-driven horizontal strip ---------- */

  var hscroll = document.querySelector('.hscroll');
  var htrack = document.querySelector('.htrack');
  var hbar = document.querySelector('.hprogress span');

  if (hscroll && htrack) {
    var stripMobile = window.matchMedia('(max-width: 700px)');
    var updateStrip = function () {
      // on mobile the strip is a native swipe row (CSS) — don't drive it
      if (stripMobile.matches) { htrack.style.transform = ''; if (hbar) hbar.style.transform = ''; return; }
      var total = hscroll.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var top = hscroll.getBoundingClientRect().top;
      var p = Math.min(Math.max(-top / total, 0), 1);
      var max = htrack.scrollWidth - window.innerWidth;
      if (max < 0) max = 0;
      htrack.style.transform = 'translate3d(' + (-p * max) + 'px, 0, 0)';
      if (hbar) hbar.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', updateStrip, { passive: true });
    window.addEventListener('resize', updateStrip);
    updateStrip();

    /* ---- optional: auto-fill the strip from instagram ----
       Instagram has no free "give me my latest posts" API for a plain
       static site, so we use Behold (a tiny free bridge that keeps our
       own design):
         1. sign up at https://behold.so and connect your instagram
         2. create a feed, copy its Feed ID
         3. paste it below. leave '' to keep the hand-picked cards above.
       When set, the newest posts replace the placeholder cards. */
    var IG_FEED_ID = 'ozX4ZARa8ownCDiXFchA';

    if (IG_FEED_ID && window.fetch) {
      fetch('https://feeds.behold.so/' + IG_FEED_ID)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var posts = Array.isArray(data) ? data : (data && data.posts) || [];
          posts = posts.slice(0, 7);
          if (!posts.length) return;
          var moreCard = htrack.querySelector('.hcard-more');
          Array.prototype.slice.call(htrack.querySelectorAll('.hcard:not(.hcard-more)'))
            .forEach(function (c) { c.parentNode.removeChild(c); });
          posts.forEach(function (post, i) {
            var sz = post.sizes || {};
            var img = (sz.medium || sz.small || sz.large || {}).mediaUrl ||
                      post.thumbnailUrl || post.mediaUrl;
            if (!img) return;
            var a = document.createElement('a');
            a.className = 'hcard';
            a.href = post.permalink || 'https://www.instagram.com/omansounds/';
            a.target = '_blank'; a.rel = 'noopener noreferrer';
            var im = document.createElement('img');
            im.src = img; im.loading = 'lazy'; im.alt = 'Instagram post ' + (i + 1);
            var span = document.createElement('span');
            span.className = 'mono dim';
            var cap = (post.prunedCaption || post.caption || '').replace(/\s+/g, ' ').trim().slice(0, 32);
            span.textContent = 'ig.' + ('0' + (i + 1)).slice(-2) + (cap ? ' ⌁ ' + cap : '');
            a.appendChild(im); a.appendChild(span);
            if (moreCard) htrack.insertBefore(a, moreCard); else htrack.appendChild(a);
          });
          updateStrip();
          setTimeout(updateStrip, 500);
          window.addEventListener('load', updateStrip);
        })
        .catch(function () { /* network/feed error — keep the manual cards */ });
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
