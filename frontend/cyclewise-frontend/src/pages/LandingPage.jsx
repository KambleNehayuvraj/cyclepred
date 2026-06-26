import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const FONT = "'Inter', -apple-system, 'Segoe UI', sans-serif"

const THEMES = [
  {
    bg: 'linear-gradient(160deg, #0c1017 0%, #101820 100%)',
    eyebrowColor: '#2dd4bf',
    titleColor: '#eef1f4',
    accentColor: '#2dd4bf',
    dotActive: '#2dd4bf',
  },
  {
    bg: 'linear-gradient(160deg, #3b1a08 0%, #5a2408 100%)',
    eyebrowColor: '#f97316',
    titleColor: '#ffffff',
    accentColor: '#f97316',
    dotActive: '#f97316',
  },
  {
    bg: 'linear-gradient(160deg, #062a22 0%, #0a3d2e 100%)',
    eyebrowColor: '#2dd4bf',
    titleColor: '#ffffff',
    accentColor: '#2dd4bf',
    dotActive: '#2dd4bf',
  },
]

const TEAL      = '#2dd4bf'
const CORAL     = '#fb7185'
const INK       = '#eef1f4'
const MUTED     = '#8d97a3'
const TRACK     = '#2a3038'
const ICON_DARK = '#1c1408'
const AUTO_MS   = 4500

// ── Slide definitions ──────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'connect',
    eyebrow: 'Welcome to CycleWise',
    title: 'Connecting the dots.',
    accent: 'Your cycle, decoded.',
    body: 'Every phase, every symptom, mapped onto a single powerful view.',
    visual: 'donut',
  },
  {
    key: 'track',
    eyebrow: 'Beyond bleeding',
    title: 'The more you track,',
    accent: 'the more you know.',
    body: 'Each of these is worth logging — together they tell a story your period alone never could.',
    visual: 'grid',
    items: [
      { color: '#cc5847', Icon: IconPap,    label: 'PAP smear' },
      { color: '#5b7fd4', Icon: IconBreast, label: 'Breast tenderness' },
      { color: '#e08a2e', Icon: IconSalt,   label: 'Salty cravings' },
      { color: '#e08a2e', Icon: IconMood,   label: 'Excited' },
      { color: '#22a888', Icon: IconSex,    label: 'High sex drive' },
      { color: '#cc5847', Icon: IconPill,   label: 'Birth control pill' },
      { color: '#22a888', Icon: IconRun,    label: 'Running' },
      { color: '#5b7fd4', Icon: IconBloat,  label: 'Bloated' },
    ],
  },
  {
    key: 'data',
    eyebrow: 'No more guessing',
    title: "It's not in your head.",
    accent: "It's in your data.",
    body: 'Patterns you felt but could never quite prove. Now you can finally see them.',
    visual: 'stats',
  },
]

// ── Icons ──────────────────────────────────────────────────────────────────
function IconPap() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <rect x="17" y="4" width="6" height="22" rx="3" fill={ICON_DARK}/>
      <ellipse cx="20" cy="30" rx="5.5" ry="4.5" fill={ICON_DARK}/>
      <line x1="14" y1="10" x2="9" y2="15" stroke={ICON_DARK} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
function IconBreast() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <ellipse cx="13" cy="22" rx="7.5" ry="8.5" fill={ICON_DARK}/>
      <ellipse cx="27" cy="22" rx="7.5" ry="8.5" fill={ICON_DARK}/>
      <path d="M13 14 Q20 9 27 14" stroke={ICON_DARK} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}
function IconSalt() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <rect x="12" y="8" width="16" height="21" rx="4" fill={ICON_DARK}/>
      <rect x="15" y="3" width="10" height="6" rx="2" fill={ICON_DARK}/>
      <circle cx="20" cy="17" r="1.6" fill="white"/>
      <circle cx="16" cy="21" r="1.6" fill="white"/>
      <circle cx="24" cy="21" r="1.6" fill="white"/>
      <circle cx="20" cy="25" r="1.6" fill="white"/>
    </svg>
  )
}
function IconMood() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <circle cx="20" cy="20" r="13" stroke={ICON_DARK} strokeWidth="3"/>
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = Math.PI * deg / 180
        return <line key={i}
          x1={20 + 7.5*Math.cos(rad)} y1={20 + 7.5*Math.sin(rad)}
          x2={20 + 11.5*Math.cos(rad)} y2={20 + 11.5*Math.sin(rad)}
          stroke={ICON_DARK} strokeWidth="2.5" strokeLinecap="round"/>
      })}
      <circle cx="20" cy="20" r="4.5" fill={ICON_DARK}/>
    </svg>
  )
}
function IconSex() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <path d="M20 7 L22.5 14 L29 14 L23.5 18.5 L26 26 L20 21.5 L14 26 L16.5 18.5 L11 14 L17.5 14 Z" fill={ICON_DARK}/>
    </svg>
  )
}
function IconPill() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <rect x="8" y="14" width="24" height="12" rx="6" fill={ICON_DARK}/>
      <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="2"/>
    </svg>
  )
}
function IconRun() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <circle cx="23" cy="8" r="3.8" fill={ICON_DARK}/>
      <path d="M23 13 L20 21 L13 27" stroke={ICON_DARK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 21 L27 25 L31 23" stroke={ICON_DARK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 27 L10 33 M13 27 L16 33" stroke={ICON_DARK} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
function IconBloat() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
      <ellipse cx="20" cy="23" rx="13" ry="10.5" fill={ICON_DARK}/>
      <path d="M15 13 Q20 6 25 13" stroke={ICON_DARK} strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

// ── Donut (slide 1) ────────────────────────────────────────────────────────
const CycleDonut = () => {
  const cx = 130, cy = 130, ro = 100, ri = 80
  const cycleLength = 28, periodDays = 5, fertileStart = 12, fertileDays = 6, today = 23
  const toRad = (d) => ((d - 90) * Math.PI) / 180
  const pt = (dayFrac, r) => {
    const a = toRad((dayFrac / cycleLength) * 360)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const arcPath = (startDay, endDay) => {
    const a1 = pt(startDay, ro), a2 = pt(endDay, ro)
    const b1 = pt(startDay, ri), b2 = pt(endDay, ri)
    const sweep = ((endDay - startDay) / cycleLength) * 360
    const lg = sweep > 180 ? 1 : 0
    return `M${a1.x},${a1.y} A${ro},${ro} 0 ${lg} 1 ${a2.x},${a2.y} L${b2.x},${b2.y} A${ri},${ri} 0 ${lg} 0 ${b1.x},${b1.y}Z`
  }
  const todayPos = pt(today, (ro + ri) / 2)
  const daysLeft = cycleLength - today + 1
  return (
    <svg viewBox="0 0 260 260" style={{ width: '100%', maxWidth: 260, margin: '0 auto', display: 'block' }}>
      <path d={arcPath(0, cycleLength - 0.001)} fill={TRACK} opacity="0.7" />
      <path d={arcPath(0, periodDays)} fill={CORAL} style={{ animation: 'cwl-arcIn 0.6s ease-out 0.05s both' }} />
      <path d={arcPath(fertileStart, fertileStart + fertileDays)} fill={TEAL} style={{ animation: 'cwl-arcIn 0.6s ease-out 0.2s both' }} />
      <circle cx={todayPos.x} cy={todayPos.y} r="7" fill={INK} stroke="#0f1216" strokeWidth="2.5"
        style={{ opacity: 0, animation: 'cwl-fadeIn 0.4s 0.6s ease-out forwards' }} />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="12" fill={MUTED} fontFamily={FONT} letterSpacing="2">TODAY</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="32" fill={INK} fontFamily={FONT} fontWeight="700">Day {today}</text>
      <text x={cx} y={cy + 46} textAnchor="middle" fontSize="12.5" fill={MUTED} fontFamily={FONT}>{daysLeft} days to next period</text>
    </svg>
  )
}

// ── Icon grid (slide 2) ────────────────────────────────────────────────────
const IconGrid = ({ items, cols = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, width: '100%' }}>
    {items.map((it, i) => (
      <div key={it.label} style={{
        backgroundColor: it.color,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        paddingBottom: 12,
        gap: 8,
        animation: `cwl-fadeUp 0.4s ease-out ${i * 0.06}s both`,
        minHeight: 96,
      }}>
        <it.Icon />
        <span style={{
          fontSize: 11.5, fontFamily: FONT, color: 'rgba(0,0,0,0.78)',
          textAlign: 'center', lineHeight: 1.3, paddingLeft: 4, paddingRight: 4,
          fontWeight: 700, letterSpacing: 0.1,
        }}>{it.label}</span>
      </div>
    ))}
  </div>
)

// ── Slide 3 cards ──────────────────────────────────────────────────────────
const CARD_BG     = '#0e2b22'
const CARD_BORDER = 'rgba(255,255,255,0.07)'

const Card = ({ title, children, style }) => (
  <div style={{
    backgroundColor: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 16,
    padding: '12px 12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,   // ← prevents grid blowout
    ...style,
  }}>
    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: INK }}>{title}</span>
    {children}
  </div>
)

const RingStat = ({ pct, color, label, value, warn }) => {
  const r = 13, c = 2 * Math.PI * r
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      backgroundColor: warn ? 'rgba(217,119,6,0.14)' : 'rgba(34,197,150,0.10)',
      borderRadius: 10, padding: '7px 8px',
    }}>
      <svg width="30" height="30" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
        <circle cx="16" cy="16" r={r} stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform="rotate(-90 16 16)" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontFamily: FONT, fontSize: 10, color: MUTED, whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INK }}>{value}</span>
      </div>
    </div>
  )
}

const CycleStatisticsCard = () => (
  <Card title="Cycle statistics">
    <RingStat pct={0.85} color="#22c596" label="Cycle length" value="30 days" />
    <RingStat pct={0.4}  color="#e08a2e" label="Cycle variation" value="8 days" warn />
  </Card>
)

const CrampHistoryCard = () => {
  const bars   = [3, 6, 4, 8, 5, 2, 6, 3, 5, 2, 4]
  const pills  = ['Mild', 'Moderate', 'Severe', 'Excruciating']
  const active = 'Moderate'
  return (
    <Card title="Cramp history">
      {/* Pills — wrap and clip gracefully */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {pills.map(p => (
          <span key={p} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600,
            padding: '4px 8px', borderRadius: 99,
            backgroundColor: p === active ? '#5b7fd4' : 'rgba(255,255,255,0.08)',
            color: p === active ? '#fff' : 'rgba(255,255,255,0.55)',
            whiteSpace: 'nowrap',
          }}>{p}</span>
        ))}
      </div>
      {/* Bar chart — fully fluid via SVG viewBox */}
      <svg viewBox="0 0 220 60" width="100%" height="50" preserveAspectRatio="none">
        {bars.map((h, i) => (
          <rect key={i} x={i * 19 + 4} y={40 - h * 3.4} width="9" height={h * 3.4}
            rx="2" fill="#5b7fd4" opacity={0.55 + (i % 3) * 0.15} />
        ))}
        <line x1="0" y1="44" x2="220" y2="44" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {[1, 3, 5, 7, 9, 11].map((d, i) => (
          <text key={d} x={i * 38 + 8} y="56" fontSize="9" fill={MUTED} fontFamily={FONT}>{d}</text>
        ))}
      </svg>
    </Card>
  )
}

const PeriodFlowCard = () => {
  // Use % widths instead of fixed px so they scale with card width
  const rows = [
    [22, 12, 18, 26],   // day 1
    [16, 22, 18],       // day 2
    [26, 18, 12, 22],   // day 3
    [18, 12],           // day 4
    [12, 14, 12],       // day 5
  ]
  const colors = ['#7b2828', '#b33f30', '#d96456', '#ec9a8f']
  return (
    <Card title="Period flow">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((segs, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, height: 9 }}>
            {segs.map((w, si) => (
              <span key={si} style={{
                width: `${w}%`,
                backgroundColor: colors[si % colors.length],
                borderRadius: 5,
                flexShrink: 0,
              }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
        {[1, 2, 3, 4, 5].map(d => (
          <span key={d} style={{ fontFamily: FONT, fontSize: 10.5, color: MUTED }}>{d}</span>
        ))}
      </div>
    </Card>
  )
}

// Slider uses % correctly — just needs overflow clamp
const Slider = ({ label, fillStart, fillEnd, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span style={{ fontFamily: FONT, fontSize: 10, color: MUTED }}>{label}</span>
    <div style={{ position: 'relative', height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <span style={{
        position: 'absolute',
        left: `${fillStart}%`,
        width: `${Math.min(fillEnd - fillStart, 100 - fillStart)}%`,
        top: 0, bottom: 0,
        borderRadius: 99,
        backgroundColor: color,
      }} />
    </div>
  </div>
)

const TypicalCycleCard = () => (
  <Card title="Your typical cycle">
    <svg viewBox="0 0 160 56" width="100%" height="50" preserveAspectRatio="xMidYMid meet">
      <path d="M10 50 A 35 35 0 0 1 80 50" fill="#7b2828" />
      <path d="M80 50 A 35 35 0 0 1 150 50" fill="#1c8f77" />
      <circle cx="80" cy="50" r="3" fill="white" />
    </svg>
    <Slider label="Anxious"   fillStart={62} fillEnd={88} color="#e08a2e" />
    <Slider label="Happy"     fillStart={28} fillEnd={50} color="#e08a2e" />
    <Slider label="Sensitive" fillStart={70} fillEnd={92} color="#e08a2e" />
  </Card>
)

// ── DataStatsGrid — responsive: 2-col on mobile, max-width centred on desktop
const DataStatsGrid = () => (
  <div style={{
    width: '100%',
    maxWidth: 420,       // ← caps the grid on wide screens
    margin: '0 auto',
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',   // minmax(0) prevents overflow
      gap: 8,
      width: '100%',
    }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <CycleStatisticsCard />
        <PeriodFlowCard />
      </div>
      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <CrampHistoryCard />
        <TypicalCycleCard />
      </div>
    </div>
  </div>
)

// ── Progress dot ───────────────────────────────────────────────────────────
const ProgressDot = ({ active, dotColor, onClick }) => (
  <button onClick={onClick} style={{
    width: active ? 32 : 8, height: 8,
    borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden', transition: 'width 0.3s ease',
  }}>
    {active && (
      <span style={{
        display: 'block', height: '100%',
        backgroundColor: dotColor,
        animation: `cwl-fill ${AUTO_MS}ms linear forwards`,
      }} />
    )}
  </button>
)

// ── LandingPage ────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)
  const touchRef = useRef({ x: 0, active: false })

  const goTo = (i) => setSlide(Math.max(0, Math.min(SLIDES.length - 1, i)))

  useEffect(() => {
    if (slide >= SLIDES.length - 1) return
    const t = setTimeout(() => goTo(slide + 1), AUTO_MS)
    return () => clearTimeout(t)
  }, [slide])

  const onTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, active: true } }
  const onTouchEnd   = (e) => {
    if (!touchRef.current.active) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    if (dx < -40) goTo(slide + 1)
    else if (dx > 40) goTo(slide - 1)
    touchRef.current.active = false
  }

  const s  = SLIDES[slide]
  const th = THEMES[slide]

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        height: '100dvh',
        background: th.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
        fontFamily: FONT,
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: 'rgba(45,212,191,0.14)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🌸</div>
          <span style={{ color: INK, fontSize: 18, fontFamily: FONT, fontWeight: 700, letterSpacing: -0.2 }}>CycleWise</span>
        </div>
        {slide < SLIDES.length - 1 && (
          <button onClick={() => goTo(SLIDES.length - 1)}
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: FONT, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
            Skip
          </button>
        )}
      </div>

      {/* Slide content */}
      <div
        key={s.key}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          minHeight: 0,
          animation: 'cwl-fadeUp 0.35s ease-out',
          gap: 0,
          overflowY: 'auto',          // ← allows scroll if content overflows on very small screens
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <span style={{
          fontSize: 11, fontFamily: FONT, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: th.eyebrowColor,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 99, padding: '5px 14px', marginBottom: 14,
          flexShrink: 0,
        }}>{s.eyebrow}</span>

        <h1 style={{
          fontFamily: FONT, fontSize: 28, fontWeight: 800,
          color: th.titleColor, textAlign: 'center',
          lineHeight: 1.25, letterSpacing: -0.3,
          margin: 0, marginBottom: 4, flexShrink: 0,
        }}>
          {s.title}<br />
          <span style={{ color: th.accentColor }}>{s.accent}</span>
        </h1>

        <p style={{
          fontFamily: FONT, fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center', lineHeight: 1.6,
          margin: '10px 0 16px', maxWidth: 300, flexShrink: 0,
        }}>{s.body}</p>

        {/* Visual area — constrained so it never forces horizontal scroll */}
        <div style={{ width: '100%', minWidth: 0 }}>
          {s.visual === 'donut' && (
            <>
              <CycleDonut />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: CORAL, display: 'inline-block' }} />
                  <span style={{ fontSize: 12.5, color: MUTED, fontFamily: FONT }}>Period</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: TEAL, display: 'inline-block' }} />
                  <span style={{ fontSize: 12.5, color: MUTED, fontFamily: FONT }}>Fertile window</span>
                </div>
              </div>
            </>
          )}
          {s.visual === 'grid' && <IconGrid items={s.items} cols={3} />}
          {s.visual === 'stats' && <DataStatsGrid />}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding: '8px 20px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          {SLIDES.map((sl, i) => (
            <ProgressDot key={sl.key} active={i === slide} dotColor={th.dotActive} onClick={() => goTo(i)} />
          ))}
        </div>

        {slide === SLIDES.length - 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'cwl-fadeUp 0.35s ease-out' }}>
            <Link to="/register" style={{
              display: 'block', textAlign: 'center',
              backgroundColor: TEAL, color: '#061a16',
              fontFamily: FONT, fontWeight: 700, fontSize: 15.5,
              borderRadius: 99, padding: '14px 0',
              textDecoration: 'none', letterSpacing: 0.1,
            }}>
              Create account
            </Link>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: FONT, fontSize: 14,
              padding: '6px 0', textDecoration: 'none',
            }}>
              I have an account
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cwl-fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cwl-fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes cwl-arcIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes cwl-fill   { from { width:0%; } to { width:100%; } }
      `}</style>
    </div>
  )
}

export default LandingPage