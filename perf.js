/**
 * Connection-aware media, plus a way to stop the motion.
 *
 * The homepage hero autoplays a 2.6 MB video. On a 3G phone on metered data,
 * which is a large share of venue owners in India, that is most of the page
 * weight before a single word is read. Where the browser says the connection
 * is slow, or the visitor has switched on data saver, we keep the poster frame
 * and skip the download.
 *
 * Reduced motion is handled differently, and deliberately. An earlier version
 * also held the video for anyone with "reduce motion" switched on, which is
 * common on phones in battery saver. That silently turned the hero into a
 * still image for a lot of people, including the site's owner, and looked
 * broken rather than considerate. The video now plays for them, and instead
 * every autoplaying video gets a pause control, so anyone who does not want
 * the movement can stop it in one tap. That is what WCAG 2.2.2 actually asks
 * for: a way to pause motion that runs longer than five seconds.
 */
(function () {
  'use strict';

  function holdReason() {
    try {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return false;
      if (c.saveData) return 'save-data';
      if (c.effectiveType && /(^|-)(2g|slow-2g)$/.test(c.effectiveType)) return 'slow-connection';
      return false;
    } catch (e) {
      return false;
    }
  }

  var reason = holdReason();

  function hold(video) {
    if (!video || video.__kxHeld) return;
    video.__kxHeld = true;
    try {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.pause();
      if (!video.getAttribute('poster')) video.style.background = '#061428';
      video.setAttribute('controls', 'controls');
      video.setAttribute('data-kx-held', reason);
    } catch (e) {}
  }

  /* ---- pause control for autoplaying video ---- */

  var CSS_ID = 'kx-motion-style';
  function ensureStyle() {
    if (document.getElementById(CSS_ID)) return;
    var st = document.createElement('style');
    st.id = CSS_ID;
    st.textContent =
      '.kx-motion-toggle{position:absolute;right:14px;bottom:14px;z-index:5;' +
      'display:inline-flex;align-items:center;justify-content:center;gap:6px;' +
      'min-height:40px;padding:0 14px;border:0;border-radius:999px;cursor:pointer;' +
      'font:600 13px/1 Inter,system-ui,sans-serif;color:#0D1B3E;' +
      'background:rgba(255,255,255,.86);backdrop-filter:blur(6px);' +
      '-webkit-backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.18);}' +
      '.kx-motion-toggle:hover{background:#fff}' +
      '.kx-motion-toggle:focus-visible{outline:3px solid #0DC59A;outline-offset:2px}' +
      '@media (max-width:560px){.kx-motion-toggle{right:10px;bottom:10px;min-height:36px;padding:0 11px;font-size:12px}}';
    document.head.appendChild(st);
  }

  function addToggle(video) {
    if (video.__kxToggle) return;
    if (!video.autoplay && !video.hasAttribute('autoplay')) return;
    var host = video.parentElement;
    if (!host) return;
    video.__kxToggle = true;
    ensureStyle();

    try {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    } catch (e) {}

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kx-motion-toggle';
    btn.setAttribute('aria-label', 'Pause the background video');
    btn.innerHTML = '<span aria-hidden="true">&#10073;&#10073;</span> Pause';

    btn.addEventListener('click', function () {
      if (video.paused) {
        video.play().catch(function () {});
        btn.setAttribute('aria-label', 'Pause the background video');
        btn.innerHTML = '<span aria-hidden="true">&#10073;&#10073;</span> Pause';
      } else {
        video.pause();
        btn.setAttribute('aria-label', 'Play the background video');
        btn.innerHTML = '<span aria-hidden="true">&#9654;</span> Play';
      }
    });

    host.appendChild(btn);
  }

  function handle(video) {
    if (reason) hold(video);
    else addToggle(video);
  }

  function sweep(root) {
    if (!root || !root.querySelectorAll) return;
    var vids = root.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) handle(vids[i]);
  }

  sweep(document);

  // The runtime injects pages after load, so watch for videos added later.
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'VIDEO') handle(n);
          else sweep(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
