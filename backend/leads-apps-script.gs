/**
 * KonnexPlay lead capture — Google Apps Script Web App
 *
 * Stores every demo request as a row in a Google Sheet and emails you.
 * Free, uses the Google account you already have, no third-party service.
 *
 * Setup is in backend/README.md. Takes about five minutes.
 */

/** Email address that should be told about each new lead. */
var NOTIFY_EMAIL = 'hello@konnexplay.com';

/** Tab name inside the spreadsheet. Created automatically. */
var SHEET_NAME = 'Leads';

var FIELDS = [
  'name',
  'phone',
  'venue',
  'city',
  'courts',
  'sport',
  'method',
  'page',
  'referrer',
  'userAgent'
];

function doPost(e) {
  try {
    var data = readPayload_(e);

    // Drop anything that filled the honeypot: that is a bot, not a venue owner.
    if (data.company) {
      return reply_({ ok: true, skipped: 'honeypot' });
    }

    var sheet = getSheet_();
    var row = [new Date()];
    for (var i = 0; i < FIELDS.length; i++) {
      row.push(data[FIELDS[i]] || '');
    }
    sheet.appendRow(row);

    notify_(data);
    return reply_({ ok: true });
  } catch (err) {
    // Never fail loudly at the browser: the site keeps its WhatsApp fallback.
    console.error(err);
    return reply_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return reply_({ ok: true, service: 'konnexplay-leads' });
}

function readPayload_(e) {
  if (!e) return {};
  // Sent as form-encoded so the browser can post without a CORS preflight.
  if (e.parameter && e.parameter.name) return e.parameter;
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (ignored) {
      return e.parameter || {};
    }
  }
  return e.parameter || {};
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    var header = ['Received at'].concat(FIELDS);
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(data) {
  if (!NOTIFY_EMAIL) return;
  var subject = 'Demo request: ' + (data.venue || 'venue') + ', ' + (data.city || '');
  var lines = [
    'Name:    ' + (data.name || ''),
    'Mobile:  ' + (data.phone || ''),
    'Venue:   ' + (data.venue || ''),
    'City:    ' + (data.city || ''),
    'Courts:  ' + (data.courts || ''),
    'Sport:   ' + (data.sport || ''),
    'Books via today: ' + (data.method || ''),
    '',
    'Page:     ' + (data.page || ''),
    'Referrer: ' + (data.referrer || 'direct')
  ];
  MailApp.sendEmail(NOTIFY_EMAIL, subject, lines.join('\n'));
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
