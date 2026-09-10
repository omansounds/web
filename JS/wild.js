/* OMAN SOUNDS — WILD motion layer (GSAP).
   Scramble/decode hero, scroll reveals, velocity skew, hero parallax,
   and a scroll-velocity-reactive news ticker. Degrades gracefully:
   if GSAP is missing or motion is reduced, everything stays visible
   and the page just doesn't animate. */

(function () {
  'use strict';

  if (typeof window.gsap === 'undefined') return; // content already visible (wild.css)

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = window.__lenis || null;

  try {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  } catch (e) { /* some plugin missing — core effects still run */ }

  // keep ScrollTrigger in step with Lenis' smoothed scroll
  if (lenis && lenis.on) lenis.on('scroll', ScrollTrigger.update);

  var SCRAMBLE = '#%&◍░▒▓▚▞/\\<>=+アカサ0101';

  /* ============================================================
     1 · HERO — decode-in + draw the O, then stagger the rest
     ============================================================ */
  function heroIntro() {
    var heroWords = gsap.utils.toArray('.hero-title [data-glitch]');

    // make sure the wordmark layer is visible (os.js left it plain text)
    gsap.set('.hero-title', { autoAlpha: 1 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // sigil: fade + unspin into place
    tl.from('.hero-sigil', { autoAlpha: 0, scale: 0.5, rotate: -90, transformOrigin: '50% 50%', duration: 1.0 }, 0);

    // wordmark: rise + decode each word out of noise
    heroWords.forEach(function (el, i) {
      var txt = (el.dataset.orig || el.textContent);
      tl.from(el, { yPercent: 60, autoAlpha: 0, duration: 0.9 }, 0.15 + i * 0.12);
      if (window.ScrambleTextPlugin || (gsap.plugins && gsap.plugins.scrambleText)) {
        tl.fromTo(el,
          { text: '' },
          { duration: 1.05, scrambleText: { text: txt, chars: SCRAMBLE, speed: 0.6, revealDelay: 0.25 } },
          0.15 + i * 0.12);
      }
    });

    // ticker + tagline + socials settle in
    tl.from('.ticker', { autoAlpha: 0, y: -12, duration: 0.7 }, 0.1);
    tl.from('.hero-tag', { autoAlpha: 0, y: 18, duration: 0.7 }, 0.7);
    tl.from('.hero .socials .soc', { autoAlpha: 0, y: 16, stagger: 0.05, duration: 0.6 }, 0.8);
  }

  /* ============================================================
     2 · SECTION REVEALS — split headings + staggered content
     ============================================================ */
  function sectionReveals() {
    gsap.utils.toArray('.section').forEach(function (sec) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: 'top 80%' },
        defaults: { ease: 'power4.out' }
      });

      var label = sec.querySelector('.sec-label');
      if (label) tl.from(label, { y: 22, autoAlpha: 0, duration: 0.55 }, 0);

      var h2 = sec.querySelector('.sec-head h2');
      if (h2 && window.SplitText) {
        var split = new SplitText(h2, { type: 'chars,words' });
        tl.from(split.chars, { yPercent: 60, autoAlpha: 0, stagger: 0.02, duration: 0.6 }, 0.05);
      } else if (h2) {
        tl.from(h2, { y: 30, autoAlpha: 0, duration: 0.6 }, 0.05);
      }

      // release rows stagger up
      var rows = sec.querySelectorAll('.index li');
      if (rows.length) tl.from(rows, { y: 26, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.15);

      // any other reveal blocks in this section (lessons, contact, stream)
      var blocks = sec.querySelectorAll('.reveal:not(.sec-head)');
      blocks.forEach(function (b) {
        if (b.closest('.index')) return; // rows handled above
        tl.from(b, { y: 30, autoAlpha: 0, duration: 0.6 }, 0.2);
      });
    });
  }

  /* ============================================================
     3 · VELOCITY SKEW — content leans into the scroll
     ============================================================ */
  function velocitySkew() {
    var targets = gsap.utils.toArray('.index, .sec-head h2, .lessons-grid, .contact-grid');
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
          gsap.to(proxy, {
            skew: 0, duration: 0.7, ease: 'power3',
            overwrite: true, onUpdate: function () { setter(proxy.skew); }
          });
        }
      }
    });
  }

  /* ============================================================
     4 · HERO PARALLAX — wordmark drifts as you leave
     ============================================================ */
  function heroParallax() {
    gsap.to('.hero-title', {
      yPercent: 16, autoAlpha: 0.55, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ============================================================
     5 · NEWS TICKER — infinite marquee, reactive to scroll speed
     ============================================================ */
  function ticker() {
    var track = document.getElementById('ticker-track');
    if (!track) return;
    // duplicate the run so it can loop seamlessly
    track.innerHTML += track.innerHTML;
    var half = track.scrollWidth / 2;
    if (half <= 0) return;

    var x = 0;
    var BASE = 42;                 // px/sec idle drift (leftward)
    var setX = gsap.quickSetter(track, 'x', 'px');

    gsap.ticker.add(function (time, deltaMS) {
      var dt = Math.min((deltaMS || 16) / 1000, 0.05);
      var vel = (lenis && typeof lenis.velocity === 'number') ? lenis.velocity : 0;
      // scroll velocity pushes the ticker faster / flips it
      var speed = BASE + vel * 7;
      x -= speed * dt;
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
      setX(x);
    });
  }

  /* ---------- boot ---------- */
  try {
    if (reduced) {
      gsap.set('.hero-title', { autoAlpha: 1 });   // nothing hidden
    } else {
      heroIntro();
      sectionReveals();
      velocitySkew();
      heroParallax();
      ticker();
    }
  } catch (err) {
    // any failure: guarantee the hero is visible, skip the rest
    gsap.set('.hero-title', { autoAlpha: 1 });
    if (window.console) console.warn('wild.js:', err);
  }

  // recalc triggers once fonts / the instagram feed have shifted layout
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  setTimeout(function () { ScrollTrigger.refresh(); }, 1500);
})();
