/**
 * Applies content.json to the rendered site.
 *
 * The pages were built as a design build, with the phone number, email and
 * prices written directly into the markup in dozens of places. Rather than
 * rewrite all of that, this reads content.json and substitutes each value
 * wherever its default appears: in visible text, in tel: and mailto: and
 * wa.me links, and in anything the runtime renders later.
 *
 * Two directions matter:
 *   - nodes the runtime adds later still carry the authored defaults, so they
 *     are swapped default -> current;
 *   - when the admin panel previews an edit, the document already shows the
 *     current values, so it is swapped current -> next.
 * Keeping both makes the substitution reversible, so undo in the panel
 * genuinely puts the old text back.
 *
 * If content.json is missing or unreadable the site renders exactly as
 * authored.
 */
(function () {
  'use strict';

  // What the pages say as authored.
  var DEFAULTS = {
    phoneDisplay: '+91 77788 58901',
    phoneDigits: '917778858901',
    email: 'hello@konnexplay.com',
    starter: '12,000',
    pro: '18,000',
    setupWaived: '5,000',
    instagram: 'https://www.instagram.com/konnex_play/',
    address: '57-58, Shiva Park Society, Adajan, Surat 395009, Gujarat'
  };

  // What the document currently shows. Starts at the authored defaults.
  var current = {};
  Object.keys(DEFAULTS).forEach(function (k) { current[k] = DEFAULTS[k]; });

  var TEXT_KEYS = ['phoneDisplay', 'email', 'address', 'starter', 'pro', 'setupWaived'];
  var ATTR_KEYS = ['phoneDigits', 'email', 'instagram', 'phoneDisplay'];
  var ATTRS = ['href', 'content', 'aria-label', 'title', 'alt'];

  function flatten(c) {
    c = c || {};
    var contact = c.contact || {};
    var pricing = c.pricing || {};
    var company = c.company || {};
    var out = {};
    Object.keys(DEFAULTS).forEach(function (k) { out[k] = DEFAULTS[k]; });
    if (contact.phoneDisplay) out.phoneDisplay = contact.phoneDisplay;
    if (contact.phoneDigits) out.phoneDigits = contact.phoneDigits;
    if (contact.email) out.email = contact.email;
    if (contact.instagram) out.instagram = contact.instagram;
    if (pricing.starter) out.starter = pricing.starter;
    if (pricing.pro) out.pro = pricing.pro;
    if (pricing.setupWaived) out.setupWaived = pricing.setupWaived;
    if (company.address) out.address = company.address;
    return out;
  }

  function pairsBetween(from, to, keys) {
    var pairs = [];
    keys.forEach(function (k) {
      if (from[k] && to[k] && from[k] !== to[k]) pairs.push([from[k], to[k]]);
    });
    // tel: links carry the number without spaces.
    if (from.phoneDisplay !== to.phoneDisplay) {
      var a = from.phoneDisplay.replace(/\s/g, '');
      var b = to.phoneDisplay.replace(/\s/g, '');
      if (a !== b) pairs.push([a, b]);
    }
    // Longest first, so a shorter value never eats part of a longer one.
    return pairs.sort(function (x, y) { return y[0].length - x[0].length; });
  }

  function swapText(node, pairs) {
    var v = node.nodeValue;
    if (!v || v.length > 20000) return;
    var out = v;
    for (var i = 0; i < pairs.length; i++) {
      if (out.indexOf(pairs[i][0]) !== -1) out = out.split(pairs[i][0]).join(pairs[i][1]);
    }
    if (out !== v) node.nodeValue = out;
  }

  function swapAttrs(el, pairs) {
    if (!el || !el.getAttribute) return;
    for (var a = 0; a < ATTRS.length; a++) {
      var raw = el.getAttribute(ATTRS[a]);
      if (!raw) continue;
      var out = raw;
      for (var i = 0; i < pairs.length; i++) {
        if (out.indexOf(pairs[i][0]) !== -1) out = out.split(pairs[i][0]).join(pairs[i][1]);
      }
      if (out !== raw) el.setAttribute(ATTRS[a], out);
    }
  }

  function sweep(root, textPairs, attrPairs) {
    if (!root) return;
    if (!textPairs.length && !attrPairs.length) return;

    if (root.nodeType === 3) { swapText(root, textPairs); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;

    if (textPairs.length && document.createTreeWalker) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var batch = [];
      var n;
      while ((n = walker.nextNode())) {
        var p = n.parentNode;
        if (p && (p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE')) continue;
        batch.push(n);
      }
      for (var i = 0; i < batch.length; i++) swapText(batch[i], textPairs);
    }
    if (attrPairs.length) {
      if (root.nodeType === 1) swapAttrs(root, attrPairs);
      if (root.querySelectorAll) {
        var els = root.querySelectorAll('[href],[content],[aria-label],[title],[alt]');
        for (var j = 0; j < els.length; j++) swapAttrs(els[j], attrPairs);
      }
    }
  }

  /** Bring the whole document from `current` to `next`. */
  function moveTo(next) {
    var t = pairsBetween(current, next, TEXT_KEYS);
    var a = pairsBetween(current, next, ATTR_KEYS);
    if (t.length || a.length) sweep(document.body || document.documentElement, t, a);
    current = next;
  }

  /** Nodes the runtime just added still carry the authored defaults. */
  function normaliseNew(node) {
    var t = pairsBetween(DEFAULTS, current, TEXT_KEYS);
    var a = pairsBetween(DEFAULTS, current, ATTR_KEYS);
    if (t.length || a.length) sweep(node, t, a);
  }

  function applyConfig(c) {
    if (c && c.leads && typeof c.leads.endpoint === 'string') {
      window.KX_LEAD_ENDPOINT = c.leads.endpoint;
    }
    moveTo(flatten(c));
  }

  // Watch for pages the runtime renders after load.
  if (window.MutationObserver) {
    var pending = [];
    var scheduled = false;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1 || added[j].nodeType === 3) pending.push(added[j]);
        }
      }
      if (scheduled || !pending.length) return;
      scheduled = true;
      var run = function () {
        var batch = pending.slice();
        pending.length = 0;
        scheduled = false;
        obs.disconnect();
        for (var k = 0; k < batch.length; k++) {
          try { normaliseNew(batch[k]); } catch (e) {}
        }
        obs.observe(document.documentElement, { childList: true, subtree: true });
      };
      if (window.requestAnimationFrame) requestAnimationFrame(run); else setTimeout(run, 16);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // The admin panel previews unsaved edits by posting them in.
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'kx-preview-content') return;
    try { applyConfig(e.data.content); } catch (err) {}
  });

  fetch('content.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) { if (c) applyConfig(c); })
    .catch(function () {});
})();
