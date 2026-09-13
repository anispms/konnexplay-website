# Lead capture

Every demo request lands in a Google Sheet you own, and an email goes to
anis@konnexplay.com the moment it arrives. No third-party service, no signup, no monthly cost. It uses
the Google account you already have.

Until you finish this setup the form falls back to handing the lead to
WhatsApp, which only reaches you if the visitor presses send. Once the URL is
in place the form stops doing that: it saves the request, emails you, and
simply confirms to the visitor that you will call. WhatsApp stays on the
confirmation as an option for anyone in a hurry.

## Setup, about five minutes

**1. Make the spreadsheet.** Go to <https://sheets.new> and name it something
like `KonnexPlay leads`. Leave it empty. The script creates the `Leads` tab and
its header row on the first submission.

**2. Open the script editor.** In that sheet, choose **Extensions → Apps
Script**. A new tab opens with an empty `Code.gs`.

**3. Paste the code.** Delete whatever is in `Code.gs`, then paste the entire
contents of `leads-apps-script.gs` from this folder. The `NOTIFY_EMAIL` value near the
top is already set to anis@konnexplay.com; change it there if you ever want
alerts somewhere else. Save.

**4. Deploy it.** Click **Deploy → New deployment**. Pick type **Web app**.
Set these two options, which matter:

| Field | Value |
| --- | --- |
| Execute as | Me |
| Who has access | Anyone |

"Anyone" sounds alarming but is required, because your website visitors are not
signed in to Google. The script only ever appends a row and sends you mail. It
reads nothing back out and returns no data.

**5. Authorise it.** Google will warn that the app is unverified, because you
wrote it yourself. Choose **Advanced → Go to (project name)** and allow it. You
are granting your own script access to your own sheet.

**6. Copy the Web app URL.** It looks like
`https://script.google.com/macros/s/AKfy.../exec`.

**7. Switch it on.** Open `config.js` in the site root and paste the URL:

```js
window.KX_LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

Commit and push. The live site picks it up on the next deploy, about thirty
seconds.

## Checking it works

Open the live site, go to **Book a demo**, and submit a test with your own
number. Within a few seconds you should see a new row in the sheet and an email
in your inbox. If nothing arrives, open the browser console on the demo page and
look for a failed request to `script.google.com`.

## What gets stored

One row per submission: received-at timestamp, name, mobile, venue, city, court
count, main sport, how they take bookings today, plus the page URL and referrer
so you can tell which sport or city page produced the lead.

That referrer column is the one that tells you which pages actually generate
business, which is worth watching once the site has traffic.

## Notes

- Google Apps Script allows roughly 20,000 web app calls and 100 emails per day
  on a free consumer account. Far beyond what this site will produce.
- The script ignores any submission that fills a `company` field. That is a
  honeypot for bots. The site never shows such a field to a real visitor.
- The endpoint accepts form-encoded posts, which is deliberate. It avoids a CORS
  preflight that Apps Script would reject.
- Deploying a **new version** after editing the script: use **Deploy → Manage
  deployments → edit → Version: New version**. Creating a brand new deployment
  instead would give you a different URL, and you would have to update
  `config.js` again.
