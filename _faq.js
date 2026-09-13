/**
 * Fix the FAQ's price answer and add the questions a real buyer asks first.
 *
 * The commission answer said "The price is ₹12,000 per court per year" as if
 * there were one plan. There are two, and the homepage sells features from the
 * dearer one. Someone who lands on the FAQ from a search never sees the pricing
 * page, so this answer was the whole truth as far as they were concerned.
 *
 * Then four things the site never said anywhere, in the order a venue owner
 * asks them. Tax, because it is the first thing any Indian business asks about
 * a price. Existing bookings, because he has three months of them in a notebook
 * and it is his largest practical fear. Hardware, because he is quietly
 * budgeting for a counter machine that he does not need. And whether a player
 * has to install anything, because the answer is no and that is a selling
 * point the site was keeping to itself.
 */
const fs = require('fs');
const F = 'FAQ.dc.html';
let s = fs.readFileSync(F, 'utf8').replace(/\r\n/g, '\n');
const fail = (m) => { console.error('FAIL: ' + m); process.exit(1); };
const done = [];

if (s.indexOf('Is there tax on top') !== -1) { console.log('already applied'); process.exit(0); }

/* 1. The price answer knows both plans exist. */
const priceOld = `      ['Does KonnexPlay charge commission?', 'No KonnexPlay commission on direct bookings, and no charge per booking. The price is ₹12,000 per court per year. The ₹5,000 setup fee is waived.'],`;
if (s.indexOf(priceOld) === -1) fail('commission answer not found');
const priceNew = `      ['Does KonnexPlay charge commission?', 'No KonnexPlay commission on direct bookings, and no charge per booking. Starter is ₹12,000 per court per year. Pro is ₹18,000 and is the one you need if you price mornings and evenings differently, or want the expense and profit reports. The ₹5,000 setup fee is waived on both.'],`;
s = s.replace(priceOld, priceNew);
done.push('the price answer names both plans');

/* 2. The four missing questions, added after it. */
const additions = [
  `      ['Is there tax on top of the price?', 'No. KonnexPlay is not GST registered yet, so the price you are quoted is the price you pay and nothing is added at invoice. If that changes we will tell you before your renewal, not on the bill.'],`,
  `      ['What happens to the bookings I have already taken?', 'They come with you. During the 14 days before you go live we put your existing advance bookings into the calendar with you, court by court, so that on day one your Saturday looks the way it already does. You do not start from an empty calendar and you do not tell anyone their booking is gone.'],`,
  `      ['Do I need to buy any hardware?', 'No. No counter machine, no scanner, no computer. The manager app runs on the phone your staff already carry, and your booking website runs on the player\\'s phone. If you want a QR at the gate we print it for you.'],`,
  `      ['Does a player have to download an app?', 'No. Your booking website opens in whatever browser is already on their phone. They pick a slot, pay and get a confirmation without installing anything, which is most of the reason they finish the booking instead of giving up.'],`
].join('\n');

s = s.replace(priceNew, priceNew + '\n' + additions);
done.push('four questions added: tax, existing bookings, hardware, player app');

fs.writeFileSync(F, s);

/* The answers array must still parse. */
const body = fs.readFileSync(F, 'utf8');
const start = body.indexOf('[\'What is KonnexPlay?\'');
if (start === -1) {
  console.log('  note: could not locate the array start to parse-check');
} else {
  const end = body.indexOf('];', start);
  try {
    new Function('return [' + body.slice(start, end) + ']');
    done.push('FAQ array parses');
  } catch (e) {
    fail('FAQ array broken: ' + e.message);
  }
}
done.forEach((d) => console.log('  ' + d));
