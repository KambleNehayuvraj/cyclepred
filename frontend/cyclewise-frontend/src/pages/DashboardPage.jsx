import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../api/services'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/common/Toast.jsx'
import { PageLoader } from '../components/common/Spinner.jsx'

// ── Design tokens — matches PCOSResultPage / LandingPage ──────────────────
const FONT    = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const TEAL    = '#2dd4bf'
const CORAL   = '#fb7185'
const ORANGE  = '#f97316'
const PURPLE  = '#c084fc'
const INK     = '#eef1f4'
const MUTED   = '#8d97a3'
const BORDER  = 'rgba(255,255,255,0.09)'
const CARD_BG = 'rgba(255,255,255,0.04)'
const PAGE_BG = 'linear-gradient(160deg, #0c1017 0%, #101820 100%)'

// ── Phase config ──────────────────────────────────────────────────────────
const PHASES = {
  menstrual:  { label: 'Menstrual',  emoji: '🌑', color: CORAL,   glow: 'rgba(251,113,133,0.18)',  days: '1–5',   energy: 'Rest & restore',   pageBg: 'linear-gradient(160deg, #0c1017 0%, #1a0810 100%)' },
  follicular: { label: 'Follicular', emoji: '🌒', color: ORANGE,  glow: 'rgba(249,115,22,0.16)',   days: '6–13',  energy: 'Build & grow',     pageBg: 'linear-gradient(160deg, #0c1017 0%, #1a0e00 100%)' },
  ovulation:  { label: 'Ovulation',  emoji: '🌕', color: TEAL,    glow: 'rgba(45,212,191,0.18)',   days: '14–16', energy: 'Peak power',        pageBg: 'linear-gradient(160deg, #0c1017 0%, #062a22 100%)' },
  luteal:     { label: 'Luteal',     emoji: '🌖', color: PURPLE,  glow: 'rgba(192,132,252,0.16)',  days: '17–28', energy: 'Wind down',         pageBg: 'linear-gradient(160deg, #0c1017 0%, #140d1f 100%)' },
}

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening' }

// ── Cycle Wheel SVG ───────────────────────────────────────────────────────
const CycleWheel = ({ phase, day, length = 28 }) => {
  const cfg = PHASES[phase] || PHASES.follicular
  const cx = 150, cy = 150, ro = 110, ri = 62
  const segs = [
    { phase: 'menstrual',  days: 5  },
    { phase: 'follicular', days: 8  },
    { phase: 'ovulation',  days: 3  },
    { phase: 'luteal',     days: 12 },
  ]
  const total = segs.reduce((a, b) => a + b.days, 0)
  const toRad = (d) => (d * Math.PI) / 180
  const pt = (a, r) => ({ x: cx + r * Math.cos(toRad(a)), y: cy + r * Math.sin(toRad(a)) })
  const arc = (sa, ea, ro, ri) => {
    const lg = ea - sa > 180 ? 1 : 0
    const p1 = pt(sa, ro), p2 = pt(ea, ro), p3 = pt(ea, ri), p4 = pt(sa, ri)
    return `M${p1.x},${p1.y} A${ro},${ro} 0 ${lg} 1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${ri},${ri} 0 ${lg} 0 ${p4.x},${p4.y}Z`
  }

  let angle = -90
  const built = segs.map((s) => {
    const sweep = (s.days / total) * 360
    const result = { ...s, sa: angle, ea: angle + sweep }
    angle += sweep
    return result
  })

  const dayAngle = -90 + (day / length) * 360
  const marker = pt(dayAngle, ro + 16)

  return (
    <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 280, margin: '0 auto', display: 'block' }}>
      <defs>
        <filter id="db-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="db-centerGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(14,20,30,0.95)"/>
          <stop offset="100%" stopColor="rgba(10,14,20,0.98)"/>
        </radialGradient>
      </defs>

      {/* Outer dashed ring */}
      <circle cx={cx} cy={cy} r={ro + 26} fill="none" stroke={BORDER} strokeWidth="1" strokeDasharray="3 5" opacity="0.7"/>

      {/* Segments */}
      {built.map((s) => {
        const active = s.phase === phase
        const mid = (s.sa + s.ea) / 2
        const ep = pt(mid, (ro + ri) / 2)
        const segColor = PHASES[s.phase].color
        return (
          <g key={s.phase}>
            <path
              d={arc(s.sa, s.ea, ro, ri)}
              fill={active ? segColor : segColor + '22'}
              stroke="rgba(12,16,23,0.8)"
              strokeWidth="2.5"
              style={{ filter: active ? 'url(#db-glow)' : 'none', transition: 'fill 0.5s' }}
            />
            <text x={ep.x} y={ep.y + 5} textAnchor="middle" fontSize={active ? 17 : 13}
              style={{ transition: 'font-size 0.3s' }}>
              {PHASES[s.phase].emoji}
            </text>
          </g>
        )
      })}

      {/* Phase arc labels */}
      {built.map((s) => {
        const mid = (s.sa + s.ea) / 2
        const lp = pt(mid, ro + 22)
        const segColor = PHASES[s.phase].color
        return (
          <text key={s.phase + '-lbl'} x={lp.x} y={lp.y + 3} textAnchor="middle"
            fontSize="7.5" fill={segColor} fontWeight="700" letterSpacing="0.3"
            fontFamily={FONT} opacity={s.phase === phase ? 1 : 0.35}>
            {PHASES[s.phase].label.toUpperCase()}
          </text>
        )
      })}

      {/* Inner fill */}
      <circle cx={cx} cy={cy} r={ri - 2} fill="url(#db-centerGrad)" stroke={BORDER} strokeWidth="1"/>

      {/* Center content */}
      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily={FONT} letterSpacing="1.5">
        CYCLE DAY
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="36" fontWeight="800"
        fill={cfg.color} fontFamily={FONT} filter="url(#db-glow)">
        {day}
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily={FONT}>
        {cfg.label} Phase
      </text>

      {/* Today marker */}
      <line x1={cx} y1={cy} x2={marker.x} y2={marker.y} stroke={cfg.color} strokeWidth="1.5" opacity="0.25"/>
      <circle cx={marker.x} cy={marker.y} r="8" fill={cfg.color} stroke="rgba(12,16,23,0.9)" strokeWidth="3" filter="url(#db-glow)"/>
      <text x={marker.x} y={marker.y + 4} textAnchor="middle" fontSize="8" fill="#0c1017" fontWeight="800">{day}</text>
    </svg>
  )
}

// ── Hormone Bars ──────────────────────────────────────────────────────────
const HormoneBars = ({ phase }) => {
  const data = {
    menstrual:  [15,  5,  20, 30],
    follicular: [65,  10, 35, 55],
    ovulation:  [90,  20, 100, 70],
    luteal:     [55,  85, 15, 20],
  }[phase] || [50, 50, 50, 50]

  const bars = [
    { label: 'Estrogen',     color: CORAL,  v: data[0] },
    { label: 'Progesterone', color: PURPLE, v: data[1] },
    { label: 'LH',           color: ORANGE, v: data[2] },
    { label: 'FSH',          color: TEAL,   v: data[3] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span style={{
        fontSize: 11, fontFamily: FONT, fontWeight: 700,
        color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>Hormones this phase</span>
      {bars.map((b) => (
        <div key={b.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 12.5, color: INK, opacity: 0.8 }}>{b.label}</span>
            <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{b.v}%</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${b.v}%`,
              backgroundColor: b.color,
              transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: `0 0 8px ${b.color}60`,
            }}/>
          </div>
        </div>
      ))}
      <p style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(141,151,163,0.45)', fontStyle: 'italic', margin: 0 }}>
        Relative levels · educational reference only
      </p>
    </div>
  )
}

// ── Cycle Calendar ────────────────────────────────────────────────────────
const CycleCalendar = ({ cycleDay = 1, cycleLength = 28 }) => {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(null)

  const phaseOf = (cd) => {
    if (cd <= 5)  return 'menstrual'
    if (cd <= 13) return 'follicular'
    if (cd <= 16) return 'ovulation'
    return 'luteal'
  }

  const getCycleDay = (date) => {
    const diffDays = Math.round((date - today) / 86400000)
    return ((cycleDay - 1 + diffDays) % cycleLength + cycleLength) % cycleLength + 1
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prev = () => setViewDate(new Date(year, month - 1, 1))
  const next = () => setViewDate(new Date(year, month + 1, 1))

  const phaseBg   = { menstrual: 'rgba(251,113,133,0.1)', follicular: 'rgba(249,115,22,0.1)', ovulation: 'rgba(45,212,191,0.1)', luteal: 'rgba(192,132,252,0.1)' }
  const phaseText = { menstrual: CORAL, follicular: ORANGE, ovulation: TEAL, luteal: PURPLE }
  const phaseDesc = {
    menstrual:  'Rest & restore · Days 1–5',
    follicular: 'Build & grow · Days 6–13',
    ovulation:  'Peak power · Days 14–16',
    luteal:     'Wind down · Days 17–28',
  }

  const emptyCells = Array.from({ length: firstDayOfWeek })
  const dayCells   = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 22, padding: '20px 20px 22px',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: -0.2 }}>
            Cycle Calendar
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 11, color: MUTED, margin: '3px 0 0' }}>Phase dates for your cycle</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prev} style={{
            width: 30, height: 30, borderRadius: 9, border: `1px solid ${BORDER}`,
            background: CARD_BG, color: MUTED, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}
          >‹</button>
          <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: INK, minWidth: 130, textAlign: 'center' }}>
            {monthLabel}
          </span>
          <button onClick={next} style={{
            width: 30, height: 30, borderRadius: 9, border: `1px solid ${BORDER}`,
            background: CARD_BG, color: MUTED, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED }}
          >›</button>
        </div>
      </div>

      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {dayNames.map((d) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: MUTED, fontFamily: FONT, letterSpacing: '0.5px',
            padding: '4px 0', textTransform: 'uppercase',
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {emptyCells.map((_, i) => <div key={`e-${i}`} />)}
        {dayCells.map((d) => {
          const date = new Date(year, month, d)
          const isToday = date.toDateString() === today.toDateString()
          const cd = getCycleDay(date)
          const ph = phaseOf(cd)
          const isSelected = selected?.d === d && selected?.month === month && selected?.year === year
          const col = phaseText[ph]

          return (
            <div
              key={d}
              onClick={() => setSelected(isSelected ? null : { d, month, year, cd, phase: ph, date })}
              style={{
                aspectRatio: '1',
                borderRadius: 9,
                background: phaseBg[ph],
                border: isToday
                  ? `1.5px solid ${col}`
                  : isSelected
                    ? `1.5px solid ${col}55`
                    : '1px solid transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'transform 0.1s, background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{
                fontSize: 12, fontWeight: isToday ? 800 : 400,
                color: col, lineHeight: 1, fontFamily: FONT,
              }}>{d}</span>
              <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: col, marginTop: 3, opacity: 0.7 }} />
            </div>
          )
        })}
      </div>

      {/* Selected day info */}
      {selected && (
        <div style={{
          marginTop: 14, borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: phaseBg[selected.phase],
          border: `1px solid ${phaseText[selected.phase]}25`,
          animation: 'db-fadeUp 0.2s ease-out',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: CARD_BG, border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {PHASES[selected.phase].emoji}
          </div>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: phaseText[selected.phase], margin: 0 }}>
              {selected.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {selected.d === today.getDate() && selected.month === today.getMonth() ? ' · Today' : ''}
            </p>
            <p style={{ fontFamily: FONT, fontSize: 11, color: MUTED, margin: '3px 0 0' }}>
              Cycle day {selected.cd} · {phaseDesc[selected.phase]}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, paddingTop: 14,
        borderTop: `1px solid ${BORDER}`,
      }}>
        {Object.entries(PHASES).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: v.color }} />
            <span style={{ fontFamily: FONT, fontSize: 11, color: MUTED }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    borderRadius: 18, padding: '16px 16px 14px',
    background: `${color}0d`,
    border: `1px solid ${color}28`,
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <span style={{
      fontFamily: FONT, fontSize: 10, fontWeight: 700,
      color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>{label}</span>
    <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>
      {value}
    </span>
    {sub && <span style={{ fontFamily: FONT, fontSize: 11.5, color: MUTED }}>{sub}</span>}
  </div>
)

// ── PCOS Screening CTA ────────────────────────────────────────────────────
const PCOSCta = ({ navigate }) => (
  <button
    onClick={() => navigate('/pcos')}
    style={{
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(192,132,252,0.07)',
      border: '1.5px solid rgba(192,132,252,0.25)',
      borderRadius: 18, padding: '18px 20px',
      cursor: 'pointer', transition: 'all 0.15s', fontFamily: FONT,
      animation: 'db-fadeUp 0.5s ease-out 0.2s both',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.13)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: 'rgba(192,132,252,0.14)', border: '1px solid rgba(192,132,252,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>🧬</div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: PURPLE, margin: 0, letterSpacing: -0.2 }}>
          PCOS Screening
        </p>
        <p style={{ fontSize: 12, color: MUTED, margin: '3px 0 0' }}>
          Stage A · AI analysis of your health profile
        </p>
      </div>
    </div>
    <span style={{ fontSize: 18, color: PURPLE, opacity: 0.7 }}>→</span>
  </button>
)

// ── DashboardPage ─────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userAPI.getProfile()
      .then((r) => setProfile(r.data))
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const cycle = profile?.cycle_info
  const phase = cycle?.cycle_phase || 'follicular'
  const cfg   = PHASES[phase]

  return (
    <div style={{
      minHeight: '100dvh',
      background: cfg.pageBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 56px', fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.6s ease',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -160, right: -120,
        width: 560, height: 560,
        background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s ease',
      }}/>
      <div style={{
        position: 'fixed', bottom: -140, left: -120,
        width: 480, height: 480,
        background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s ease',
      }}/>

      {/* Sticky nav */}
      <nav style={{
        width: '100%', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,16,23,0.75)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🌸</div>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>
            CycleWise
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>
            Hey, <span style={{ color: INK, fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
          </span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{
              fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
              color: MUTED, background: CARD_BG,
              border: `1px solid ${BORDER}`, borderRadius: 99,
              padding: '6px 14px', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = CORAL; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 900, padding: '28px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 26, animation: 'db-fadeUp 0.4s ease-out' }}>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, margin: '0 0 6px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: INK, margin: '0 0 5px', letterSpacing: -0.5 }}>
            Good {greeting()}, <span style={{ color: cfg.color }}>{user?.name?.split(' ')[0]}</span> {cfg.emoji}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99,
              background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`,
            }}>
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                {cfg.label} Phase
              </span>
            </div>
            <span style={{ fontFamily: FONT, fontSize: 12.5, color: MUTED }}>
              {cfg.energy} · Day {cycle?.current_cycle_day || '?'}
            </span>
          </div>
        </div>

        {/* Main grid: wheel + stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14, marginBottom: 14,
          animation: 'db-fadeUp 0.4s ease-out 0.05s both',
        }}>

          {/* Cycle Wheel card */}
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 22, padding: '20px 20px 22px',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: -0.2 }}>
                  Your Cycle
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 11, color: MUTED, margin: '3px 0 0' }}>Interactive phase wheel</p>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 11px', borderRadius: 99,
                background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`,
                fontFamily: FONT, fontSize: 11.5, fontWeight: 700, color: cfg.color,
              }}>
                {cfg.emoji} {cfg.label}
              </div>
            </div>
            <CycleWheel
              phase={phase}
              day={cycle?.current_cycle_day || 1}
              length={profile?.health_data?.avg_cycle_length || 28}
            />
          </div>

          {/* Right: stats + hormones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard
                label="Next Period"
                value={fmt(cycle?.next_period_date)}
                sub={`in ${cycle?.days_until_next_period || '?'} days`}
                color={CORAL}
              />
              <StatCard
                label="Cycle Day"
                value={`Day ${cycle?.current_cycle_day || '?'}`}
                sub={cfg.label}
                color={cfg.color}
              />
              <StatCard
                label="Ovulation"
                value={fmt(cycle?.ovulation_date)}
                sub="estimated"
                color={TEAL}
              />
              <StatCard
                label="Fertile Window"
                value={cycle?.is_fertile_window ? '🟢 Now' : '○ Soon'}
                sub={`${fmt(cycle?.ovulation_window_start)}–${fmt(cycle?.ovulation_window_end)}`}
                color={TEAL}
              />
            </div>

            {/* Hormone bars */}
            <div style={{
              background: CARD_BG, border: `1px solid ${BORDER}`,
              borderRadius: 22, padding: '20px',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              flex: 1,
            }}>
              <HormoneBars phase={phase} />
            </div>
          </div>
        </div>

        {/* Cycle Calendar */}
        <div style={{ marginBottom: 14, animation: 'db-fadeUp 0.4s ease-out 0.1s both' }}>
          <CycleCalendar
            cycleDay={cycle?.current_cycle_day || 1}
            cycleLength={profile?.health_data?.avg_cycle_length || 28}
          />
        </div>

        {/* PCOS CTA */}
        <PCOSCta navigate={navigate} />

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontFamily: FONT,
          fontSize: 11.5, color: 'rgba(141,151,163,0.35)',
          marginTop: 28, lineHeight: 1.5,
        }}>
          CycleWise · Cycle insights & PCOS screening
        </p>
      </div>

      <style>{`
        @keyframes db-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default DashboardPage