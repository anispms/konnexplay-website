/* KonnexPlay · the channel manager film. One element tree, one authored clock,
   every ground dissolving in over an opaque predecessor. */
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

const eyebrow = (text, color) => e('div', { fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: color, marginBottom: 24 }, text);
const head = (text, color, size) => e('div', { fontFamily: DISP, fontWeight: 800, fontSize: size || 82, lineHeight: 1.02, letterSpacing: '-0.035em', color: color, maxWidth: '21ch', textWrap: 'balance' }, text);
const body = (text, color) => e('div', { fontFamily: BODY, fontSize: 30, lineHeight: 1.5, color: color, marginTop: 26, maxWidth: '40ch' }, text);
const PAD = 130;

const CHANNELS = ['Your booking website', 'Aggregator app', 'Booking portal', 'Front desk register'];

function ChannelPiece() {
  const { T, CUES, authoredTotal } = useComposition();
  const ground = (cue) => M.draw(cue - DISSOLVE, cue, 0, 1)(T);

  /* 1 · the clash */
  const rowIn = (i) => M.enter(0.3 + i * 0.3, 0.9 + i * 0.3, 0, 1)(T);
  const clashAt = CUES.Map - 2.1;
  const clashOn = T > clashAt;
  const shake = clashOn ? Math.sin((T - clashAt) * 26) * clamp(M.draw(clashAt, clashAt + 0.7, 7, 0)(T), 0, 7) : 0;
  const clashOpacity = M.enter(clashAt, clashAt + 0.35, 0, 1)(T);

  /* 2 · mapping */
  const mapped = Math.round(clamp(M.draw(CUES.Map + 0.5, CUES.Rates - 1.1, 0, 4)(T), 0, 4));
  const lineLen = (i) => clamp(M.draw(CUES.Map + 0.5 + i * 0.75, CUES.Map + 1.15 + i * 0.75, 0, 1)(T), 0, 1);

  /* 3 · rates */
  const BANDS = [['6 – 9 AM', '₹700', '₹800'], ['9 AM – 5 PM', '₹600', '₹700'], ['5 – 8 PM', '₹900', '₹1,100'], ['8 – 11 PM', '₹1,200', '₹1,500']];
  const bandIn = (i) => M.enter(CUES.Rates + 0.4 + i * 0.32, CUES.Rates + 1.0 + i * 0.32, 0, 1)(T);
  const pushStart = CUES.Rates + 2.4;
  const pushed = clamp(M.draw(pushStart, pushStart + 1.4, 0, 1)(T), 0, 1);
  const pushTick = (i) => (pushed > (i + 1) / 4 - 0.02 ? 1 : 0);

  /* 4 · the sync */
  const landing = M.pop(CUES.Sync + 0.4, CUES.Sync + 1.1, 0, 1)(T);
  const closeAt = (i) => CUES.Sync + 1.5 + i * 0.42;
  const closed = (i) => clamp(M.enter(closeAt(i), closeAt(i) + 0.4, 0, 1)(T), 0, 1);
  const latency = clamp(M.draw(CUES.Sync + 1.4, CUES.Sync + 3.2, 0, 0.4)(T), 0, 0.4);

  const closeFade = Math.min(ground(CUES.Live), M.draw(authoredTotal - 0.6, authoredTotal, 1, 0)(T));

  const channelRow = (name, i, extra) => ek('c' + i, 'div', Object.assign({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
    background: '#FFFFFF', color: NAVY, padding: '22px 26px', marginBottom: 14
  }, extra || {}), e('span', { fontSize: 27, fontWeight: 600 }, name));

  return e('div', { position: 'absolute', inset: 0, background: DEEP, overflow: 'hidden', fontFamily: BODY },

    /* loop-return layer: the opening ground, revealed as the film ends */
    e('div', box({ inset: 0, background: NAVY, opacity: M.draw(authoredTotal - 0.6, authoredTotal - 0.05, 0, 1)(T) })),

    /* ---------- 1 · ONE SLOT, FOUR SYSTEMS ---------- */
    React.createElement(Shot, { from: 0, to: CUES.Map + 0.6 },
      e('div', box({ inset: 0, background: NAVY }),
        e('div', box({ left: PAD, top: 250, width: 660 }),
          eyebrow('ONE SLOT, FOUR SYSTEMS', TEAL),
          head('Saturday 8 PM exists in four different places.', '#FFFFFF', 76),
          body('Your own website, the apps that list you, and the register at the counter. None of them knows about the others.', '#C6D0E4')
        ),
        e('div', box({ right: PAD, top: 215, width: 720, transform: 'translateX(' + shake + 'px)' }),
          ...CHANNELS.map((name, i) => {
            const taken = clashOn && (i === 1 || i === 2);
            const who = i === 1 ? 'Rahul M. booked 8 PM' : 'Corporate XI booked 8 PM';
            return ek('c' + i, 'div', {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
              background: '#FFFFFF', color: NAVY, padding: '22px 26px', marginBottom: 14,
              opacity: rowIn(i), transform: 'translateY(' + (1 - rowIn(i)) * 16 + 'px)',
              borderLeft: '4px solid ' + (taken ? '#B3261E' : TEAL)
            },
              e('span', { fontSize: 27, fontWeight: 600 }, name),
              e('span', { fontSize: 20, fontWeight: 700, letterSpacing: '.1em', color: taken ? '#B3261E' : '#5A6275', textAlign: 'right' },
                taken ? who : '8 PM OPEN')
            );
          }),
          e('div', {
            marginTop: 12, background: '#B3261E', color: '#FFFFFF', padding: '18px 26px',
            fontSize: 24, fontWeight: 700, letterSpacing: '.14em', display: 'inline-block',
            opacity: clashOpacity, transform: 'translateY(' + (1 - clashOpacity) * 10 + 'px)'
          }, 'SAME SLOT · SOLD TWICE')
        )
      )
    ),

    /* ---------- 2 · MAP EACH COURT ONCE ---------- */
    React.createElement(Shot, { from: CUES.Map - DISSOLVE, to: CUES.Rates + 0.6 },
      e('div', box({ inset: 0, background: PAPER, opacity: ground(CUES.Map) }),
        e('div', box({ left: PAD, top: 200, width: 620 }),
          eyebrow('SET UP ONCE', '#5A6275'),
          head('Map each court once. Never again.', NAVY, 78),
          body('Your courts on one side, every channel\'s listing on the other. Match them, and the mapping holds.', '#3D4457')
        ),
        e('div', box({ right: PAD, top: 205, width: 700 }),
          ...['Turf 1', 'Turf 2', 'Court A', 'Court B'].map((court, i) => {
            const on = i < mapped;
            return ek('m' + i, 'div', {
              display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', gap: 0, marginBottom: 18
            },
              e('div', { background: '#FFFFFF', border: '1px solid #DDE0E5', padding: '20px 22px', fontSize: 26, fontWeight: 600, color: NAVY }, court),
              e('div', { position: 'relative', height: 3, background: '#DDE0E5' },
                e('div', box({ left: 0, top: 0, height: 3, width: (lineLen(i) * 100) + '%', background: TEAL })),
                e('div', box({ left: '50%', top: -13, marginLeft: -13, width: 26, height: 26, background: on ? TEAL : '#DDE0E5', opacity: lineLen(i) }))
              ),
              e('div', { background: on ? NAVY : '#FFFFFF', border: '1px solid ' + (on ? NAVY : '#DDE0E5'), padding: '20px 22px', fontSize: 24, fontWeight: 600, color: on ? '#FFFFFF' : '#5A6275' }, on ? 'Listing linked' : 'Not linked')
            );
          }),
          e('div', { marginTop: 8, fontSize: 26, fontWeight: 700, color: '#088064', opacity: mapped === 4 ? 1 : 0.25 }, mapped + ' of 4 courts mapped')
        )
      )
    ),

    /* ---------- 3 · COURT-LEVEL RATES AND RULES ---------- */
    React.createElement(Shot, { from: CUES.Rates - DISSOLVE, to: CUES.Sync + 0.6 },
      e('div', box({ inset: 0, background: NAVY, opacity: ground(CUES.Rates) }),
        e('div', box({ left: PAD, top: 215, width: 600 }),
          eyebrow('COURT-LEVEL RATES AND RULES', TEAL),
          head('Your evening price is not your morning price.', '#FFFFFF', 72),
          body('Set time bands, weekday and weekend, once per court. Every channel gets the same truth.', '#C6D0E4')
        ),
        e('div', box({ right: PAD, top: 215, width: 700 }),
          e('div', { display: 'grid', gridTemplateColumns: '1fr 150px 150px', gap: 14, fontSize: 19, letterSpacing: '.12em', fontWeight: 700, color: '#8E9AB5', marginBottom: 16 },
            e('div', null, 'TIME BAND'), e('div', null, 'WEEKDAY'), e('div', null, 'WEEKEND')),
          ...BANDS.map((b, i) => ek('b' + i, 'div', {
            display: 'grid', gridTemplateColumns: '1fr 150px 150px', gap: 14, alignItems: 'center',
            background: '#FFFFFF', color: NAVY, padding: '18px 22px', marginBottom: 12,
            opacity: bandIn(i), transform: 'translateX(' + (1 - bandIn(i)) * 26 + 'px)'
          },
            e('div', { fontSize: 25, fontWeight: 600 }, b[0]),
            e('div', { fontSize: 25, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }, b[1]),
            e('div', { fontSize: 25, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#088064' }, b[2])
          )),
          e('div', { marginTop: 22, opacity: M.enter(pushStart - 0.3, pushStart + 0.1, 0, 1)(T) },
            e('div', { position: 'relative', height: 56, background: 'rgba(255,255,255,.12)' },
              e('div', box({ left: 0, top: 0, bottom: 0, width: (pushed * 100) + '%', background: TEAL })),
              e('div', box({ left: 24, top: 15, fontSize: 22, letterSpacing: '.14em', fontWeight: 700, color: pushed > 0.2 ? DEEP : '#FFFFFF' }), 'PUSHING TO ALL CHANNELS')
            ),
            e('div', { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' },
              ...CHANNELS.map((c, i) => ek('p' + i, 'div', {
                fontSize: 19, fontWeight: 600, color: pushTick(i) ? TEAL : '#5F6C87',
                border: '1px solid ' + (pushTick(i) ? TEAL : '#33405C'), padding: '9px 14px'
              }, (pushTick(i) ? '✓  ' : '') + c))
            )
          )
        )
      )
    ),

    /* ---------- 4 · ONE BOOKING, EVERY CHANNEL ---------- */
    React.createElement(Shot, { from: CUES.Sync - DISSOLVE, to: CUES.Live + 0.6 },
      e('div', box({ inset: 0, background: DEEP, opacity: ground(CUES.Sync) }),
        e('div', box({ left: PAD, top: 230, width: 620 }),
          eyebrow('REAL-TIME INVENTORY SYNC', TEAL),
          head('One booking. Every channel closed.', '#FFFFFF', 78),
          body('A player books 8 PM on one app. The slot shuts everywhere else before he puts his phone down.', '#C6D0E4'),
          e('div', { marginTop: 34, display: 'flex', alignItems: 'baseline', gap: 16 },
            e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 96, letterSpacing: '-0.04em', color: TEAL, lineHeight: 1 }, latency.toFixed(1) + 's'),
            e('div', { fontSize: 24, color: '#8E9AB5', maxWidth: '14ch' }, 'to close the slot on every channel')
          )
        ),
        e('div', box({ right: PAD, top: 225, width: 700 }),
          e('div', {
            background: TEAL, color: DEEP, padding: '24px 26px', marginBottom: 20,
            opacity: landing, transform: 'scale(' + (0.9 + landing * 0.1) + ')'
          },
            e('div', { fontSize: 20, letterSpacing: '.14em', fontWeight: 700 }, 'BOOKED ON THE AGGREGATOR APP'),
            e('div', { fontFamily: DISP, fontWeight: 800, fontSize: 46, letterSpacing: '-0.03em', marginTop: 8 }, 'Turf 1 · 8:00 PM · ₹1,200')
          ),
          ...CHANNELS.map((name, i) => {
            const c = closed(i);
            return ek('s' + i, 'div', {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
              background: c ? 'rgba(255,255,255,.06)' : '#FFFFFF',
              border: '1px solid ' + (c ? '#33405C' : '#FFFFFF'),
              color: c ? '#8E9AB5' : NAVY, padding: '18px 24px', marginBottom: 12
            },
              e('span', { fontSize: 25, fontWeight: 600 }, name),
              e('span', { fontSize: 19, fontWeight: 700, letterSpacing: '.12em', color: c ? TEAL : '#5A6275' }, c ? '8 PM CLOSED' : '8 PM OPEN')
            );
          })
        )
      )
    ),

    /* ---------- 5 · ONE DASHBOARD ---------- */
    React.createElement(Shot, { from: CUES.Live - DISSOLVE, to: authoredTotal },
      e('div', box({ inset: 0, background: NAVY, opacity: closeFade }),
        e('div', box({ left: PAD, right: PAD, top: 300 }),
          e('div', { fontSize: 22, letterSpacing: '.18em', fontWeight: 700, color: TEAL, marginBottom: 28, opacity: M.enter(CUES.Live - DISSOLVE, CUES.Live - 0.1, 0, 1)(T) }, 'KONNEXPLAY CHANNEL MANAGER'),
          e('div', {
            fontFamily: DISP, fontWeight: 800, fontSize: 124, lineHeight: 0.98, letterSpacing: '-0.04em', color: '#FFFFFF',
            maxWidth: '20ch', textWrap: 'balance',
            opacity: M.enter(CUES.Live - DISSOLVE, CUES.Live + 0.2, 0, 1)(T),
            transform: 'translateY(' + (1 - M.enter(CUES.Live - DISSOLVE, CUES.Live + 0.2, 0, 1)(T)) * 18 + 'px)'
          }, 'Every court, every channel, one dashboard.'),
          e('div', { display: 'flex', gap: 40, marginTop: 52, flexWrap: 'wrap', opacity: M.enter(CUES.Live + 1.2, CUES.Live + 1.8, 0, 1)(T) },
            e('div', { fontSize: 30, fontWeight: 600, color: '#C6D0E4' }, 'No double-bookings.'),
            e('div', { fontSize: 30, fontWeight: 600, color: '#C6D0E4' }, 'One rate card.'),
            e('div', { fontSize: 30, fontWeight: 600, color: TEAL }, 'One place to look.')
          ),
          e('div', { marginTop: 64, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', opacity: M.enter(CUES.Live + 1.9, CUES.Live + 2.5, 0, 1)(T) },
            e('div', { border: '1px solid ' + TEAL, color: TEAL, padding: '12px 18px', fontSize: 20, letterSpacing: '.14em', fontWeight: 700 }, 'IN DEVELOPMENT'),
            e('div', { fontSize: 26, color: '#8E9AB5' }, 'konnexplay.com')
          )
        )
      )
    )
  );
}

window.ChannelFilm = function ChannelFilm() {
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
    }, React.createElement(ChannelPiece, null)));
};
