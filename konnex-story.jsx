/* KonnexPlay — "Nobody answered the phone": one continuous 41s composition. */
const { useComposition, CompositionStage, Shot, Captions, Easing, interpolate, animate, clamp } = window;

const NAVY = '#0D1B3E';
const DEEP = '#061428';
const TEAL = '#0DC59A';
const MINT = '#E8FBF5';
const PAPER = '#FAFAF9';
const DISP = 'Outfit, system-ui, sans-serif';
const BODY = 'Inter, system-ui, sans-serif';

const MOTION = {
  enter: (start, end, from, to) => animate({ from: from, to: to, start: start, end: end, ease: Easing.easeOutCubic }),
  draw: (start, end, from, to) => animate({ from: from, to: to, start: start, end: end, ease: Easing.easeInOutQuad }),
  pop: (start, end, from, to) => animate({ from: from, to: to, start: start, end: end, ease: Easing.easeOutBack })
};

const box = (s) => Object.assign({ position: 'absolute' }, s);
const CELL_RATE = (i) => 900 + (i % 4) * 100;          // the rate printed in cell i
const GRID_N = 20;
const DISSOLVE = 0.5;

function Film() {
  const { T, CUES, authoredTotal } = useComposition();
  // a scene's ground rises to 1 just before its cue and then STAYS opaque
  // until its successor has fully covered it — so only one ground ever blends
  const ground = (cue) => MOTION.draw(cue - DISSOLVE, cue, 0, 1)(T);

  /* ---------- one camera for the whole film ---------- */
  const camScale =
    T < CUES.Register ? MOTION.draw(CUES.Night, CUES.Register, 1.08, 1)(T)
    : T < CUES.Link ? MOTION.draw(CUES.Register, CUES.Link, 1, 1.04)(T)
    : T < CUES.Fills ? 1
    : MOTION.draw(CUES.Fills, CUES.Morning, 1, 1.05)(T);
  const camY = MOTION.draw(CUES.Promise - 0.5, CUES.Promise + 0.8, 0, -10)(T);

  /* ---------- scene 1 · Saturday night, the phone ---------- */
  const kb = MOTION.draw(CUES.Night, CUES.Link, 1.12, 1.3)(T);
  const QS = [
    ['Is 8 PM free?', 120, 250],
    ['How much is the turf?', 520, 170],
    ['Can I book tomorrow?', 1080, 300],
    ['Which slot is available?', 260, 640],
    ['Can I pay now?', 840, 700],
    ['Can you confirm?', 1280, 560]
  ];

  /* ---------- scene 2 · the register ---------- */
  const regIn = MOTION.pop(CUES.Register, CUES.Register + 0.9, 140, 0)(T);
  const regOut = MOTION.draw(CUES.Link - 0.7, CUES.Link + 0.3, 0, -1400)(T);
  const regRot = MOTION.draw(CUES.Register, CUES.Link, -1.4, -3.2)(T);
  const circle = MOTION.pop(CUES.Register + 2.1, CUES.Register + 2.9, 0, 1)(T);
  const REG = [
    ['5:00 PM', 'Ankit R.', 'Turf 1'],
    ['6:00 PM', 'Corp. grp', 'Turf 2'],
    ['7:00 PM', 'Riya M.', 'Court A'],
    ['8:00 PM', 'Nirav S.', 'Turf 1'],
    ['8:00 PM', 'Hardik P.', 'Turf 1'],
    ['9:00 PM', 'Smashers', 'Court B']
  ];

  /* ---------- scene 3 · the link ---------- */
  const url = 'your-venue.konnexplay.com';
  const typed = url.slice(0, Math.round(MOTION.draw(CUES.Link - DISSOLVE, CUES.Link + 1.1, 0, url.length)(T)));
  const urlScale = MOTION.pop(CUES.Link - DISSOLVE, CUES.Link + 0.3, 0.86, 1)(T);
  const urlFade = 1;
  const chips = ['Instagram bio', 'Google listing', 'QR at the gate'];

  /* ---------- scene 4 · the player books ---------- */
  const phoneIn = MOTION.pop(CUES.Books - 0.3, CUES.Books + 0.8, 170, 0)(T);
  const phoneOut = MOTION.draw(CUES.Fills - 0.6, CUES.Fills + 0.2, 0, 220)(T);
  const SHOTS = ['assets/shot-choose-sport.jpg', 'assets/shot-pick-time.jpg', 'assets/shot-checkout.jpg'];
  // each screen SLIDES in over the previous one at full opacity — dense
  // product UI cannot be cross-dissolved, so no frame blends two screens
  const shotShift = (i) => i === 0 ? 0 : MOTION.enter(CUES.Books - 0.4 + i * 2.2, CUES.Books + 0.3 + i * 2.2, 102, 0)(T);
  const stamp = MOTION.pop(CUES.Books + 5.4, CUES.Books + 6.1, 0, 1)(T);

  /* ---------- scene 5 · the calendar fills ---------- */
  const gridIn = MOTION.enter(CUES.Fills, CUES.Fills + 0.7, 60, 0)(T);
  const gridFade = 1;
  const CELLS = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) CELLS.push([r, c]);
  const ORDER = [3, 8, 14, 1, 19, 6, 11, 17, 0, 13, 9, 4, 16, 2, 12, 18, 7, 15, 5, 10];
  const DAY_TOTAL = ORDER.reduce((a, i) => a + CELL_RATE(i), 0);
  const fillCount = Math.round(clamp(MOTION.draw(CUES.Fills, CUES.Morning - 0.8, 0, GRID_N)(T), 0, GRID_N));
  const litSet = {};
  ORDER.slice(0, fillCount).forEach(i => { litSet[i] = 1; });
  // the running total is the sum of the cells that have actually filled
  const collected = ORDER.slice(0, fillCount).reduce((a, i) => a + CELL_RATE(i), 0);

  /* ---------- scene 6 · next morning ---------- */
  const mornIn = MOTION.enter(CUES.Morning, CUES.Morning + 0.8, 40, 0)(T);
  const mornFade = ground(CUES.Morning);
  const total = Math.round(clamp(MOTION.draw(CUES.Morning - 0.2, CUES.Morning + 2.2, 0, DAY_TOTAL)(T), 0, DAY_TOTAL));

  /* ---------- scene 7 · the promise ---------- */
  const p1 = MOTION.enter(CUES.Promise + 0.2, CUES.Promise + 1.1, 40, 0)(T);
  const p2 = MOTION.enter(CUES.Promise + 0.9, CUES.Promise + 1.8, 40, 0)(T);
  const promiseFade = ground(CUES.Promise);

  /* ---------- scene 8 · close (matches the first frame's calm) ---------- */
  const closeIn = MOTION.pop(CUES.Close, CUES.Close + 0.9, 0.9, 1)(T);
  const closeFade = Math.min(ground(CUES.Close), MOTION.draw(authoredTotal - 0.7, authoredTotal, 1, 0)(T));

  const inr = (n) => '₹' + n.toLocaleString('en-IN');

  return React.createElement('div', { style: { position: 'absolute', inset: 0, background: DEEP, overflow: 'hidden', fontFamily: BODY } },

    /* camera */
    React.createElement('div', { style: { position: 'absolute', inset: 0, transform: 'scale(' + camScale + ') translateY(' + camY + 'px)', transformOrigin: '50% 50%' } },

      React.createElement('div', { style: box({ inset: 0, opacity: MOTION.draw(authoredTotal - 0.7, authoredTotal - 0.1, 0, 1)(T) }) },
        React.createElement('img', { src: 'assets/venue-turf-night-wide.jpg', alt: '', style: box({ inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)' }) }),
        React.createElement('div', { style: box({ inset: 0, background: 'linear-gradient(180deg,rgba(6,20,40,.55),rgba(6,20,40,.88))' }) })
      ),

      /* --- scene 1 --- */
      React.createElement(Shot, { from: 0, to: CUES.Link + 0.6, key: 'night' },
        React.createElement('div', { style: box({ inset: 0 }) },
          React.createElement('img', { src: 'assets/venue-turf-night-wide.jpg', alt: '', style: box({ inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(' + kb + ')' }) }),
          React.createElement('div', { style: box({ inset: 0, background: 'linear-gradient(180deg,rgba(6,20,40,.55),rgba(6,20,40,.88))' }) }),
          ...QS.map(([q, x, y], i) => {
            const t0 = CUES.Night + 0.5 + i * 0.42;
            const op = Math.min(MOTION.draw(t0, t0 + 0.35, 0, 1)(T), MOTION.draw(CUES.Register - 1.1, CUES.Register - 0.5, 1, 0)(T));
            const s = MOTION.pop(t0, t0 + 0.5, 0.82, 1)(T);
            return React.createElement('div', { key: 'q' + i, style: box({ left: x, top: y, opacity: op, transform: 'scale(' + s + ')', background: '#FFFFFF', color: NAVY, padding: '18px 24px', borderRadius: 4, fontSize: 30, fontWeight: 600, boxShadow: '0 24px 60px rgba(0,0,0,.45)' }) }, '“' + q + '”');
          })
        )
      ),

      /* --- scene 2 · register --- */
      React.createElement(Shot, { from: CUES.Register - 1, to: CUES.Link + 0.6 },
        React.createElement('div', { style: box({ left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(' + (regIn + regOut) + 'px)' }) },
          React.createElement('div', { style: { width: 900, background: '#FBF7EC', border: '1px solid #E6DEC9', boxShadow: '0 40px 90px rgba(0,0,0,.5)', transform: 'rotate(' + regRot + 'deg)', position: 'relative' } },
            React.createElement('div', { style: { padding: '28px 30px 14px', borderBottom: '1px solid #E0D6BE', fontFamily: 'Caveat, cursive', fontSize: 44, color: '#1B2A4A' } }, 'Saturday  12 / 09'),
            React.createElement('div', { style: { position: 'relative', background: 'repeating-linear-gradient(180deg,#FBF7EC 0,#FBF7EC 63px,#D9E2EC 63px,#D9E2EC 64px)' } },
              React.createElement('div', { style: box({ top: 0, bottom: 0, left: 132, width: 1, background: 'rgba(179,38,30,.35)' }) }),
              ...REG.map((r, i) => React.createElement('div', { key: 'r' + i, style: { display: 'grid', gridTemplateColumns: '132px 1fr 200px', alignItems: 'center', height: 64, padding: '0 30px', fontFamily: 'Caveat, cursive', fontSize: 34, color: (i === 3 || i === 4) ? '#B3261E' : '#1B2A4A' } },
                React.createElement('span', null, r[0]), React.createElement('span', null, r[1]), React.createElement('span', null, r[2])
              ))
            ),
            React.createElement('div', { style: { padding: '18px 30px 26px', fontFamily: 'Caveat, cursive', fontSize: 34, color: '#B3261E', opacity: circle } }, 'double booked — 8 PM, Turf 1'),
            React.createElement('div', { style: box({ left: 120, top: 275, width: 700, height: 140, border: '4px solid #B3261E', borderRadius: '48% 52% 50% 50% / 60% 40% 60% 40%', opacity: circle, transform: 'scale(' + (0.9 + circle * 0.1) + ')' }) })
          )
        )
      ),

      /* --- scene 3 · the link --- */
      React.createElement(Shot, { from: CUES.Link - 0.7, to: CUES.Books + 0.6 },
        React.createElement('div', { style: box({ inset: 0, background: PAPER, opacity: ground(CUES.Link) * urlFade, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42 }) },
          React.createElement('div', { style: { fontFamily: BODY, fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: '#5A6275' } }, 'ONE LINK, EVERYWHERE THEY LOOK FOR YOU'),
          React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 84, letterSpacing: '-0.03em', color: NAVY, transform: 'scale(' + urlScale + ')', borderBottom: '6px solid ' + TEAL, paddingBottom: 14 } },
            React.createElement('span', { style: { color: '#088064' } }, typed.slice(0, 11)), typed.slice(11)),
          React.createElement('div', { style: { display: 'flex', gap: 20 } }, ...chips.map((c, i) => {
            const op = MOTION.draw(CUES.Link + 1.8 + i * 0.3, CUES.Link + 2.2 + i * 0.3, 0, 1)(T);
            return React.createElement('div', { key: 'c' + i, style: { opacity: op, border: '2px solid ' + NAVY, color: NAVY, padding: '14px 26px', fontSize: 26, fontWeight: 600 } }, c);
          }))
        )
      ),

      /* --- scene 4 · the player books --- */
      React.createElement(Shot, { from: CUES.Books - 0.7, to: CUES.Fills + 0.6 },
        React.createElement('div', { style: box({ inset: 0, background: NAVY, opacity: ground(CUES.Books) }) },
          React.createElement('div', { style: box({ left: 130, top: 300, width: 620 }) },
            React.createElement('div', { style: { fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: TEAL, marginBottom: 26 } }, '11:14 PM'),
            React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 64, lineHeight: 1.04, letterSpacing: '-0.03em', color: '#FFFFFF' } }, 'He books it himself.'),
            React.createElement('div', { style: { fontSize: 30, lineHeight: 1.5, color: '#C6D0E4', marginTop: 26 } }, 'Picks the sport, picks the slot, pays ₹1,200. Nobody at the venue is awake.')
          ),
          React.createElement('div', { style: box({ right: 110, top: 210, width: 1000, height: 660, background: '#FFFFFF', boxShadow: '0 50px 110px rgba(0,0,0,.5)', overflow: 'hidden', transform: 'translateY(' + (phoneIn + phoneOut) + 'px)' }) },
            ...SHOTS.map((src, i) => React.createElement('img', { key: 's' + i, src: src, alt: '', style: box({ inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', background: '#FFFFFF', transform: 'translateX(' + shotShift(i) + '%)' }) })),
            React.createElement('div', { style: box({ left: 0, right: 0, bottom: 0, background: TEAL, color: DEEP, padding: '26px 28px', opacity: stamp, transform: 'translateY(' + (1 - stamp) * 40 + 'px)' }) },
              React.createElement('div', { style: { fontSize: 18, letterSpacing: '.14em', fontWeight: 700 } }, 'CONFIRMED'),
              React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 38, letterSpacing: '-0.02em', marginTop: 4 } }, '₹1,200 paid')
            )
          )
        )
      ),

      /* --- scene 5 · the calendar fills --- */
      React.createElement(Shot, { from: CUES.Fills - 0.7, to: CUES.Morning + 0.6 },
        React.createElement('div', { style: box({ inset: 0, background: PAPER, opacity: ground(CUES.Fills) * gridFade, transform: 'translateY(' + gridIn + 'px)' }) },
          React.createElement('div', { style: box({ left: 130, top: 150, right: 130 }) },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 34 } },
              React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 56, letterSpacing: '-0.03em', color: NAVY } }, 'Your calendar, filling itself'),
              React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em', color: '#088064', fontVariantNumeric: 'tabular-nums' } }, inr(collected))
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 14 } },
              ...CELLS.map(([r, c], i) => {
                const lit = litSet[i];
                return React.createElement('div', { key: 'g' + i, style: { background: lit ? TEAL : '#FFFFFF', border: '2px solid ' + (lit ? TEAL : '#DDE0E5'), height: 116, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px', transition: 'none' } },
                  React.createElement('div', { style: { fontSize: 22, fontWeight: 700, color: lit ? DEEP : '#5A6275' } }, lit ? 'Booked' : 'Open'),
                  React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: lit ? DEEP : 'transparent', fontVariantNumeric: 'tabular-nums' } }, inr(CELL_RATE(i)))
                );
              })
            ),
            React.createElement('div', { style: { marginTop: 34, fontSize: 28, color: '#3D4457' } }, 'Every slot closes on every screen at once, with the rate attached.')
          )
        )
      ),

      /* --- scene 6 · next morning --- */
      React.createElement(Shot, { from: CUES.Morning - 0.7, to: CUES.Promise + 0.6 },
        React.createElement('div', { style: box({ inset: 0, background: MINT, opacity: mornFade, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18, transform: 'translateY(' + mornIn + 'px)' }) },
          React.createElement('div', { style: { fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: '#088064' } }, 'NEXT MORNING, 7:10 AM'),
          React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 150, letterSpacing: '-0.04em', color: NAVY, fontVariantNumeric: 'tabular-nums', lineHeight: 1 } }, inr(total)),
          React.createElement('div', { style: { fontSize: 34, color: '#3D4457', marginTop: 6 } }, 'collected overnight, already in the report'),
          React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: '#088064', marginTop: 26, opacity: MOTION.draw(CUES.Morning + 2.7, CUES.Morning + 3.3, 0, 1)(T) } }, 'Nobody answered the phone.')
        )
      ),

      /* --- scene 7 · the promise --- */
      React.createElement(Shot, { from: CUES.Promise - 0.7, to: CUES.Close + 0.6 },
        React.createElement('div', { style: box({ inset: 0, background: NAVY, opacity: promiseFade, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 130 }) },
          React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 128, lineHeight: 1, letterSpacing: '-0.04em', color: '#FFFFFF', transform: 'translateY(' + p1 + 'px)' } }, 'More bookings.'),
          React.createElement('div', { style: { fontFamily: DISP, fontWeight: 800, fontSize: 128, lineHeight: 1, letterSpacing: '-0.04em', color: TEAL, transform: 'translateY(' + p2 + 'px)' } }, 'Less answering.')
        )
      ),

      /* --- scene 8 · close --- */
      React.createElement(Shot, { from: CUES.Close - 0.7, to: authoredTotal + 0.5 },
        React.createElement('div', { style: box({ inset: 0, background: DEEP, opacity: closeFade, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, transform: 'scale(' + closeIn + ')' }) },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,20px)', gridTemplateRows: 'repeat(3,20px)', gap: 5 } },
              ...[1, 0, 1, 1, 1, 0, 1, 0, 1].map((v, i) => React.createElement('div', { key: 'd' + i, style: { background: v ? TEAL : 'rgba(255,255,255,.25)', borderRadius: 6 } }))),
            React.createElement('div', { style: { fontFamily: DISP, fontWeight: 700, fontSize: 76, letterSpacing: '-0.03em', color: '#FFFFFF' } }, 'Konnex', React.createElement('span', { style: { color: TEAL } }, 'Play'))
          ),
          React.createElement('div', { style: { fontSize: 34, color: '#C6D0E4' } }, 'Sports venue management software for India'),
          React.createElement('div', { style: { marginTop: 16, background: TEAL, color: DEEP, padding: '22px 44px', fontFamily: DISP, fontWeight: 800, fontSize: 34 } }, 'Book a 20-minute demo')
        )
      )
    ),

    React.createElement(Captions, { items: [
      { at: 0.6, until: CUES.Register - DISSOLVE, text: 'Saturday night, and the phone will not stop.' },
      { at: CUES.Register + 0.6, until: CUES.Link - DISSOLVE, text: 'The register remembers nothing. Two groups have 8 PM.' },
      { at: CUES.Books + 0.4, until: CUES.Fills - DISSOLVE, text: 'Your booking website is open when you are not.' }
    ] })
  );
}

window.KonnexStory = function KonnexStory() {
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
  return React.createElement('div', { ref: hostRef, style: { position: 'absolute', inset: 0, display: 'flex' } }, React.createElement(CompositionStage, {
    width: 1920, height: 1080, bg: DEEP,
    scenes: window.OM_SCENES, playback: window.OM_PLAYBACK
  }, React.createElement(Film, null)));
};
