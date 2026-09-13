/**
 * One place that knows how to deliver a demo request.
 *
 * There are two forms on this site: the short one at the bottom of the
 * homepage and the full one on the demo page. The demo page had delivery code;
 * the homepage form had none at all. Its submit handler set a flag and told the
 * visitor "We have your details. Roshan will call you to fix a time", and then
 * threw the lead away. Every person who filled in the form at the bottom of the
 * homepage, after reading the entire page, was lost without trace.
 *
 * That happened because the two forms were written separately. This file exists
 * so there is one implementation to keep correct.
 *
 * KX_SEND_LEAD(lead) resolves { delivered, waited }:
 *
 *   delivered  something actually acknowledged the lead. Never assumed from
 *              configuration: the endpoint has to answer, and the answer has to
 *              be readable and say so.
 *   waited     whether a network round trip happened. A browser only allows a
 *              new tab to be opened while a click is still live, so a caller
 *              that waited must not try to open WhatsApp itself.
 */
(function () {
  'use strict';

  var TIMEOUT_MS = 9000;
  var WA_NUMBER = '917778858901';

  function honeypot() {
    try {
      var h = document.querySelector('input[name="company"]');
      return h ? h.value : '';
    } catch (e) {
      return '';
    }
  }

  function encode(payload) {
    return Object.keys(payload)
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(payload[k] == null ? '' : payload[k]);
      })
      .join('&');
  }

  /** Keep a copy on the visitor's own device. Better than nothing if all else fails. */
  function remember(text) {
    try {
      var key = 'kx_demo_requests';
      var log = JSON.parse(window.localStorage.getItem(key) || '[]');
      log.push({ at: new Date().toISOString(), body: text });
      window.localStorage.setItem(key, JSON.stringify(log.slice(-50)));
    } catch (e) {}
  }

  window.KX_LEAD_TEXT = function (lead) {
    return [
      'Name: ' + (lead.name || ''),
      'Mobile: ' + (lead.phone || ''),
      'Venue: ' + (lead.venue || ''),
      'City: ' + (lead.city || ''),
      'Courts: ' + (lead.courts || ''),
      'Sports: ' + (lead.sport || ''),
      'Takes bookings today via: ' + (lead.method || 'not given')
    ].join('\n');
  };

  window.KX_WHATSAPP_URL = function (text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Demo request\n' + text);
  };

  /** Open WhatsApp with the lead filled in. Only works inside a live click. */
  window.KX_OPEN_WHATSAPP = function (text) {
    try {
      var a = document.createElement('a');
      a.href = window.KX_WHATSAPP_URL(text);
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (e) {
      return false;
    }
  };

  window.KX_SEND_LEAD = function (lead) {
    var text = window.KX_LEAD_TEXT(lead);
    remember(text);

    var zoho = false;
    try {
      if (window.KX_ZOHO_READY && window.KX_ZOHO_READY()) {
        zoho = !!window.KX_ZOHO_SUBMIT(lead);
      }
    } catch (e) {}

    var endpoint = window.KX_LEAD_ENDPOINT;
    if (!endpoint) {
      // Nothing to call, so no wait: the caller's click is still live and it
      // can open WhatsApp itself.
      return Promise.resolve({ delivered: zoho, waited: false, text: text });
    }

    var payload = {};
    Object.keys(lead).forEach(function (k) { payload[k] = lead[k]; });
    payload.company = honeypot();

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;

    var giveUp = new Promise(function (resolve) {
      timer = setTimeout(function () {
        try { if (ctrl) ctrl.abort(); } catch (e) {}
        resolve(false);
      }, TIMEOUT_MS);
    });

    var attempt = fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        if (!r || !r.ok) return false;
        return r.text().then(function (t) {
          // A sign-in page or an error page is not an acknowledgement.
          try { return !!JSON.parse(t).ok; } catch (e) { return false; }
        });
      })
      .catch(function () { return false; });

    return Promise.race([attempt, giveUp]).then(function (ok) {
      clearTimeout(timer);
      return { delivered: !!ok || zoho, waited: true, text: text };
    });
  };
})();
