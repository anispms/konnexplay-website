/**
 * "A newer version is available."
 *
 * Publishing is already automatic: a save in the admin panel, or any commit,
 * is live about twenty seconds later. What was missing is the other half. A
 * browser that already has the page open, or a cached copy of it, has no way
 * to learn that anything changed, so the owner refreshes, sees the old page,
 * and concludes the change did not work.
 *
 * This checks a small version file and, when the build changes, offers a
 * refresh. It offers rather than forces, because reloading underneath someone
 * who is halfway through the demo form would cost a lead to fix a cosmetic
 * problem.
 *
 * Cheap by design: one request to a file of a few dozen bytes, only when the
 * tab is actually visible, and never while a form is being filled in.
 */
(function () {
  'use strict';

  var CHECK_MS = 2 * 60 * 1000;
  var loadedBuild = window.KX_BUILD || null;
  var dismissed = false;
  var showing = false;
  var timer = null;

  function formBusy() {
    try {
      // Someone typing into the demo form must never be interrupted.
      var el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return true;
      var inputs = document.querySelectorAll('input[name="name"], input[name="phone"], input[name="venue"], input[name="city"]');
      for (var i = 0; i < inputs.length; i++) {
        if ((inputs[i].value || '').trim()) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function banner() {
    if (showing || dismissed) return;
    showing = true;

    var style = document.createElement('style');
    style.textContent =
      '#kx-update{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:2147483600;' +
      'display:flex;align-items:center;gap:12px;max-width:calc(100vw - 28px);' +
      'background:#0D1B3E;color:#fff;padding:12px 14px;border-radius:10px;' +
      'box-shadow:0 10px 30px rgba(13,27,62,.34);' +
      'font:500 14px/1.4 Inter,system-ui,-apple-system,sans-serif;}' +
      '@media (min-width:901px){#kx-update{bottom:22px}}' +
      '#kx-update button{font:600 14px Inter,system-ui,sans-serif;border:0;border-radius:7px;' +
      'padding:9px 14px;min-height:40px;cursor:pointer}' +
      '#kx-update .kx-go{background:#0DC59A;color:#062B22}' +
      '#kx-update .kx-no{background:transparent;color:#B9C2D6;padding:9px 6px}' +
      '#kx-update .kx-no:hover{color:#fff}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'kx-update';
    bar.setAttribute('role', 'status');
    bar.innerHTML =
      '<span>This page has been updated.</span>' +
      '<button type="button" class="kx-go">Refresh</button>' +
      '<button type="button" class="kx-no" aria-label="Dismiss this message">Later</button>';

    bar.querySelector('.kx-go').addEventListener('click', function () {
      // A plain reload can still be served from cache; a changed URL cannot.
      var u = new URL(location.href);
      u.searchParams.set('r', Date.now().toString(36));
      location.replace(u.toString());
    });
    bar.querySelector('.kx-no').addEventListener('click', function () {
      dismissed = true;
      bar.remove();
      if (timer) clearInterval(timer);
    });

    document.body.appendChild(bar);
  }

  function check() {
    if (dismissed || showing) return;
    if (document.visibilityState !== 'visible') return;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.build) return;
        if (!loadedBuild) { loadedBuild = j.build; return; }
        if (j.build === loadedBuild) return;
        if (formBusy()) return; // try again on the next tick
        banner();
      })
      .catch(function () {});
  }

  // Check when the tab comes back into view, which is when someone has just
  // published and switched to look at the result.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') setTimeout(check, 600);
  });

  timer = setInterval(check, CHECK_MS);
  setTimeout(check, 20000);
})();
