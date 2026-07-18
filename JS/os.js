/* OMAN SOUNDS — interactions.
   Text scramble, binary decode, glitch bursts, custom cursor,
   scroll reveals, nav state, contact form. No dependencies. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- text scramble ---------- */

  var GLITCH_CHARS = '01!<>-_\\/[]{}=+*^?#░▒▓█▄▀ØΞΔ∇×アオマンサウンド';

  function randChar() {
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }

  function scramble(el, finalText, duration) {
    if (reducedMotion) { el.textContent = finalText; return; }
    var frame = 0;
    var totalFrames = Math.max(1, Math.round((duration || 700) / 30));
    clearInterval(el._scrambleTimer);
    el._scrambleTimer = setInterval(function () {
      frame++;
      var progress = frame / totalFrames;
      var out = '';
      for (var i = 0; i < finalText.length; i++) {
        var charProgress = progress * finalText.length - i;
        if (finalText[i] === ' ') { out += ' '; }
        else if (charProgress > 0.9) { out += finalText[i]; }
        else if (charProgress > -1.5) { out += randChar(); }
        else { out += ' '; }
      }
      el.textContent = out;
      if (frame >= totalFrames) {
        clearInterval(el._scrambleTimer);
        el.textContent = finalText;
      }
    }, 30);
  }

  /* ---------- reveal + scramble headings on scroll ---------- */

  var scrambleEls = document.querySelectorAll('[data-scramble]');
  scrambleEls.forEach(function (el) {
    el.setAttribute('aria-label', el.textContent.trim());
    el.dataset.finalText = el.textContent.trim();
  });

  if ('IntersectionObserver' in window) {
    var headObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          scramble(entry.target, entry.target.dataset.finalText, 800);
          headObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    scrambleEls.forEach(function (el) { headObserver.observe(el); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- hero binary line: decode loop ---------- */
  /* 01101111 01101101 01100001 01101110 = "oman" */

  var binaryLine = document.getElementById('binary-line');
  if (binaryLine && !reducedMotion) {
    var states = [
      '01101111 01101101 01100001 01101110',
      '[ o        m        a        n ]',
      '01101111 01101101 01100001 01101110',
      '>> signal locked _'
    ];
    var stateIdx = 0;
    setInterval(function () {
      stateIdx = (stateIdx + 1) % states.length;
      scramble(binaryLine, states[stateIdx], 600);
    }, 3600);
  }

  /* ---------- periodic glitch bursts on hero title ---------- */

  var glitchEls = document.querySelectorAll('.glitch');
  if (!reducedMotion && glitchEls.length) {
    setInterval(function () {
      if (Math.random() < 0.55) return; // irregular rhythm
      var el = glitchEls[Math.floor(Math.random() * glitchEls.length)];
      el.classList.add('is-glitching');
      setTimeout(function () { el.classList.remove('is-glitching'); }, 340);
    }, 1900);
  }

  /* ---------- logo easter egg: full page burst ---------- */

  var logo = document.getElementById('logo-glitch');
  if (logo) {
    logo.addEventListener('click', function () {
      if (reducedMotion) return;
      document.body.classList.remove('burst');
      void document.body.offsetWidth; // restart animation
      document.body.classList.add('burst');
      glitchEls.forEach(function (el) {
        el.classList.add('is-glitching');
        setTimeout(function () { el.classList.remove('is-glitching'); }, 340);
      });
    });
  }

  /* ---------- custom cursor ---------- */

  var cursor = document.querySelector('.cursor');
  var cursorDot = document.querySelector('.cursor-dot');
  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    var cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursorDot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    }, { passive: true });
    (function cursorLoop() {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)' + (cursor.classList.contains('is-hover') ? ' scale(1.7)' : '');
      requestAnimationFrame(cursorLoop);
    })();
    document.querySelectorAll('a, button, input, select, textarea, .gallery').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
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

  /* ---------- contact form (AJAX with graceful fallback) ---------- */

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form && status && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.btn-send');
      btn.disabled = true;
      status.classList.remove('error');
      status.textContent = '>> transmitting…';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) { return res.json(); }).then(function (data) {
        if (data.success) {
          form.reset();
          status.textContent = '>> transmission received. talk soon.';
        } else {
          status.classList.add('error');
          status.textContent = '>> error — try again or DM on instagram.';
        }
      }).catch(function () {
        status.classList.add('error');
        status.textContent = '>> connection lost — try again or DM on instagram.';
      }).finally(function () {
        btn.disabled = false;
      });
    });
  }

  /* ---------- footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
