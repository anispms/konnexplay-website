/**
 * Present the product screenshots properly.
 *
 * Two things were wrong with them.
 *
 * First, they were being cropped. Every screenshot sat in a box with a fixed
 * aspect ratio and object-fit: cover, and almost none of the ratios matched the
 * picture. The calendar is 1134x638 but was poured into a 1366x637 box, so a
 * sixth of it was shaved off the sides. The analytics report is 2.59 wide and
 * was crammed into a 1.78 box on the homepage, losing its entire right half.
 * The very numbers a venue owner is meant to read were outside the frame. Each
 * screenshot now gets a box cut to its own shape, so nothing is lost and there
 * are no grey bars either.
 *
 * Second, they looked like loose images. A raw capture with a one pixel grey
 * border reads as a placeholder, not as a product. Each one is now set in a
 * browser window drawn in CSS, lifted off the page with a soft shadow, and it
 * rises into place as you scroll to it with a single sweep of light across the
 * glass.
 *
 * The homepage has a stack of five screenshots that cross-fade as you read the
 * feature list beside them. That one keeps its stack; the window simply
 * reshapes itself to whichever screenshot is showing.
 *
 * Everything here is additive. If any of it fails the screenshots are still
 * there, still in the page, still tappable to open full screen.
 */
(function () {
  'use strict';

  var SEL = 'img[src*="assets/shot-"]';

  /* The address shown in the window's URL bar. The booking screens are what a
     player sees on the venue's own site; the rest is the owner's console. */
  function addressFor(src) {
    var f = (src || '').split('/').pop().toLowerCase();
    if (/venue-page|pick-time|checkout|choose-sport/.test(f)) return 'reemplay.konnexplay.com';
    return 'app.konnexplay.com';
  }

  var LOCK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function chrome(src) {
    var bar = document.createElement('div');
    bar.className = 'kx-shot-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML =
      '<span class="kx-shot-dots"><i></i><i></i><i></i></span>' +
      '<span class="kx-shot-url">' + LOCK + '<span>' + addressFor(src) + '</span></span>';
    return bar;
  }

  /* ---------------------------------------------------------------------- */

  function reveal(frame) {
    if (!window.IntersectionObserver) {
      frame.classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-in');
            io.unobserve(entries[i].target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    io.observe(frame);
  }

  /** Give the screen the exact shape of the picture inside it. */
  function fitToImage(screen, img) {
    function apply() {
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return;
      screen.style.setProperty('--kx-ar', w + ' / ' + h);
    }
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  }

  /* ---------------------------------------------------------------------- */
  /* A single screenshot: wrap it in a window of its own.                    */

  function frameSingle(img) {
    var frame = document.createElement('div');
    frame.className = 'kx-shot';
    var screen = document.createElement('div');
    screen.className = 'kx-shot-screen';

    img.parentNode.insertBefore(frame, img);
    frame.appendChild(chrome(img.getAttribute('src')));
    frame.appendChild(screen);
    screen.appendChild(img);

    img.classList.add('kx-shot-img');
    fitToImage(screen, img);
    reveal(frame);
  }

  /* ---------------------------------------------------------------------- */
  /* The homepage stack: five screenshots in one box, cross-fading.          */

  function frameStack(box, imgs) {
    var frame = document.createElement('div');
    frame.className = 'kx-shot kx-shot-stacked';
    box.parentNode.insertBefore(frame, box);
    frame.appendChild(chrome(imgs[0].getAttribute('src')));
    frame.appendChild(box);

    box.classList.add('kx-shot-screen');
    /* The box sized itself with padding-bottom, which locks it to one shape.
       The shape now follows whichever screenshot is on top. */
    box.style.paddingBottom = '0';
    box.style.border = '0';

    for (var i = 0; i < imgs.length; i++) imgs[i].classList.add('kx-shot-img');

    var addr = frame.querySelector('.kx-shot-url span');
    var settle = null;
    function active() {
      var best = null, bestOp = -1;
      for (var i = 0; i < imgs.length; i++) {
        /* The inline value is the one the page has just asked for. Reading the
           computed value instead catches the cross-fade half way through, and
           picks the screenshot on its way out. */
        var op = parseFloat(imgs[i].style.opacity);
        if (isNaN(op)) op = parseFloat(getComputedStyle(imgs[i]).opacity);
        if (isNaN(op)) op = 1;
        if (op > bestOp) { bestOp = op; best = imgs[i]; }
      }
      if (!best) return;
      for (var j = 0; j < imgs.length; j++) {
        imgs[j].classList.toggle('is-live', imgs[j] === best);
      }
      var w = best.naturalWidth, h = best.naturalHeight;
      if (w && h) box.style.setProperty('--kx-ar', w + ' / ' + h);

      /* The stack moves between the player's booking site and the owner's
         console, so the address has to move with it. */
      if (addr) {
        var next = addressFor(best.getAttribute('src'));
        if (addr.textContent !== next) addr.textContent = next;
      }
    }

    var late = [];
    function schedule() {
      clearTimeout(settle);
      settle = setTimeout(active, 40);
      /* And once more after the cross-fade has finished, in case the shape was
         read while two screenshots were still sharing the frame. */
      while (late.length) clearTimeout(late.pop());
      late.push(setTimeout(active, 380));
      late.push(setTimeout(active, 760));
    }

    if (window.MutationObserver) {
      var mo = new MutationObserver(schedule);
      for (var k = 0; k < imgs.length; k++) {
        mo.observe(imgs[k], { attributes: true, attributeFilter: ['style'] });
        imgs[k].addEventListener('load', schedule, { once: true });
      }
    }
    active();
    /* React re-renders the inline styles; a couple of late passes make sure the
       first paint settles on the right shape. */
    setTimeout(active, 400);
    setTimeout(active, 1600);
    reveal(frame);
  }

  /* ---------------------------------------------------------------------- */

  function isStackBox(el) {
    if (!el || el.nodeType !== 1) return false;
    var shots = el.querySelectorAll(SEL);
    if (shots.length < 2) return false;
    return getComputedStyle(shots[0]).position === 'absolute';
  }

  function enhance(root) {
    var imgs;
    try {
      imgs = (root || document).querySelectorAll(SEL);
    } catch (e) {
      return;
    }
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (img.__kxShot) continue;
      if (img.closest('#kx-lb')) continue;      // the full-screen viewer
      if (img.closest('.kx-shot')) { img.__kxShot = true; continue; }

      var box = img.parentElement;
      if (isStackBox(box)) {
        var group = box.querySelectorAll(SEL);
        for (var g = 0; g < group.length; g++) group[g].__kxShot = true;
        try { frameStack(box, [].slice.call(group)); } catch (e) {}
      } else {
        img.__kxShot = true;
        try { frameSingle(img); } catch (e) {}
      }
    }
  }

  function start() {
    enhance(document);
    if (!window.MutationObserver) return;
    var pending = null;
    new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(function () { enhance(document); }, 120);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 300); });
  } else {
    setTimeout(start, 300);
  }
})();
