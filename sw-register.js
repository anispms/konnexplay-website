/**
 * Registers the service worker and keeps it current.
 *
 * Without this, a refresh on GitHub Pages can still show a ten minute old page.
 * With it, every refresh asks the server for the page first, so what you see is
 * what is published.
 *
 * Deliberately quiet: if service workers are unavailable, blocked, or the page
 * is not on https, nothing happens and the site behaves exactly as before.
 */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  // Service workers need a secure context. localhost counts as one.
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js')
      .then(function (reg) {
        // Check for a newer worker when the tab regains focus, which is when
        // someone has just published and switched back to look.
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') {
            try { reg.update(); } catch (e) {}
          }
        });
      })
      .catch(function () {});

    // A new worker taking control means the files under it changed.
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) return;
      reloading = true;
      // Do not yank the page out from under someone filling in the form.
      try {
        var el = document.activeElement;
        if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
        var filled = document.querySelectorAll('input[name="name"], input[name="phone"], input[name="venue"], input[name="city"]');
        for (var i = 0; i < filled.length; i++) {
          if ((filled[i].value || '').trim()) return;
        }
      } catch (e) {}
      location.reload();
    });
  });

  /* Used by the admin panel after publishing. */
  window.KX_CLEAR_CACHE = function () {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('kx-clear-cache');
      }
    } catch (e) {}
  };
})();
