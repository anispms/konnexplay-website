/* KonnexPlay · the player booking film.
   ONE site card, rendered once, whose inner page slides cue to cue; the text
   panels and their grounds wipe behind it. Nothing is ever composited twice. */
const { useComposition, CompositionStage, Shot, Easing, animate, clamp } = window;

const NAVY = '#0D1B3E', DEEP = '#061428', TEAL = '#0DC59A', PAPER = '#FAFAF9';
const DISP = 'Outfit, system-ui, sans-serif', BODY = 'Inter, system-ui, sans-serif';
const DISSOLVE = 0.5;

const M = {
  enter: (a, b, f, t) => animate({ from: f, to: t, start: a, end: b, ease: Easing.easeOutCubic }),
  draw: (a, b, f, t) => animate({ from: f, to: t, start: a, end: b, ease: Easing.easeInOutQuad }),
  pop: (a, b, f, t) => animate({ from: f, to: t, start: a, end: b, ease: Easing.easeOutBack })
};
const box = (s) => Object.assign({ position: 'absolute' }, s);
const e = (t, s, ...k) => React.createElement(t, s ? { style: s } : null, ...k);
const ek = (key, t, s, ...k) => React.createElement(t, { key: key, style: s }, ...k);

const eyebrow = (text, color) => e('div', { fontSize: 21, letterSpacing: '.18em', fontWeight: 700, color: color, marginBottom: 22 }, text);
const head = (text, color, size) => e('div', { fontFamily: DISP, fontWeight: 800, fontSize: size || 72, lineHeight: 1.03, letterSpacing: '-0.035em', color: color, maxWidth: '19ch', textWrap: 'balance' }, text);
const body = (text, color) => e('div', { fontFamily: BODY, fontSize: 28, lineHeight: 1.5, color: color, marginTop: 24, maxWidth: '34ch' }, text);

const PAD = 120;
const SITE_X = 900, SITE_Y = 90, SITE_W = 900, SITE_H = 920;
const CHROME_H = 62, HEADER_H = 250;
const PAGE_H = SITE_H - CHROME_H - HEADER_H;

function BookingPiece() {
  const { T, CUES, authoredTotal } = useComposition();
  const ground = (cue) => M.draw(cue - DISSOLVE, cue, 0, 1)(T);
  const wipe = (cue) => ({ clipPath: 'inset(0 ' + ((1 - ground(cue)) * 100).toFixed(2) + '% 0 0)' });

  /* the page rail: one continuous slide, driven by the cues */
  const railIndex = ground(CUES.Sport) + ground(CUES.Slot) + ground(CUES.Pay) + ground(CUES.Confirm);

  /* the tap ring travels to whatever the player touches next */
  const TAPS = [
    { t: 2.9, x: 1350, y: 692, c: '#06301F', f: 'rgba(6,48,31,.18)' },
    { t: CUES.Sport + 2.4, x: 1136, y: 532, c: TEAL, f: 'rgba(13,197,154,.22)' },
    { t: CUES.Slot + 2.6, x: 1136, y: 659, c: TEAL, f: 'rgba(13,197,154,.22)' },
    { t: CUES.Pay + 2.4, x: 1350, y: 838, c: '#06301F', f: 'rgba(6,48,31,.18)' }
  ];
  const SPORTS = ['Box cricket', 'Football turf', 'Pickleball', 'Badminton'];
  const sportPick = T >= CUES.Sport + 2.4;
  const SLOTS = [['6:00 PM', 1], ['7:00 PM', 0], ['8:00 PM', 1], ['9:00 PM', 1], ['10:00 PM', 1], ['11:00 PM', 0]];
  const slotPick = T >= CUES.Slot + 2.6;
  const paid = T >= CUES.Pay + 2.4;
  const payFill = clamp(M.draw(CUES.Pay + 2.4, CUES.Pay + 3.1, 0, 1)(T), 0, 1);

  const clockT = clamp(M.draw(0.4, CUES.Confirm, 0, 6)(T), 0, 6);
  const clock = '11:' + String(12 + Math.round(clockT)).padStart(2, '0') + ' PM';

  const cta = (label, active, dim) => e('div', {
    background: active ? TEAL : NAVY, color: active ? DEEP : '#FFFFFF',
    textAlign: 'center', padding: '22px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em',
    opacity: dim ? 0.35 : 1
  }, label);

  const pageWrap = (children) => e('div', { width: SITE_W, flexShrink: 0, height: PAGE_H, padding: '28px 30px', boxSizing: 'border-box', background: '#FFFFFF' }, children);

  /* --- page 1 · the venue --- */
  const page1 = pageWrap(e('div', null,
    e('div', { fontSize: 23, color: '#5A6275', lineHeight: 1.5 }, 'Box cricket, football, pickleball and badminton. Live availability, instant confirmation, pay online.'),
    e('div', { display: 'flex', gap: 14, marginTop: 26, flexWrap: 'wrap' },
      ...['Live slots', 'Pay online', 'Instant confirmation'].map((c, i) =>
        ek('f' + i, 'div', { border: '1px solid #DDE0E5', padding: '12px 18px', fontSize: 20, fontWeight: 600, color: NAVY }, c))
    ),
    e('div', { marginTop: 80 }, cta('Book a slot', true))
  ));

  /* --- page 2 · the sport --- */
  const page2 = pageWrap(e('div', null,
    e('div', { fontSize: 21, letterSpacing: '.12em', fontWeight: 700, color: '#5A6275', marginBottom: 20 }, 'CHOOSE YOUR SPORT'),
    e('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
      ...SPORTS.map((s, i) => {
        const on = sportPick && i === 0;
        return ek('sp' + i, 'div', {
          border: '2px solid ' + (on ? TEAL : '#DDE0E5'), background: on ? '#E8FBF5' : '#FFFFFF', padding: '24px'
        },
          e('div', { fontFamily: DISP, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', color: NAVY }, s),
          e('div', { fontSize: 20, color: on ? '#088064' : '#5A6275', marginTop: 8, fontWeight: on ? 700 : 400 }, on ? 'Selected' : (i === 1 ? '2 turfs' : '2 courts'))
        );
      })
    ),
    e('div', { marginTop: 34 }, cta('See available slots', sportPick, !sportPick))
  ));

  /* --- page 3 · the slot --- */
  const page3 = pageWrap(e('div', null,
    e('div', { display: 'flex', gap: 12, marginBottom: 22 },
      ...['Fri 12', 'Sat 13', 'Sun 14', 'Mon 15'].map((d, i) =>
        ek('d' + i, 'div', {
          flex: 1, textAlign: 'center', padding: '13px 0', fontSize: 21, fontWeight: 700,
          background: i === 1 ? NAVY : '#FFFFFF', color: i === 1 ? '#FFFFFF' : '#5A6275',
          border: '1px solid ' + (i === 1 ? NAVY : '#DDE0E5')
        }, d))
    ),
    e('div', { fontSize: 21, letterSpacing: '.12em', fontWeight: 700, color: '#5A6275', marginBottom: 16 }, 'BOX CRICKET · TURF 1'),
    e('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
      ...SLOTS.map((s, i) => {
        const free = s[1] === 1;
        const chosen = slotPick && i === 2;
        return ek('sl' + i, 'div', {
          border: '2px solid ' + (chosen ? TEAL : (free ? '#DDE0E5' : '#EDEFF2')),
          background: chosen ? '#E8FBF5' : (free ? '#FFFFFF' : '#F4F5F7'),
          padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: free ? 1 : 0.75
        },
          e('div', { fontFamily: DISP, fontWeight: 700, fontSize: 27, letterSpacing: '-0.02em', color: free ? NAVY : '#5A6275' }, s[0]),
          e('div', { fontSize: 19, fontWeight: 700, color: chosen ? '#088064' : (free ? '#5A6275' : '#5A6275'), letterSpacing: free ? 0 : '.1em' },
            chosen ? 'SELECTED' : (free ? '₹1,200' : 'BOOKED'))
        );
      })
    ),
    e('div', { marginTop: 26 }, cta(slotPick ? 'Continue · ₹1,200' : 'Select a slot', slotPick, !slotPick))
  ));

  /* --- page 4 · the money --- */
  const page4 = pageWrap(e('div', null,
    e('div', { fontSize: 21, letterSpacing: '.12em', fontWeight: 700, color: '#5A6275', marginBottom: 18 }, 'REVIEW AND RESERVE'),
    ...[['Turf 1 · Box cricket', 'Sat 13 Sep'], ['Slot', '8:00 – 9:00 PM'], ['Rate', '₹1,200'], ['Advance now', '₹300']].map((r, i) =>
      ek('r' + i, 'div', {
        display: 'flex', justifyContent: 'space-between', gap: 20, padding: '15px 0',
        borderTop: '1px solid #DDE0E5', fontSize: 23, color: '#3D4457'
      }, e('span', null, r[0]), e('span', { fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }, r[1]))
    ),
    e('div', { display: 'flex', justifyContent: 'space-between', gap: 20, padding: '18px 0', borderTop: '2px solid ' + NAVY, borderBottom: '1px solid #DDE0E5', fontSize: 27, fontWeight: 700, color: NAVY },
      e('span', null, 'Pay now'), e('span', { fontVariantNumeric: 'tabular-nums' }, '₹300')),
    e('div', { position: 'relative', marginTop: 26, overflow: 'hidden' },
      cta(paid ? 'Payment received' : 'Pay ₹300 with UPI', paid),
      e('div', box({ left: 0, top: 0, bottom: 0, width: (payFill * 100) + '%', background: TEAL, opacity: paid ? 0 : 0.9 }))
    )
  ));

  /* --- page 5 · confirmed --- */
  const page5 = pageWrap(e('div', null,
    e('div', { background: TEAL, color: DEEP, padding: '26px 28px' },
      e('div', { fontSize: 19, letterSpacing: '.14em', fontWeight: 700 }, 'BOOKING CONFIRMED'),
      e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', marginTop: 8 }, 'Turf 1 · Sat, 8:00 PM'),
      e('div', { fontSize: 22, marginTop: 8, fontWeight: 600 }, '₹300 advance paid · ₹900 at the venue')
    ),
    e('div', { marginTop: 22 },
      e('div', { fontSize: 19, letterSpacing: '.12em', fontWeight: 700, color: '#5A6275' }, 'YOUR CALENDAR, UPDATED ITSELF'),
      ...[['8:00 PM', 'Turf 1 · new booking'], ['9:00 PM', 'Turf 1 · open'], ['10:00 PM', 'Turf 1 · open']].map((r, i) =>
        ek('cal' + i, 'div', {
          display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center',
          padding: '15px 0', borderTop: '1px solid #DDE0E5', fontSize: 23,
          color: i === 0 ? NAVY : '#5A6275', fontWeight: i === 0 ? 700 : 400
        }, e('span', { fontVariantNumeric: 'tabular-nums' }, r[0]), e('span', null, r[1]))
      )
    )
  ));

  const textPanel = (bg, wipeCue, children) => e('div', box(Object.assign({ inset: 0, background: bg }, wipeCue == null ? {} : wipe(wipeCue))), children);

  return e('div', { position: 'absolute', inset: 0, background: DEEP, overflow: 'hidden', fontFamily: BODY },

    /* ---------- the wiping grounds and their copy ---------- */
    textPanel(NAVY, null,
      e('div', box({ left: PAD, top: 300, width: 660 }),
        eyebrow('11:12 PM · A LINK FROM YOUR INSTAGRAM', TEAL),
        head('He is not calling you. He is opening your website.', '#FFFFFF', 70),
        body('Your venue has its own booking website. It is awake when your counter is not.', '#C6D0E4')
      )
    ),
    textPanel(PAPER, CUES.Sport,
      e('div', box({ left: PAD, top: 320, width: 640 }),
        eyebrow('STEP ONE', '#5A6275'),
        head('He picks the sport. Nobody explains anything.', NAVY, 68),
        body('Your courts, your sports, your rates. Exactly as you set them up once.', '#3D4457')
      )
    ),
    textPanel(NAVY, CUES.Slot,
      e('div', box({ left: PAD, top: 300, width: 640 }),
        eyebrow('STEP TWO', TEAL),
        head('He sees what is actually free. Not what you remember.', '#FFFFFF', 66),
        body('7 PM and 11 PM are already gone, so he cannot ask for them. That is the whole trick.', '#C6D0E4')
      )
    ),
    textPanel(DEEP, CUES.Pay,
      e('div', box({ left: PAD, top: 300, width: 640 }),
        eyebrow('STEP THREE', TEAL),
        head('He pays before he arrives.', '#FFFFFF', 74),
        body('Full amount or the advance you set. Settled to your bank account, with no commission taken out of it.', '#C6D0E4')
      )
    ),
    textPanel(NAVY, CUES.Confirm,
      e('div', box({ left: PAD, top: 250, width: 700 }),
        e('div', { fontSize: 21, letterSpacing: '.18em', fontWeight: 700, color: TEAL, marginBottom: 24 }, '11:18 PM · SIX MINUTES, START TO FINISH'),
        e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 96, lineHeight: 0.99, letterSpacing: '-0.04em', color: '#FFFFFF', maxWidth: '17ch', textWrap: 'balance' }, 'Nobody at the venue answered.'),
        e('div', { fontSize: 28, lineHeight: 1.5, color: '#C6D0E4', marginTop: 34, maxWidth: '36ch', opacity: M.enter(CUES.Confirm + 0.4, CUES.Confirm + 1.0, 0, 1)(T) },
          'The slot is closed, the advance is in, and the booking is waiting in your calendar when you open it tomorrow.'),
        e('div', { marginTop: 46, fontSize: 24, color: '#8E9AB5', opacity: M.enter(CUES.Confirm + 1.2, CUES.Confirm + 1.8, 0, 1)(T) }, 'konnexplay.com')
      )
    ),

    /* ---------- ONE site card, continuous across every cue ---------- */
    e('div', box({
      left: SITE_X, top: SITE_Y, width: SITE_W, height: SITE_H,
      background: '#FFFFFF', boxShadow: '0 40px 100px rgba(0,0,0,.45)', overflow: 'hidden'
    }),
      e('div', { display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: '#F1F3F6', borderBottom: '1px solid #DDE0E5', boxSizing: 'border-box', height: CHROME_H },
        e('div', { display: 'flex', gap: 8 },
          e('div', { width: 12, height: 12, borderRadius: 12, background: '#D9DDE3' }),
          e('div', { width: 12, height: 12, borderRadius: 12, background: '#D9DDE3' }),
          e('div', { width: 12, height: 12, borderRadius: 12, background: '#D9DDE3' })),
        e('div', { flex: 1, background: '#FFFFFF', border: '1px solid #DDE0E5', padding: '8px 16px', fontSize: 19, color: '#5A6275' }, 'riverfront-arena.konnexplay.com'),
        e('div', { fontSize: 18, fontWeight: 700, color: '#5A6275', fontVariantNumeric: 'tabular-nums' }, clock)
      ),
      e('div', { position: 'relative', height: HEADER_H, overflow: 'hidden', background: NAVY },
        React.createElement('img', { src: 'assets/venue-turf-night-wide.jpg', alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', transform: 'scale(' + (1.04 + M.draw(0, authoredTotal, 0, 0.1)(T)) + ')' } }),
        e('div', box({ inset: 0, background: 'linear-gradient(90deg, rgba(6,20,40,.86) 0%, rgba(6,20,40,.32) 100%)' })),
        e('div', box({ left: 30, bottom: 26 }),
          e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 42, letterSpacing: '-0.03em', color: '#FFFFFF' }, 'Riverfront Arena'),
          e('div', { fontSize: 21, color: '#C6D0E4', marginTop: 6 }, 'Vesu, Surat · 8 courts · open till midnight')
        )
      ),
      e('div', { position: 'relative', height: PAGE_H, overflow: 'hidden', background: '#FFFFFF' },
        e('div', { display: 'flex', width: SITE_W * 5, transform: 'translateX(' + (-railIndex * SITE_W) + 'px)' },
          page1, page2, page3, page4, page5)
      )
    ),

    /* ---------- the tap ring: one per touch, with its own life ---------- */
    ...TAPS.map((k, i) => {
      const approach = M.enter(k.t - 0.6, k.t, 0, 1)(T);
      const leave = M.draw(k.t + 0.3, k.t + 0.75, 1, 0)(T);
      const alive = clamp(Math.min(approach, leave), 0, 1);
      if (alive <= 0.001) return null;
      const contact = clamp(M.draw(k.t, k.t + 0.45, 0, 1)(T), 0, 1);
      return ek('tap' + i, 'div', { position: 'absolute', left: k.x - 26, top: k.y - 26, width: 52, height: 52 },
        e('div', box({
          inset: 0, borderRadius: 52, border: '3px solid ' + k.c, background: k.f,
          opacity: alive * 0.95, transform: 'scale(' + (1 - contact * 0.22) + ')'
        })),
        e('div', box({
          left: -contact * 22, top: -contact * 22, width: 52 + contact * 44, height: 52 + contact * 44,
          borderRadius: 200, border: '2px solid ' + k.c, opacity: alive * (1 - contact) * 0.7
        }))
      );
    })
  );
}

window.BookingFilm = function BookingFilm() {
  const hostRef = React.useRef(null);
  React.useEffect(() => {
    const refit = () => window.dispatchEvent(new Event('resize'));
    const raf = requestAnimationFrame(refit);
    const t1 = setTimeout(refit, 120);
    const t2 = setTimeout(refit, 600);
    let ro = null;
    if (window.ResizeObserver && hostRef.current) {
      ro = new ResizeObserver(refit);
      ro.observe(hostRef.current);
      if (hostRef.current.parentElement) ro.observe(hostRef.current.parentElement);
    }
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); if (ro) ro.disconnect(); };
  }, []);
  return React.createElement('div', { ref: hostRef, style: { position: 'absolute', inset: 0, display: 'flex' } },
    React.createElement(CompositionStage, {
      scenes: window.OM_SCENES,
      playback: window.OM_PLAYBACK,
      width: 1920,
      height: 1080,
      background: DEEP
    }, React.createElement(BookingPiece, null)));
};
