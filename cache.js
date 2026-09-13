/**
 * Cache busting for the page files.
 *
 * GitHub Pages tells browsers to hold every file for ten minutes. The site's
 * own scripts and stylesheets carry a content hash in their URL, so they update
 * the moment they change. The page files do not: the runtime fetches each
 * .dc.html by a fixed name at route time, so a content or form change could sit
 * live on the server while the browser kept showing the old copy. That is
 * indistinguishable from the change not working, and it has caused exactly that
 * confusion more than once.
 *
 * This wraps fetch and XHR so any request for a .dc.html carries the current
 * build id. Only the request URL changes; the href attributes the runtime
 * matches on are left exactly as authored, because it keys its film and page
 * maps off those strings.
 *
 * KX_BUILD is rewritten by tools-stamp-version.js from the contents of the
 * page files, so it only changes when one of them actually changes.
 */
(function () {
  'use strict';

  var BUILD = window.KX_BUILD || 'dev';

  function stamp(url) {
    try {
      if (typeof url !== 'string') return url;
      var base = url.split('#')[0];
      if (base.indexOf('.dc.html') === -1) return url;
      if (base.indexOf('v=') !== -1) return url;
      var hash = url.indexOf('#') === -1 ? '' : url.slice(url.indexOf('#'));
      var sep = base.indexOf('?') === -1 ? '?' : '&';
      return base + sep + 'v=' + BUILD + hash;
    } catch (e) {
      return url;
    }
  }

  if (window.fetch) {
    var nativeFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        if (typeof input === 'string') {
          input = stamp(input);
        } else if (input && typeof input.url === 'string' && input.url.indexOf('.dc.html') !== -1) {
          input = new Request(stamp(input.url), input);
        }
      } catch (e) {}
      return nativeFetch.call(this, input, init);
    };
  }

  if (window.XMLHttpRequest) {
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      var args = Array.prototype.slice.call(arguments);
      args[1] = stamp(url);
      return open.apply(this, args);
    };
  }
})();
