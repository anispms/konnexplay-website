/**
 * KonnexPlay lead capture — Google Apps Script Web App
 *
 * Stores every demo request as a row in a Google Sheet and emails you.
 * Free, uses the Google account you already have, no third-party service.
 *
 * Setup is in backend/README.md. Takes about five minutes.
 */

/** Email address that should be told about each new lead. */
var NOTIFY_EMAIL = 'anis@konnexplay.com';

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

    // The email must never be able to cost us the lead, so the row goes first
    // and the notification is allowed to fail on its own.
    var mailNote = '';
    try {
      notify_(data);
    } catch (mailErr) {
      mailNote = 'email failed: ' + String(mailErr).slice(0, 180);
      console.error(mailErr);
    }
    row.push(mailNote);

    writeRow_(sheet, row);
    return reply_({ ok: true, emailed: !mailNote });
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
    var header = ['Received at'].concat(FIELDS).concat(['Note']);
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(data) {
  if (!NOTIFY_EMAIL) return;
  // The endpoint takes posts from anywhere, so a forged venue could carry a
  // newline and try to write its own mail headers.
  var oneLine = function (v) { return String(v || '').replace(/[\r\n]+/g, ' ').slice(0, 120); };
  var subject = 'Demo request: ' + (oneLine(data.venue) || 'venue') + ', ' + oneLine(data.city);
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

/**
 * Append one row as plain text.
 *
 * appendRow parses what it is given: "+91 98765 43210" is read as a formula
 * and breaks, and anything a stranger can type that starts with = or + runs
 * when the sheet is opened. Forcing the format to text first means every value
 * is stored exactly as it was sent and nothing is ever executed.
 */
function writeRow_(sheet, row) {
  var r = sheet.getLastRow() + 1;
  var range = sheet.getRange(r, 1, 1, row.length);
  range.setNumberFormat('@');
  var out = [];
  for (var i = 0; i < row.length; i++) {
    out.push(row[i] instanceof Date ? row[i].toISOString() : String(row[i] == null ? '' : row[i]));
  }
  range.setValues([out]);
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
