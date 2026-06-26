import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const FONT   = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const TEAL   = '#2dd4bf'
const INK    = '#eef1f4'
const MUTED  = '#8d97a3'
const BORDER = 'rgba(255,255,255,0.09)'
const CARD   = 'rgba(255,255,255,0.04)'

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const SLOTS = ['breakfast','lunch','snack','dinner']
const SLOT_LABELS = { breakfast: 'Morning', lunch: 'Midday', snack: 'Afternoon', dinner: 'Evening' }

const SLOT_ICONS  = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' }
const TRACK_META  = {
  diet:          { icon: '🥗', label: 'Diet Plan',           accent: '#2dd4bf' },
  exercise_yoga: { icon: '🧘', label: 'Exercise & Yoga',     accent: '#a78bfa' },
  mood:          { icon: '😊', label: 'Mood & Mindfulness',  accent: '#f9a8d4' },
}

const WATCH_SYMPTOMS = [
  'Periods suddenly becoming irregular or stopping',
  'Unexplained weight gain, especially around the abdomen',
  'New or worsening acne, hair thinning, or facial hair growth',
  'Persistent fatigue or mood changes',
]

// ── Skeleton loader card ──────────────────────────────────────────────────
const Skeleton = ({ h = 16, w = '100%', radius = 8 }) => (
  <div style={{
    height: h, width: w, borderRadius: radius,
    background: 'rgba(255,255,255,0.06)',
    animation: 'pulse 1.6s ease-in-out infinite',
  }}/>
)

// ── Category badge ────────────────────────────────────────────────────────
const Badge = ({ label, color, confidence }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 99, marginRight: 6, marginBottom: 6,
    background: `${color}18`, border: `1px solid ${color}40`,
    fontSize: 11, fontWeight: 700, color, letterSpacing: '0.04em',
  }}>
    {label}
    <span style={{ opacity: 0.6, fontWeight: 500 }}>{Math.round(confidence * 100)}%</span>
  </span>
)

// ── Day pill selector ─────────────────────────────────────────────────────
const DayPills = ({ active, onChange }) => (
  <div style={{
    display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
    scrollbarWidth: 'none', WebkitScrollbarWidth: 'none',
  }}>
    {DAYS.map(d => (
      <button
        key={d}
        onClick={() => onChange(d)}
        style={{
          flexShrink: 0, padding: '5px 12px', borderRadius: 99,
          border: active === d ? `1px solid ${TEAL}` : `1px solid ${BORDER}`,
          background: active === d ? 'rgba(45,212,191,0.12)' : CARD,
          color: active === d ? TEAL : MUTED,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {d.slice(0, 3)}
      </button>
    ))}
  </div>
)

// ── Single slot row ───────────────────────────────────────────────────────
const SlotRow = ({ slot, entry, accent }) => (
  <div style={{
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '11px 0',
    borderBottom: `1px solid ${BORDER}`,
  }}>
    <div style={{
      flexShrink: 0, width: 36, height: 36, borderRadius: 10,
      background: `${accent}18`, border: `1px solid ${accent}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
    }}>
      {SLOT_ICONS[slot]}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {SLOT_LABELS[slot]}
      </p>
      <p style={{ fontSize: 13.5, color: INK, margin: 0, lineHeight: 1.45 }}>
        {entry.item}
      </p>
    </div>
    <div style={{
      flexShrink: 0, width: 8, height: 8, borderRadius: '50%',
      background: entry.color, marginTop: 6,
    }}/>
  </div>
)

// ── Track card ────────────────────────────────────────────────────────────
const TrackCard = ({ trackKey, badges, grid }) => {
  const [day, setDay] = useState('Monday')
  const meta   = TRACK_META[trackKey]
  const dayRow = grid.find(r => r.day === day) || grid[0]

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 20, padding: '18px 18px 6px', marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${meta.accent}18`, border: `1px solid ${meta.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {meta.icon}
        </div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: INK, margin: 0 }}>{meta.label}</p>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Personalised for you</p>
        </div>
      </div>

      {/* Active category badges */}
      <div style={{ marginBottom: 12 }}>
        {badges.map((b, i) => <Badge key={i} {...b} />)}
      </div>

      {/* Day selector */}
      <div style={{ marginBottom: 10 }}>
        <DayPills active={day} onChange={setDay} />
      </div>

      {/* Slots for selected day */}
      <div>
        {SLOTS.map((slot, i) => (
          <div key={slot} style={{ borderBottom: i < SLOTS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <SlotRow slot={slot} entry={dayRow[slot]} accent={meta.accent} />
          </div>
        ))}
      </div>

      <div style={{ height: 12 }}/>
    </div>
  )
}

// ── Loading skeleton for a track ──────────────────────────────────────────
const TrackSkeleton = () => (
  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
      <Skeleton h={36} w={36} radius={10} />
      <div style={{ flex: 1 }}><Skeleton h={13} w="60%" radius={6} /></div>
    </div>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Skeleton h={36} w={36} radius={10} />
        <div style={{ flex: 1 }}>
          <Skeleton h={10} w="30%" radius={4} />
          <div style={{ height: 6 }}/>
          <Skeleton h={13} w="85%" radius={4} />
        </div>
      </div>
    ))}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────
const LowRiskPage = () => {
  const navigate = useNavigate()

  const [plan,    setPlan]    = useState(null)   // API response
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('cw_token')
        const res   = await fetch(`${API_BASE}/predict/weekly-plan`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }
        setPlan(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0c1017 0%, #062a22 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 56px', fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -140, right: -120, width: 540, height: 540,
        background: 'radial-gradient(circle, rgba(45,212,191,0.13) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div style={{
        position: 'fixed', bottom: -100, left: -80, width: 420, height: 420,
        background: 'radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Nav */}
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
          <span style={{ fontSize: 15, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>CycleWise</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            fontSize: 13, fontWeight: 600, color: MUTED,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = INK }}
          onMouseLeave={e => { e.currentTarget.style.color = MUTED }}
        >
          ← Back to Results
        </button>
      </nav>

      <div style={{ width: '100%', maxWidth: 480, padding: '32px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{
          background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.25)',
          borderRadius: 24, padding: '32px 24px 28px',
          textAlign: 'center', marginBottom: 20,
          animation: 'lr-fadeUp 0.45s ease-out',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
            background: 'rgba(45,212,191,0.12)', border: '2px solid rgba(45,212,191,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
          }}>✅</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 14,
            background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: TEAL, letterSpacing: '0.06em' }}>
              LOW RISK 
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: -0.5 }}>
            Your profile looks healthy
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            No significant PCOS indicators detected. Below is your personalised wellness plan — built specifically from your health profile.
          </p>
        </div>

        {/* Section label */}
        <p style={{
          fontSize: 11, fontWeight: 700, color: MUTED,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          Your personalised weekly plan
        </p>

        {/* Error state */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 16, padding: '16px 18px', marginBottom: 14,
          }}>
            <p style={{ fontSize: 13, color: '#f87171', margin: '0 0 4px', fontWeight: 700 }}>
              Could not load your plan
            </p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 10, fontSize: 12, fontWeight: 700, color: TEAL,
                background: 'none', border: `1px solid ${TEAL}40`, borderRadius: 8,
                padding: '5px 12px', cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <>
            <TrackSkeleton />
            <TrackSkeleton />
            <TrackSkeleton />
          </>
        )}

        {/* ML-powered tracks */}
        {!loading && !error && plan && (
          <div style={{ animation: 'lr-fadeUp 0.4s ease-out' }}>
            <TrackCard
              trackKey="diet"
              badges={plan.diet_active_categories}
              grid={plan.weekly_diet_chart}
            />
            <TrackCard
              trackKey="exercise_yoga"
              badges={plan.exercise_active_categories}
              grid={plan.weekly_exercise_chart}
            />
            <TrackCard
              trackKey="mood"
              badges={plan.mood_active_categories}
              grid={plan.weekly_mood_chart}
            />
          </div>
        )}

        {/* Watch for symptoms */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 20, padding: '20px 20px 22px', marginBottom: 14,
        }}>
          <span style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14,
          }}>Watch for these symptoms</span>
          {WATCH_SYMPTOMS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 3 ? 10 : 0 }}>
              <span style={{
                flexShrink: 0, marginTop: 3,
                width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: TEAL, fontWeight: 800,
              }}>!</span>
              <p style={{ fontSize: 13, color: INK, margin: 0, opacity: 0.8, lineHeight: 1.55 }}>{s}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%', padding: '15px', borderRadius: 16,
            background: TEAL, border: 'none', cursor: 'pointer',
            fontSize: 14.5, fontWeight: 800, color: '#061a16',
            letterSpacing: -0.2, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Go to Dashboard
        </button>

        <p style={{
          textAlign: 'center', fontSize: 11.5,
          color: 'rgba(141,151,163,0.45)', marginTop: 18, lineHeight: 1.5,
        }}>
          Re-run your PCOS screening any time from the dashboard · Results are not a medical diagnosis
        </p>
      </div>

      <style>{`
        @keyframes lr-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

export default LowRiskPage