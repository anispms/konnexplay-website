/**
 * Tap a product screenshot to see it properly.
 *
 * The screenshots are captures of a desktop dashboard, 1366 pixels wide. On a
 * phone they are drawn about 344 wide, a four times reduction, so the slot
 * times, court names and rupee figures inside them are illegible. A venue
 * owner is shown grey mush and told it is the product. The captions carry the
 * meaning, but the proof does not land.
 *
 * This makes each one open full screen, where the picture is shown as large as
 * the display allows and can be pinch-zoomed. Nothing about the page layout
 * changes; it only adds a way in.
 *
 * Deliberately small: no library, no dependencies, and if anything here fails
 * the screenshots behave exactly as they did before.
 */
(function () {
  'use strict';

  var SELECTOR = 'img[src*="assets/shot-"]';
  var open = false;
  var lastFocus = null;

  function styleOnce() {
    if (document.getElementById('kx-lb-style')) return;
    var st = document.createElement('style');
    st.id = 'kx-lb-style';
    st.textContent =
      SELECTOR + '{cursor:zoom-in}' +
      '#kx-lb{position:fixed;inset:0;z-index:2147483500;display:flex;align-items:center;' +
      'justify-content:center;background:rgba(6,20,40,.92);padding:16px;' +
      '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}' +
      '#kx-lb{overflow:auto;-webkit-overflow-scrolling:touch}' +
      '#kx-lb img{display:block;margin:auto;border-radius:6px;background:#fff;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.5);max-width:none;max-height:none;' +
      'height:auto;width:auto}' +
      '#kx-lb.kx-lb-wide img{height:74vh;width:auto}' +
      '#kx-lb.kx-lb-fit img{max-width:100%;height:auto}' +
      '#kx-lb .kx-lb-close{position:absolute;top:14px;right:14px;min-height:44px;' +
      'padding:0 16px;border:0;border-radius:999px;cursor:pointer;' +
      'font:600 15px/1 Inter,system-ui,sans-serif;color:#0D1B3E;background:#fff;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.25)}' +
      '#kx-lb .kx-lb-cap{position:absolute;left:16px;right:16px;bottom:16px;text-align:center;' +
      'font:500 14px/1.5 Inter,system-ui,sans-serif;color:#E3E8F2;text-shadow:0 1px 3px rgba(0,0,0,.6)}' +
      '@media (max-width:560px){#kx-lb{padding:10px}#kx-lb .kx-lb-close{top:10px;right:10px}}';
    document.head.appendChild(st);
  }

  /** The caption sitting under a screenshot explains what it shows. */
  function captionFor(img) {
    // The alt text is written for this exact screenshot. Walking the siblings
    // used to pick up the caption belonging to the next one down.
    var alt = (img.getAttribute('alt') || '').trim();
    if (alt) return alt;
    try {
      var next = img.parentElement && img.parentElement.nextElementSibling;
      var t = next ? (next.innerText || '').trim() : '';
      return t.length < 180 ? t : '';
    } catch (e) {
      return '';
    }
  }

  function close() {
    var el = document.getElementById('kx-lb');
    if (el) el.remove();
    open = false;
    document.documentElement.style.overflow = '';
    try { if (lastFocus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  function show(img) {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    styleOnce();

    var wrap = document.createElement('div');
    wrap.id = 'kx-lb';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', img.getAttribute('alt') || 'Product screenshot');

    var big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.getAttribute('alt') || '';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kx-lb-close';
    btn.textContent = 'Close';

    var cap = captionFor(img);
    wrap.appendChild(big);
    wrap.appendChild(btn);
    if (cap) {
      var c = document.createElement('div');
      c.className = 'kx-lb-cap';
      c.textContent = cap;
      wrap.appendChild(c);
    }

    wrap.addEventListener('click', function (e) {
      // Clicking the picture itself should not close it.
      if (e.target === big) return;
      close();
    });

    // A landscape screenshot on a portrait phone is useless at page width, so
    // scale it to the height and let the visitor pan across it.
    var wide = (img.naturalWidth / Math.max(1, img.naturalHeight)) > 1.2 &&
               window.innerWidth < window.innerHeight;
    wrap.className = wide ? 'kx-lb-wide' : 'kx-lb-fit';
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(wrap);
    setTimeout(function () { try { btn.focus(); } catch (e) {} }, 30);
  }

  document.addEventListener('keydown', function (e) {
    if (open && (e.key === 'Escape' || e.key === 'Esc')) close();
  });

  document.addEventListener(
    'click',
    function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG') return;
      if (!img.matches(SELECTOR)) return;
      if (img.closest('a,button')) return; // already does something
      e.preventDefault();
      show(img);
    },
    true
  );

  /* Reachable without a mouse: give each screenshot a keyboard entry point. */
  function makeFocusable(root) {
    var imgs = (root || document).querySelectorAll ? (root || document).querySelectorAll(SELECTOR) : [];
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i];
      if (im.__kxLb || im.closest('a,button')) continue;
      im.__kxLb = true;
      im.setAttribute('tabindex', '0');
      im.setAttribute('role', 'button');
      var label = im.getAttribute('alt') || 'product screenshot';
      im.setAttribute('aria-label', 'View ' + label + ' full screen');
      im.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          show(ev.currentTarget);
        }
      });
    }
  }

  makeFocusable(document);
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        for (var j = 0; j < muts[i].addedNodes.length; j++) {
          var n = muts[i].addedNodes[j];
          if (n.nodeType === 1) makeFocusable(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
