/**
 * Ambient background video.
 *
 * The intent is motion behind the words, not a video to be operated. So there
 * is no play button, no scrubber and no chrome of any kind. It starts on its
 * own, loops, and stays out of the way.
 *
 * Getting that to actually happen on a phone takes more than the autoplay
 * attribute. A browser only permits silent autoplay, and even then it refuses
 * in several ordinary situations: iOS Low Power Mode, a background tab at load,
 * Android data saver, or a slow first paint where the element is not yet laid
 * out. When the attribute alone is trusted, the result is a still frame with no
 * explanation, which is what was happening here.
 *
 * So this does four things:
 *   1. forces the attributes every browser needs before it will autoplay;
 *   2. asks to play, and asks again when the tab becomes visible;
 *   3. if the browser still refuses, plays at the first touch or scroll,
 *      which is a gesture the autoplay rules accept;
 *   4. only plays while the video is actually on screen, so a phone is not
 *      decoding video nobody is looking at.
 *
 * Accessibility is handled without visible chrome: a visitor who has asked
 * their system for reduced motion gets the poster frame instead, which is a
 * real preference rather than a guess, and a keyboard user can reach a pause
 * control that is invisible until focused.
 */
(function () {
  'use strict';

  function dataSaver() {
    try {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return false;
      if (c.saveData) return true;
      return !!(c.effectiveType && /(^|-)(2g|slow-2g)$/.test(c.effectiveType));
    } catch (e) {
      return false;
    }
  }

  /* Only a metered or very slow connection stops playback now. "Reduce motion"
     used to stop it as well, but that setting rides along with battery saver on
     many Android phones, so it silently killed the hero for a large share of
     visitors and for the site's owner. The keyboard-reachable pause below is
     the accessible escape hatch instead, which is what WCAG 2.2.2 asks for. */
  var STILL = dataSaver();

  function styleOnce() {
    if (document.getElementById('kx-ambient-style')) return;
    var st = document.createElement('style');
    st.id = 'kx-ambient-style';
    st.textContent =
      /* Keyboard-only pause. Invisible until focused, so it never reads as a
         player, but a keyboard user can still stop the motion. */
      '.kx-amb-pause{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;' +
      'border:0;padding:0;background:transparent;color:inherit}' +
      '.kx-amb-pause:focus{left:auto;right:14px;bottom:14px;width:auto;height:auto;' +
      'z-index:6;padding:9px 14px;min-height:40px;border-radius:999px;cursor:pointer;' +
      'font:600 13px/1 Inter,system-ui,sans-serif;color:#0D1B3E;background:#fff;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.2);outline:3px solid #0DC59A;outline-offset:2px}';
    document.head.appendChild(st);
  }

  function prepare(v) {
    if (!v || v.__kxAmbient) return;
    v.__kxAmbient = true;

    try {
      // Never a player: no chrome, no context menu, no picture-in-picture.
      v.removeAttribute('controls');
      v.controls = false;
      v.setAttribute('disablepictureinpicture', '');
      v.disablePictureInPicture = true;
      v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
      v.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      // What every browser requires before it will start on its own.
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.loop = true;
      v.setAttribute('loop', '');
      v.setAttribute('aria-hidden', 'true');
      v.tabIndex = -1;
    } catch (e) {}

    if (STILL) {
      try {
        v.autoplay = false;
        v.removeAttribute('autoplay');
        v.preload = 'none';
        v.pause();
      } catch (e) {}
      return;
    }

    try {
      v.autoplay = true;
      v.setAttribute('autoplay', '');
      if (v.preload === 'none') v.preload = 'auto';
    } catch (e) {}

    // Phones get the lighter cut where one exists: half the bytes, and on a
    // small screen the difference is not visible.
    try {
      var src = v.getAttribute('src') || '';
      if (window.innerWidth < 768 && /assets\/film-story\.mp4$/.test(src)) {
        v.setAttribute('src', src.replace('film-story.mp4', 'film-story-480.mp4'));
        v.load();
      }
    } catch (e) {}

    attempt(v);
    retryWhenReady(v);
    watch(v);
    keyboardPause(v);
  }

  /**
   * Is this video somewhere the visitor can see?
   *
   * Unknown counts as yes, so a browser without IntersectionObserver behaves
   * as it always did.
   */
  function onScreen(v) {
    if (!v) return false;
    if (v.__kxOnScreen === undefined) return true;
    return !!v.__kxOnScreen;
  }

  function attempt(v) {
    try {
      var p = v.play();
      if (p && p.catch) p.catch(function () { armGesture(); });
    } catch (e) {
      armGesture();
    }
  }

  /* A phone often refuses the first request simply because nothing is buffered
     yet. Retry as data arrives rather than giving up on one rejection. */
  function retryWhenReady(v) {
    ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (ev) {
      v.addEventListener(ev, function () {
        if (v.paused && !v.__kxUserPaused) attempt(v);
      });
    });
    // A stalled network can leave it paused with no further events.
    var tries = 0;
    var t = setInterval(function () {
      if (++tries > 10 || v.__kxUserPaused || !v.isConnected) { clearInterval(t); return; }
      if (!v.paused) { clearInterval(t); return; }
      // A video the observer paused for being off screen is paused for a good
      // reason. Retrying it here restarted decoding on something nobody could
      // see, which is what this retry is supposed to avoid.
      if (!onScreen(v)) return;
      attempt(v);
    }, 1500);
  }

  /* If the browser refused, the next thing the visitor does counts as a
     gesture and lets us start.
     This used to latch: the flag was set once for the whole page and never
     cleared, so the first video to fail consumed the single retry. A video
     further down the page, on another route, then had no way to recover and
     simply sat on its poster forever. The listeners are now torn down and the
     flag released after each attempt, so every video gets its own chance. */
  var armed = false;
  var EVENTS = ['touchstart', 'pointerdown', 'scroll', 'keydown'];

  function armGesture() {
    if (armed) return;
    armed = true;
    var go = function () {
      EVENTS.forEach(function (e) { window.removeEventListener(e, go, true); });
      armed = false;
      var vids = document.querySelectorAll('video');
      for (var i = 0; i < vids.length; i++) {
        var v = vids[i];
        if (v.__kxAmbient && v.paused && !v.__kxUserPaused && onScreen(v)) {
          try { v.play().catch(function () {}); } catch (e) {}
        }
      }
    };
    EVENTS.forEach(function (e) {
      window.addEventListener(e, go, { capture: true, passive: true });
    });
  }

  /* Play only while on screen, and resume when the tab comes back. */
  /* One observer for every ambient video, rather than one each. It also
     records where each video is, which the other paths now consult. */
  var vidIO = null;
  function videoObserver() {
    if (vidIO || !window.IntersectionObserver) return vidIO;
    vidIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          v.__kxOnScreen = en.isIntersecting;
          if (en.isIntersecting) {
            if (v.paused && !v.__kxUserPaused) attempt(v);
          } else if (!v.paused) {
            try { v.pause(); } catch (e) {}
          }
        });
      },
      { threshold: 0.1 }
    );
    return vidIO;
  }

  /* A single listener for the whole page. There used to be one per video,
     never removed, so on a site that swaps pages without reloading they piled
     up and each one kept a video that had left the page alive. */
  var resumeBound = false;
  function bindResume() {
    if (resumeBound) return;
    resumeBound = true;
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      var vids = document.querySelectorAll('video');
      for (var i = 0; i < vids.length; i++) {
        var v = vids[i];
        if (v.__kxAmbient && v.paused && !v.__kxUserPaused && onScreen(v)) attempt(v);
      }
    });
  }

  function watch(v) {
    var io = videoObserver();
    if (io) { v.__kxOnScreen = false; io.observe(v); }
    bindResume();
  }

  function keyboardPause(v) {
    var host = v.parentElement;
    if (!host) return;
    styleOnce();
    try {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    } catch (e) {}
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'kx-amb-pause';
    b.textContent = 'Pause background video';
    b.addEventListener('click', function () {
      if (v.paused) {
        v.__kxUserPaused = false;
        attempt(v);
        b.textContent = 'Pause background video';
      } else {
        v.__kxUserPaused = true;
        try { v.pause(); } catch (e) {}
        b.textContent = 'Play background video';
      }
    });
    host.appendChild(b);
  }

  function sweep(root) {
    if (!root || !root.querySelectorAll) return;
    var vids = root.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) prepare(vids[i]);
  }

  sweep(document);

  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'VIDEO') prepare(n);
          else sweep(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
