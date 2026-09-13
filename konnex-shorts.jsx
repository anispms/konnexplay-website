/* Two KonnexPlay shorts. Same rules as the main film: one element tree, one
   authored clock, and every ground dissolves in over an opaque predecessor. */
const { useComposition, CompositionStage, Shot, Easing, animate, clamp } = window;

const NAVY = '#0D1B3E', DEEP = '#061428', TEAL = '#0DC59A', MINT = '#E8FBF5', PAPER = '#FAFAF9';
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
const inr = (n) => '₹' + Math.max(0, Math.round(n)).toLocaleString('en-IN');

const eyebrow = (text, color) => e('div', { fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: color, marginBottom: 24 }, text);
const head = (text, color, size) => e('div', { fontFamily: DISP, fontWeight: 800, fontSize: size || 86, lineHeight: 1.02, letterSpacing: '-0.035em', color: color, maxWidth: '22ch', textWrap: 'balance' }, text);
const body = (text, color) => e('div', { fontFamily: BODY, fontSize: 30, lineHeight: 1.5, color: color, marginTop: 26, maxWidth: '40ch' }, text);
const pad = { left: 130, right: 130, top: 0, bottom: 0 };

/* ----------------------------------------------------------------- */
/* 1 · A TOURNAMENT WEEKEND                                           */
/* ----------------------------------------------------------------- */
function TournamentPiece() {
  const { T, CUES, authoredTotal } = useComposition();
  const ground = (cue) => M.draw(cue - DISSOLVE, cue, 0, 1)(T);

  const TEAMS = ['Vesu Strikers', 'Adajan XI', 'Piplod Blues', 'Katargam CC', 'Dumas Dragons', 'Rander Royals', 'Pal United', 'City Smashers'];
  const shown = Math.round(clamp(M.draw(0.3, CUES.Block - 0.8, 0, TEAMS.length)(T), 0, TEAMS.length));

  const COURTS = ['TURF 1', 'TURF 2', 'COURT A', 'COURT B'];
  const HOURS = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'];
  const blocked = Math.round(clamp(M.draw(CUES.Block + 0.3, CUES.Rate - 0.6, 0, 24)(T), 0, 24));

  const rateBand = (i) => M.enter(CUES.Rate + 0.3 + i * 0.35, CUES.Rate + 0.9 + i * 0.35, 60, 0)(T);
  const depCount = Math.round(clamp(M.draw(CUES.Deposits + 0.2, CUES.Profit - 0.7, 0, 16)(T), 0, 16));
  const DEP = 2000;
  const profit = Math.round(clamp(M.draw(CUES.Profit - 0.2, CUES.Profit + 2.2, 0, 74000)(T), 0, 74000));
  const closeFade = Math.min(ground(CUES.Profit), M.draw(authoredTotal - 0.6, authoredTotal, 1, 0)(T));

  return e('div', { position: 'absolute', inset: 0, background: DEEP, overflow: 'hidden', fontFamily: BODY },

    /* the loop-return layer: the opening frame, revealed as the film ends */
    e('div', box({ inset: 0, background: NAVY, opacity: M.draw(authoredTotal - 0.6, authoredTotal - 0.05, 0, 1)(T) })),

    /* 1 · sixteen teams want the same weekend */
    React.createElement(Shot, { from: 0, to: CUES.Block + 0.6 },
      e('div', box({ inset: 0, background: NAVY }),
        e('div', box({ left: pad.left, top: 190, width: 700 }),
          eyebrow('A TOURNAMENT WEEKEND', TEAL),
          head('Sixteen teams. One weekend. One phone.', '#FFFFFF', 78),
          body('Every captain wants a different slot, a discount, and a confirmation today.', '#C6D0E4')
        ),
        e('div', box({ right: pad.right, top: 170, width: 620 }),
          ...TEAMS.map((t, i) => {
            const on = i < shown;
            return ek('t' + i, 'div', {
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
              background: '#FFFFFF', color: NAVY, padding: '18px 22px', marginBottom: 12,
              opacity: on ? 1 : 0, transform: 'translateY(' + (on ? 0 : 14) + 'px)'
            },
              e('span', { fontSize: 26, fontWeight: 600 }, t),
              e('span', { fontSize: 20, fontWeight: 700, color: '#B3261E', letterSpacing: '.1em' }, 'CALLING')
            );
          }),
          e('div', { fontSize: 24, fontWeight: 600, color: '#8E9AB5', paddingLeft: 22, opacity: M.draw(CUES.Block - 1.4, CUES.Block - 0.9, 0, 1)(T) }, 'and eight more captains waiting')
        )
      )
    ),

    /* 2 · the whole weekend blocked */
    React.createElement(Shot, { from: CUES.Block - 0.7, to: CUES.Rate + 0.6 },
      e('div', box({ inset: 0, background: PAPER, opacity: ground(CUES.Block) }),
        e('div', box({ left: pad.left, right: pad.right, top: 150 }),
          eyebrow('STEP ONE', '#5A6275'),
          head('The whole weekend, blocked in three clicks.', NAVY, 64),
          e('div', { display: 'grid', gridTemplateColumns: '110px repeat(4,minmax(0,1fr))', gap: 12, marginTop: 44 },
            e('div', {}),
            ...COURTS.map((c, i) => ek('hc' + i, 'div', { fontSize: 18, letterSpacing: '.1em', fontWeight: 700, color: '#5A6275' }, c)),
            ...HOURS.reduce((acc, hr, ri) => {
              acc.push(ek('hr' + ri, 'div', { fontSize: 20, fontWeight: 700, color: '#5A6275', display: 'flex', alignItems: 'center' }, hr));
              COURTS.forEach((c, ci) => {
                const idx = ri * 4 + ci;
                const on = idx < blocked;
                acc.push(ek('b' + idx, 'div', {
                  background: on ? NAVY : '#FFFFFF', border: '2px solid ' + (on ? NAVY : '#DDE0E5'),
                  padding: '16px 12px', fontSize: 18, fontWeight: 700, color: on ? '#FFFFFF' : '#5A6275'
                }, on ? 'Tournament' : 'Open'));
              });
              return acc;
            }, [])
          )
        )
      )
    ),

    /* 3 · a rate for those dates only */
    React.createElement(Shot, { from: CUES.Rate - 0.7, to: CUES.Deposits + 0.6 },
      e('div', box({ inset: 0, background: MINT, opacity: ground(CUES.Rate) }),
        e('div', box({ left: pad.left, top: 170, width: 720 }),
          eyebrow('STEP TWO', '#088064'),
          head('A tournament rate that expires by itself.', NAVY, 64),
          body('Give the plan a date range. It wins over your normal price for the event, then stops.', '#3D4457')
        ),
        e('div', box({ right: pad.right, top: 200, width: 640 }),
          ...[['Weekday evening', '₹900'], ['Weekend evening', '₹1,200'], ['Tournament, 14–15 Feb', '₹1,800']].map((r, i) =>
            ek('rb' + i, 'div', {
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
              background: i === 2 ? NAVY : '#FFFFFF', color: i === 2 ? '#FFFFFF' : NAVY,
              padding: '26px 28px', marginBottom: 14, transform: 'translateY(' + rateBand(i) + 'px)'
            },
              e('span', { fontSize: 26, fontWeight: 600 }, r[0]),
              e('span', { fontFamily: DISP, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', color: i === 2 ? TEAL : NAVY }, r[1])
            )
          )
        )
      )
    ),

    /* 4 · deposits in before the weekend */
    React.createElement(Shot, { from: CUES.Deposits - 0.7, to: CUES.Profit + 0.6 },
      e('div', box({ inset: 0, background: NAVY, opacity: ground(CUES.Deposits) }),
        e('div', box({ left: pad.left, top: 200, width: 700 }),
          eyebrow('STEP THREE', TEAL),
          head('Deposits in before a single ball is bowled.', '#FFFFFF', 64),
          body('₹2,000 a team at registration. A team that drops out does not cost you the slot.', '#C6D0E4')
        ),
        e('div', box({ right: pad.right, top: 300, width: 620, background: '#FFFFFF', color: NAVY, padding: '40px 44px' }),
          e('div', { fontSize: 20, letterSpacing: '.14em', fontWeight: 700, color: '#5A6275' }, 'DEPOSITS COLLECTED'),
          e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 108, letterSpacing: '-0.04em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }, inr(depCount * DEP)),
          e('div', { fontSize: 26, color: '#3D4457', marginTop: 10 }, depCount + ' of 16 teams paid online')
        )
      )
    ),

    /* 5 · what the weekend made */
    React.createElement(Shot, { from: CUES.Profit - 0.7, to: authoredTotal + 0.3 },
      e('div', box({ inset: 0, background: PAPER, opacity: closeFade, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }),
        eyebrow('AFTER THE WEEKEND', '#5A6275'),
        e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 160, letterSpacing: '-0.045em', color: NAVY, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }, inr(profit)),
        e('div', { fontSize: 32, color: '#3D4457', marginTop: 18 }, 'collected across the tournament, filtered to those two dates'),
        e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: '#088064', marginTop: 34, opacity: M.draw(CUES.Profit + 2.4, CUES.Profit + 3, 0, 1)(T) }, 'And the phone stayed quiet.')
      )
    )
  );
}

/* ----------------------------------------------------------------- */
/* 2 · RATES IN THREE CLICKS                                          */
/* ----------------------------------------------------------------- */
function RatesPiece() {
  const { T, CUES, authoredTotal } = useComposition();
  const ground = (cue) => M.draw(cue - DISSOLVE, cue, 0, 1)(T);

  const BANDS = [['Morning · 6 to 11 AM', '₹700', '₹900'], ['Afternoon · 11 AM to 5 PM', '₹600', '₹800'], ['Floodlit · 5 to 11 PM', '₹1,000', '₹1,300']];
  const bandIn = (i) => M.pop(CUES.Bands + 0.3 + i * 0.4, CUES.Bands + 1 + i * 0.4, 0.9, 1)(T);

  const COURTS = ['Turf 1', 'Turf 2', 'Court A', 'Court B', 'Court C', 'Court D'];
  const picked = Math.round(clamp(M.draw(CUES.Apply + 0.3, CUES.Live - 0.7, 0, COURTS.length)(T), 0, COURTS.length));

  const SLOTS = ['6 PM', '7 PM', '8 PM', '9 PM', '10 PM'];
  const repriced = Math.round(clamp(M.draw(CUES.Live + 0.2, CUES.Live + 2.2, 0, SLOTS.length)(T), 0, SLOTS.length));
  const closeFade = Math.min(ground(CUES.Live), M.draw(authoredTotal - 0.6, authoredTotal, 1, 0)(T));

  return e('div', { position: 'absolute', inset: 0, background: DEEP, overflow: 'hidden', fontFamily: BODY },

    e('div', box({ inset: 0, background: NAVY, opacity: M.draw(authoredTotal - 0.6, authoredTotal - 0.05, 0, 1)(T) })),

    /* 1 · the festival week problem */
    React.createElement(Shot, { from: 0, to: CUES.Bands + 0.6 },
      e('div', box({ inset: 0, background: NAVY, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: pad.left }),
        eyebrow('PRICING CONTROL', TEAL),
        head('Diwali week. New prices. 144 slots.', '#FFFFFF', 92),
        body('On a register that is an evening of work, and one slot you forget to change is money gone.', '#C6D0E4')
      )
    ),

    /* 2 · bands set once */
    React.createElement(Shot, { from: CUES.Bands - 0.7, to: CUES.Apply + 0.6 },
      e('div', box({ inset: 0, background: PAPER, opacity: ground(CUES.Bands) }),
        e('div', box({ left: pad.left, top: 190, width: 660 }),
          eyebrow('CLICK ONE', '#5A6275'),
          head('Set the day once, as bands.', NAVY, 70),
          body('Morning, afternoon and floodlit evening, each with a weekday and a weekend price.', '#3D4457')
        ),
        e('div', box({ right: pad.right, top: 210, width: 700 }),
          e('div', { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 130px 130px', gap: 16, fontSize: 18, letterSpacing: '.1em', fontWeight: 700, color: '#5A6275', marginBottom: 14 },
            e('div', {}, 'TIME BAND'), e('div', {}, 'WEEKDAY'), e('div', {}, 'WEEKEND')),
          ...BANDS.map((b, i) => ek('bd' + i, 'div', {
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 130px 130px', gap: 16, alignItems: 'center',
            background: '#FFFFFF', border: '2px solid #DDE0E5', padding: '22px 24px', marginBottom: 12,
            transform: 'scale(' + bandIn(i) + ')'
          },
            e('span', { fontSize: 24, fontWeight: 600, color: NAVY }, b[0]),
            e('span', { fontFamily: DISP, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: NAVY }, b[1]),
            e('span', { fontFamily: DISP, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#088064' }, b[2])
          ))
        )
      )
    ),

    /* 3 · applied to every court at once */
    React.createElement(Shot, { from: CUES.Apply - 0.7, to: CUES.Live + 0.6 },
      e('div', box({ inset: 0, background: MINT, opacity: ground(CUES.Apply) }),
        e('div', box({ left: pad.left, top: 200, width: 660 }),
          eyebrow('CLICK TWO', '#088064'),
          head('Apply it to every court at once.', NAVY, 70),
          body('Select the courts, or a whole category, and the plan lands on all of them together.', '#3D4457')
        ),
        e('div', box({ right: pad.right, top: 230, width: 620 }),
          ...COURTS.map((c, i) => {
            const on = i < picked;
            return ek('ct' + i, 'div', {
              display: 'flex', alignItems: 'center', gap: 18,
              background: '#FFFFFF', border: '2px solid ' + (on ? TEAL : '#DDE0E5'),
              padding: '20px 24px', marginBottom: 12
            },
              e('span', { width: 26, height: 26, background: on ? TEAL : '#FFFFFF', border: '2px solid ' + (on ? TEAL : '#C9CBD1'), flexShrink: 0 }),
              e('span', { fontSize: 26, fontWeight: 600, color: NAVY }, c),
              e('span', { marginLeft: 'auto', fontSize: 20, fontWeight: 700, letterSpacing: '.1em', color: on ? '#088064' : '#5A6275' }, on ? 'UPDATED' : '—')
            );
          })
        )
      )
    ),

    /* 4 · every slot reprices itself */
    React.createElement(Shot, { from: CUES.Live - 0.7, to: authoredTotal + 0.3 },
      e('div', box({ inset: 0, background: NAVY, opacity: closeFade }),
        e('div', box({ left: pad.left, top: 170, width: 700 }),
          eyebrow('CLICK THREE', TEAL),
          head('Every slot reprices itself.', '#FFFFFF', 70),
          body('Players see the new price the moment you save it. Nothing to remember, nothing missed.', '#C6D0E4'),
          e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: TEAL, marginTop: 40, opacity: M.draw(CUES.Live + 2.4, CUES.Live + 3, 0, 1)(T) }, 'Three clicks, not an evening.')
        ),
        e('div', box({ right: pad.right, top: 240, width: 620 }),
          ...SLOTS.map((s, i) => {
            const on = i < repriced;
            return ek('sl' + i, 'div', {
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
              background: on ? TEAL : '#FFFFFF', color: on ? DEEP : NAVY,
              padding: '24px 28px', marginBottom: 12
            },
              e('span', { fontFamily: DISP, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }, s),
              e('span', { fontSize: 24, fontWeight: 600 }, on ? 'Diwali rate' : 'Standard'),
              e('span', { fontFamily: DISP, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }, on ? '₹1,800' : '₹1,300')
            );
          })
        )
      )
    )
  );
}

window.TournamentFilm = function TournamentFilm() {
  return React.createElement(ShortHost, { piece: TournamentPiece });
};
window.RatesFilm = function RatesFilm() {
  return React.createElement(ShortHost, { piece: RatesPiece });
};

function ShortHost(props) {
  const hostRef = React.useRef(null);
  React.useEffect(() => {
    const refit = () => window.dispatchEvent(new Event('resize'));
    const raf = requestAnimationFrame(refit);
    const t1 = setTimeout(refit, 120), t2 = setTimeout(refit, 600);
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
      width: 1920, height: 1080, bg: DEEP,
      scenes: window.OM_SCENES, playback: window.OM_PLAYBACK
    }, React.createElement(props.piece, null))
  );
}
