/**
 * Connection-aware media.
 *
 * The homepage hero autoplays a 2.6 MB video. On a fast connection that is the
 * liveliness the site is built around. On a 3G phone on metered data, which is
 * a large share of venue owners in India, it is most of the page weight before
 * a single word is read.
 *
 * Where the browser tells us the connection is slow, or the visitor has asked
 * for reduced data or reduced motion, we keep the poster frame and skip the
 * download. Everyone still sees the hero; nobody pays for video they did not
 * ask for.
 */
(function () {
  'use strict';

  function shouldSkipVideo() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'reduced-motion';
      }
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return false;
      if (c.saveData) return 'save-data';
      if (c.effectiveType && /(^|-)(2g|slow-2g)$/.test(c.effectiveType)) return 'slow-connection';
      return false;
    } catch (e) {
      return false;
    }
  }

  var reason = shouldSkipVideo();
  if (!reason) return;

  function hold(video) {
    if (!video || video.__kxHeld) return;
    video.__kxHeld = true;
    try {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.pause();
      // Keep the poster visible instead of an empty black box.
      if (!video.getAttribute('poster')) video.style.background = '#061428';
      // Let the visitor opt in.
      video.setAttribute('controls', 'controls');
      video.setAttribute('data-kx-held', reason);
    } catch (e) {}
  }

  function sweep(root) {
    if (!root || !root.querySelectorAll) return;
    var vids = root.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) hold(vids[i]);
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
          if (n.tagName === 'VIDEO') hold(n);
          else sweep(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
