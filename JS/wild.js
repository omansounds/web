/* OMAN SOUNDS — WILD motion layer.
   Libraries: GSAP (+ScrollTrigger, SplitText, ScrambleText, DrawSVG),
   VanillaTilt (3D tilt) and Matter.js (physics), on top of Lenis.
   Everything degrades: no lib / reduced-motion => content stays visible. */

(function () {
  'use strict';

  var pre = document.getElementById('preloader');

  // hard fail-safe: never leave the preloader covering the site
  function killPreloader() { if (pre) { pre.style.display = 'none'; } }
  setTimeout(killPreloader, 5000);

  if (typeof window.gsap === 'undefined') { killPreloader(); return; }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = window.__lenis || null;

  try { gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin); } catch (e) {}
  if (lenis && lenis.on) lenis.on('scroll', ScrollTrigger.update);

  var SCRAMBLE = '#%&◍░▒▓▚▞/\\<>=+アカサ0101';

  /* ============================================================
     0 · PRELOADER — draw the O, count up, curtain away
     ============================================================ */
  function preloader(done) {
    if (!pre || reduced) { killPreloader(); done(); return; }
    var num = pre.querySelector('.pre-num');
    if (window.DrawSVGPlugin) {
      gsap.from(pre.querySelectorAll('.pre-o path, .pre-o circle'),
        { drawSVG: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.12 });
    }
    gsap.to('.pre-o', { rotate: 120, transformOrigin: '50% 50%', duration: 1.8, ease: 'power2.inOut' });
    var c = { n: 0 };
    gsap.to(c, {
      n: 100, duration: 1.8, ease: 'power1.inOut',
      onUpdate: function () { if (num) num.textContent = ('00' + Math.round(c.n)).slice(-3); },
      onComplete: function () {
        gsap.to(pre, {
          yPercent: -100, duration: 0.8, ease: 'expo.inOut',
          onComplete: function () { killPreloader(); }
        });
        done();
      }
    });
  }

  /* ============================================================
     1 · HERO — decode-in + sigil, then stagger the rest
     ============================================================ */
  function heroIntro() {
    var heroWords = gsap.utils.toArray('.hero-title [data-glitch]');
    gsap.set('.hero-title', { autoAlpha: 1 });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-sigil', { autoAlpha: 0, scale: 0.4, rotate: -120, transformOrigin: '50% 50%', duration: 1.0 }, 0);
    heroWords.forEach(function (el, i) {
      var txt = (el.dataset.orig || el.textContent);
      tl.from(el, { yPercent: 60, autoAlpha: 0, duration: 0.9 }, 0.1 + i * 0.12);
      if (window.ScrambleTextPlugin) {
        tl.fromTo(el, { text: '' },
          { duration: 1.05, scrambleText: { text: txt, chars: SCRAMBLE, speed: 0.6, revealDelay: 0.25 } },
          0.1 + i * 0.12);
      }
    });
    tl.from('.ticker', { autoAlpha: 0, y: -12, duration: 0.7 }, 0.05);
    tl.from('.hero-tag', { autoAlpha: 0, y: 18, duration: 0.7 }, 0.6);
    tl.from('.hero .socials .soc', { autoAlpha: 0, y: 16, stagger: 0.05, duration: 0.6 }, 0.7);
    heroParallax();
  }

  function heroParallax() {
    gsap.to('.hero-title', {
      yPercent: 16, autoAlpha: 0.5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ============================================================
     2 · SECTION REVEALS — split headings + staggered content
     ============================================================ */
  function sectionReveals() {
    gsap.utils.toArray('.section, .lab').forEach(function (sec) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 80%' }, defaults: { ease: 'power4.out' } });
      var label = sec.querySelector('.sec-label');
      if (label) tl.from(label, { y: 22, autoAlpha: 0, duration: 0.55 }, 0);
      var h2 = sec.querySelector('.sec-head h2');
      if (h2 && window.SplitText) {
        var split = new SplitText(h2, { type: 'chars,words' });
        tl.from(split.chars, { yPercent: 60, autoAlpha: 0, stagger: 0.02, duration: 0.6 }, 0.05);
      } else if (h2) {
        tl.from(h2, { y: 30, autoAlpha: 0, duration: 0.6 }, 0.05);
      }
      var rows = sec.querySelectorAll('.index li');
      if (rows.length) tl.from(rows, { y: 26, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.15);
      sec.querySelectorAll('.reveal:not(.sec-head):not(.lab-head)').forEach(function (b) {
        if (b.closest('.index')) return;
        tl.from(b, { y: 30, autoAlpha: 0, duration: 0.6 }, 0.2);
      });
    });
  }

  /* ============================================================
     3 · VELOCITY SKEW — content leans into the scroll
     ============================================================ */
  function velocitySkew() {
    var targets = gsap.utils.toArray('.index, .sec-head h2');
    if (!targets.length) return;
    gsap.set(targets, { transformOrigin: 'right center', force3D: true });
    var setter = gsap.quickSetter(targets, 'skewY', 'deg');
    var proxy = { skew: 0 };
    var clamp = gsap.utils.clamp(-5, 5);
    ScrollTrigger.create({
      onUpdate: function (self) {
        var skew = clamp(self.getVelocity() / -320);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, { skew: 0, duration: 0.7, ease: 'power3', overwrite: true,
            onUpdate: function () { setter(proxy.skew); } });
        }
      }
    });
  }

  /* ============================================================
     4 · NEWS TICKER — marquee reactive to scroll speed
     ============================================================ */
  function ticker() {
    var track = document.getElementById('ticker-track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
    var half = track.scrollWidth / 2;
    if (half <= 0) return;
    var x = 0, BASE = 42, setX = gsap.quickSetter(track, 'x', 'px');
    gsap.ticker.add(function (time, deltaMS) {
      var dt = Math.min((deltaMS || 16) / 1000, 0.05);
      var vel = (lenis && typeof lenis.velocity === 'number') ? lenis.velocity : 0;
      x -= (BASE + vel * 7) * dt;
      if (x <= -half) x += half; else if (x > 0) x -= half;
      setX(x);
    });
  }

  /* ============================================================
     5 · MAGNETIC — nav / icons pull toward the cursor
     ============================================================ */
  function magnetic() {
    if (reduced) return;
    var els = document.querySelectorAll('.nav nav a, .hero .socials .soc, .theme-toggle');
    els.forEach(function (el) {
      el.classList.add('magnetic');
      var qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.4);
        qy((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  /* nav labels decode on hover */
  function navScramble() {
    if (!window.ScrambleTextPlugin) return;
    document.querySelectorAll('.nav nav a[href^="#"]').forEach(function (a) {
      var orig = a.textContent;
      a.addEventListener('pointerenter', function () {
        gsap.to(a, { duration: 0.45, scrambleText: { text: orig, chars: '#%&/<>0101', speed: 0.9 } });
      });
    });
  }

  /* ============================================================
     6 · 3D TILT (VanillaTilt) on the works / instagram cards
     ============================================================ */
  function tilt() {
    if (typeof VanillaTilt === 'undefined' || reduced) return;
    function init() {
      var cards = document.querySelectorAll('.hcard:not([data-tilt])');
      cards.forEach(function (c) { c.setAttribute('data-tilt', '1'); });
      if (cards.length) VanillaTilt.init(cards, {
        max: 12, speed: 400, glare: true, 'max-glare': 0.22, scale: 1.04, gyroscope: false
      });
    }
    init();
    setTimeout(init, 3000); // catch cards added by the async instagram feed
  }

  /* ============================================================
     7 · SPECIMEN JAR (Matter.js) — fling the platforms
     ============================================================ */
  function physics() {
    if (typeof Matter === 'undefined' || reduced) return;
    var stage = document.getElementById('lab-stage');
    var canvas = document.getElementById('lab-canvas');
    if (!stage || !canvas) return;

    var M = Matter;
    var W = stage.clientWidth, H = stage.clientHeight;
    if (W < 40 || H < 40) return;

    var engine = M.Engine.create();
    engine.gravity.y = 1;

    var render = M.Render.create({
      canvas: canvas, engine: engine,
      options: { width: W, height: H, background: 'transparent', wireframes: false, pixelRatio: window.devicePixelRatio || 1 }
    });

    var wall = { isStatic: true, render: { visible: false } };
    var t = 60;
    M.Composite.add(engine.world, [
      M.Bodies.rectangle(W / 2, H + t / 2, W + 2 * t, t, wall),       // floor
      M.Bodies.rectangle(-t / 2, H / 2, t, H * 4, wall),             // left
      M.Bodies.rectangle(W + t / 2, H / 2, t, H * 4, wall)          // right
    ]);

    var names = ['spotify', 'applemusic', 'soundcloud', 'bandcamp', 'tidal', 'youtube', 'ra', 'instagram', 'twitch'];
    var dir = document.documentElement.dataset.theme === 'dark' ? 'white' : 'black';
    var R = Math.max(24, Math.min(38, W / 24));
    names.forEach(function (name, i) {
      var b = M.Bodies.circle(
        50 + (i + 0.5) * ((W - 100) / names.length) + (Math.random() - 0.5) * 30,
        20 + Math.random() * (H * 0.3), R, {
        restitution: 0.6, friction: 0.05, frictionAir: 0.008,
        render: { sprite: { texture: 'ICONS/' + dir + '/' + name + '.png', xScale: (R * 2) / 64, yScale: (R * 2) / 64 } }
      });
      M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: 0 });
      M.Composite.add(engine.world, b);
    });

    // drag with the mouse, but never hijack page scroll
    var mouse = M.Mouse.create(canvas);
    mouse.pixelRatio = window.devicePixelRatio || 1;
    ['wheel', 'DOMMouseScroll'].forEach(function (ev) {
      if (mouse.mousewheel) canvas.removeEventListener(ev, mouse.mousewheel);
    });
    ['touchstart', 'touchmove', 'touchend'].forEach(function (ev) {
      var h = ev === 'touchstart' ? mouse.mousedown : ev === 'touchmove' ? mouse.mousemove : mouse.mouseup;
      if (h) canvas.removeEventListener(ev, h);
    });
    var mc = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    M.Composite.add(engine.world, mc);
    render.mouse = mouse;

    var runner = M.Runner.create();
    // only spin the simulation while the jar is on screen
    var running = false;
    function start() { if (!running) { running = true; M.Render.run(render); M.Runner.run(runner, engine); } }
    function stop() { if (running) { running = false; M.Render.stop(render); M.Runner.stop(runner); } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.05 }).observe(stage);
    } else { start(); }

    window.addEventListener('resize', function () {
      var nw = stage.clientWidth, nh = stage.clientHeight;
      render.canvas.width = nw * (window.devicePixelRatio || 1);
      render.canvas.height = nh * (window.devicePixelRatio || 1);
      render.options.width = nw; render.options.height = nh;
      M.Render.setPixelRatio(render, window.devicePixelRatio || 1);
    });
  }

  /* ---------- boot ---------- */
  try {
    sectionReveals();
    velocitySkew();
    ticker();
    magnetic();
    navScramble();
    tilt();
    physics();
    preloader(heroIntro);
  } catch (err) {
    killPreloader();
    gsap.set('.hero-title', { autoAlpha: 1 });
    if (window.console) console.warn('wild.js:', err);
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  setTimeout(function () { ScrollTrigger.refresh(); }, 1600);
})();
