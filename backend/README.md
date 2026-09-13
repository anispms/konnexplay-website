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

---

# Zoho CRM

Every demo request can also create a Lead in Zoho CRM. This works on the free
edition, and it runs alongside the Google Sheet and the email rather than
replacing them.

## Why it is done with a web form, not the API

Calling the Zoho API from the website would mean putting a client secret and a
refresh token into JavaScript that anyone can read with View Source. That is a
working key to your CRM, published on a public page.

Zoho's Web Forms exist for exactly this. The form posts to Zoho using tokens
that only identify that one form and are useless anywhere else. Nothing secret
leaves the CRM.

## Setup, about ten minutes

**1. Create the web form.** In Zoho CRM go to **Setup**, then **Developer
Space**, then **Webforms**, and create a new form for the **Leads** module.

**2. Add these fields to it.** The names must match, because the site posts
under exactly these labels:

| Zoho field | What the site sends |
| --- | --- |
| Last Name | Surname, or the whole name if only one word was typed |
| First Name | First name, when there is one |
| Company | The venue name |
| Phone | Mobile number with +91 |
| City | City |
| Lead Source | Whatever you set as the lead source label |
| Description | Court count, main sport, how they take bookings today, the page they came from, and the referrer |

Last Name and Company are mandatory on a Zoho Lead. The site never sends them
empty: a one-word name goes into Last Name, and a missing venue becomes "Not
stated", so a lead is never rejected for a blank required field.

**3. Save and choose "Self hosted"** when Zoho asks where the form will live.
It will show you the generated HTML.

**4. Copy three values out of that HTML.** Look for hidden inputs named:

- `xnQsjsdp`
- `xmIwtLD`
- `actionType`

**5. Paste them into the admin panel** under Zoho CRM, set the data centre to
match your account, switch it On, and save.

## The data centre matters

An Indian Zoho account lives on **crm.zoho.in**, not crm.zoho.com. Check the
address bar while signed in to Zoho and pick the matching option. The wrong
data centre fails silently: the form posts, nothing errors, and no lead ever
appears.

## Checking it works

Submit a test request through the live site with your own number, then open
**Leads** in Zoho. The record should appear within a few seconds, with the
court count and sport in the Description.

If nothing arrives, the usual causes in order are: the wrong data centre, a
token pasted with a trailing space, or a field in the Zoho form that is marked
mandatory but is not in the table above.

## Duplicate leads

If you have both the Google Sheet and Zoho switched on, each request is
recorded in both. That is deliberate. The sheet is a plain backup you own
outright, and it keeps working if a Zoho form is ever deleted or reconfigured.
