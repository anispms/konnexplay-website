/**
 * Zoho CRM lead capture.
 *
 * Why this way. Calling the Zoho CRM API from the browser would mean putting a
 * client secret and refresh token into JavaScript that anyone can read with
 * View Source. That is a real key to the CRM, handed to the public. Zoho's own
 * Web Forms exist for exactly this case: the form posts to Zoho with public,
 * form-specific tokens that are useless anywhere else, and no secret leaves
 * the CRM. Web Forms are included in the free edition.
 *
 * How it posts. Zoho's endpoint does not allow cross-origin reads, so a normal
 * form POST aimed at a hidden iframe is used. The visitor stays on the page and
 * sees nothing; Zoho receives a genuine form submission.
 *
 * Configured from the admin panel. While it is off, nothing here runs.
 */
(function () {
  'use strict';

  // Indian accounts live on zoho.in, most others on zoho.com. Getting this
  // wrong fails silently, which is why the admin panel asks explicitly.
  var HOSTS = {
    in: 'https://crm.zoho.in/crm/WebToLeadForm',
    com: 'https://crm.zoho.com/crm/WebToLeadForm',
    eu: 'https://crm.zoho.eu/crm/WebToLeadForm',
    au: 'https://crm.zoho.com.au/crm/WebToLeadForm',
    jp: 'https://crm.zoho.jp/crm/WebToLeadForm'
  };

  function cfg() {
    var z = window.KX_ZOHO || {};
    if (!z.enabled) return null;
    if (!z.xnQsjsdp || !z.xmIwtLD || !z.actionType) return null;
    return {
      url: HOSTS[(z.region || 'in').toLowerCase()] || HOSTS.in,
      xnQsjsdp: z.xnQsjsdp,
      xmIwtLD: z.xmIwtLD,
      actionType: z.actionType,
      leadSource: z.leadSource || 'Website'
    };
  }

  function iframe() {
    var id = 'kx-zoho-sink';
    var f = document.getElementById(id);
    if (f) return f;
    f = document.createElement('iframe');
    f.id = id;
    f.name = id;
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('tabindex', '-1');
    f.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;border:0;opacity:0';
    document.body.appendChild(f);
    return f;
  }

  function hidden(form, name, value) {
    var i = document.createElement('input');
    i.type = 'hidden';
    i.name = name;
    i.value = value == null ? '' : String(value);
    form.appendChild(i);
  }

  /**
   * Split a single typed name into the shape Zoho wants. Last Name is
   * mandatory on a Lead, so a one-word name goes there rather than being
   * dropped for having no surname.
   */
  function splitName(full) {
    var parts = String(full || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { first: '', last: 'Unknown' };
    if (parts.length === 1) return { first: '', last: parts[0] };
    return { first: parts.shift(), last: parts.join(' ') };
  }

  /**
   * Send one lead to Zoho. Returns true if a submission was actually made,
   * so the caller can tell the visitor the truth about what happened.
   */
  window.KX_ZOHO_SUBMIT = function (lead) {
    var c = cfg();
    if (!c) return false;
    try {
      var n = splitName(lead.name);
      var notes = [
        'Courts or turfs: ' + (lead.courts || 'not stated'),
        'Main sport: ' + (lead.sport || 'not stated'),
        'Takes bookings today via: ' + (lead.method || 'not stated'),
        'Submitted from: ' + (lead.page || location.href),
        'Referrer: ' + (lead.referrer || 'direct')
      ].join('\n');

      iframe();

      var form = document.createElement('form');
      form.method = 'POST';
      form.action = c.url;
      form.target = 'kx-zoho-sink';
      form.acceptCharset = 'UTF-8';
      form.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';

      // Zoho's own required tokens. Removing any of them breaks the form.
      hidden(form, 'xnQsjsdp', c.xnQsjsdp);
      hidden(form, 'zc_gad', '');
      hidden(form, 'xmIwtLD', c.xmIwtLD);
      hidden(form, 'actionType', c.actionType);
      // Zoho redirects the hidden iframe here after accepting the lead.
      hidden(form, 'returnURL', location.origin + location.pathname);

      // Lead fields, named exactly as Zoho expects them.
      hidden(form, 'Last Name', n.last);
      if (n.first) hidden(form, 'First Name', n.first);
      hidden(form, 'Company', lead.venue || 'Not stated');
      hidden(form, 'Phone', lead.phone || '');
      hidden(form, 'City', lead.city || '');
      hidden(form, 'Lead Source', c.leadSource);
      hidden(form, 'Description', notes);

      document.body.appendChild(form);
      form.submit();
      setTimeout(function () {
        if (form.parentNode) form.parentNode.removeChild(form);
      }, 4000);
      return true;
    } catch (e) {
      return false;
    }
  };

  /** Whether a lead would actually reach Zoho right now. */
  window.KX_ZOHO_READY = function () {
    return !!cfg();
  };
})();
