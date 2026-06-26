import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictAPI } from '../api/services.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/common/Toast.jsx'

// ── Design tokens — identical to OnboardingPage ────────────────────────────
const FONT    = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const TEAL    = '#2dd4bf'
const CORAL   = '#fb7185'
const ORANGE  = '#f97316'
const PURPLE  = '#c084fc'
const INK     = '#eef1f4'
const MUTED   = '#8d97a3'
const BORDER  = 'rgba(255,255,255,0.09)'
const CARD_BG = 'rgba(255,255,255,0.04)'

// ── Risk level config ──────────────────────────────────────────────────────
const RISK_CONFIG = {
  low: {
    color: TEAL,
    glow:  'rgba(45,212,191,0.18)',
    bg:    'rgba(45,212,191,0.07)',
    label: 'Low Risk',
    emoji: '✅',
    headline: 'No significant PCOS indicators',
    sub: 'Your health profile looks reassuring. Keep up your current habits.',
    pageBg: 'linear-gradient(160deg, #0c1017 0%, #062a22 100%)',
    detailRoute: '/lowrisk',
    detailLabel: 'View Wellness Tips',
    detailEmoji: '🌿',
    detailSub: 'Habits to maintain your healthy profile',
    detailButtonBg: 'rgba(45,212,191,0.1)',
    detailButtonBorder: 'rgba(45,212,191,0.28)',
    detailButtonColor: TEAL,
  },
  ambiguous: {
    color: ORANGE,
    glow:  'rgba(249,115,22,0.18)',
    bg:    'rgba(249,115,22,0.07)',
    label: 'Borderline',
    emoji: '⚠️',
    headline: 'Some patterns worth watching',
    sub: 'A few indicators are present. A check-up with your doctor is a good idea.',
    pageBg: 'linear-gradient(160deg, #1a0c00 0%, #2a1800 100%)',
    detailRoute: '/moderaterisk',
    detailLabel: 'See Recommended Actions',
    detailEmoji: '📋',
    detailSub: 'Steps to take & lifestyle changes',
    detailButtonBg: 'rgba(249,115,22,0.1)',
    detailButtonBorder: 'rgba(249,115,22,0.28)',
    detailButtonColor: ORANGE,
  },
  high: {
    color: CORAL,
    glow:  'rgba(251,113,133,0.18)',
    bg:    'rgba(251,113,133,0.07)',
    label: 'High Risk',
    emoji: '🔴',
    headline: 'PCOS risk indicators found',
    sub: 'Multiple markers align with PCOS patterns. We strongly recommend a clinical evaluation.',
    pageBg: 'linear-gradient(160deg, #1a0810 0%, #2d0f1a 100%)',
    detailRoute: '/highrisk',
    detailLabel: 'See Your Action Plan',
    detailEmoji: '🚨',
    detailSub: 'Urgent steps & what to ask your doctor',
    detailButtonBg: 'rgba(251,113,133,0.1)',
    detailButtonBorder: 'rgba(251,113,133,0.28)',
    detailButtonColor: CORAL,
  },
}

// ── Animated Arc Gauge ────────────────────────────────────────────────────
const ArcGauge = ({ probability, riskLevel }) => {
  const cfg   = RISK_CONFIG[riskLevel] || RISK_CONFIG.low
  const pct   = Math.min(100, Math.max(0, Math.round(probability)))
  const [animated, setAnimated] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 1400
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setAnimated(Math.round(ease(t) * pct))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [pct])

  // SVG half-arc geometry
  const cx = 140, cy = 130, r = 100
  const toRad = (d) => (d * Math.PI) / 180
  const arcPath = (sa, ea) => {
    const s = { x: cx + r * Math.cos(toRad(sa)), y: cy + r * Math.sin(toRad(sa)) }
    const e = { x: cx + r * Math.cos(toRad(ea)), y: cy + r * Math.sin(toRad(ea)) }
    const lg = ea - sa > 180 ? 1 : 0
    return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${lg} 1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`
  }
  const endAngle = 180 + (animated / 100) * 180

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 0' }}>
      <svg viewBox="0 0 280 145" style={{ width: '100%', maxWidth: 300, overflow: 'visible' }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={TEAL}/>
            <stop offset="45%"  stopColor={ORANGE}/>
            <stop offset="100%" stopColor={CORAL}/>
          </linearGradient>
          <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={arcPath(180, 360)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="16" strokeLinecap="round"/>

        {/* Ghost gradient track */}
        <path d={arcPath(180, 360)} fill="none" stroke="url(#arcGrad)" strokeWidth="16"
          strokeLinecap="round" opacity="0.12"/>

        {/* Active arc */}
        {animated > 0 && (
          <path d={arcPath(180, endAngle)} fill="none" stroke={cfg.color} strokeWidth="16"
            strokeLinecap="round" filter="url(#arcGlow)" opacity="0.95"/>
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((v) => {
          const a = 180 + (v / 100) * 180
          const i1 = { x: cx + 82 * Math.cos(toRad(a)), y: cy + 82 * Math.sin(toRad(a)) }
          const i2 = { x: cx + 94 * Math.cos(toRad(a)), y: cy + 94 * Math.sin(toRad(a)) }
          return (
            <line key={v}
              x1={i1.x.toFixed(2)} y1={i1.y.toFixed(2)}
              x2={i2.x.toFixed(2)} y2={i2.y.toFixed(2)}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
          )
        })}

        {/* Center percentage */}
        <text x={cx} y={cy - 16} textAnchor="middle"
          fontSize="42" fontWeight="800" fill={cfg.color} fontFamily={FONT}
          style={{ letterSpacing: -1 }}>
          {animated}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle"
          fontSize="12" fontWeight="700" fill={cfg.color} fontFamily={FONT}
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {cfg.label}
        </text>

        {/* Scale labels */}
        <text x="22"  y="142" textAnchor="middle" fontSize="9.5" fill={MUTED} fontFamily={FONT}>Low</text>
        <text x={cx}  y="142" textAnchor="middle" fontSize="9.5" fill={MUTED} fontFamily={FONT}>Moderate</text>
        <text x="258" y="142" textAnchor="middle" fontSize="9.5" fill={MUTED} fontFamily={FONT}>High</text>
      </svg>
    </div>
  )
}

// ── Risk Factor Pills ──────────────────────────────────────────────────────
const FACTOR_META = {
  cycle_irregular:    { label: 'Irregular cycle',        emoji: '〰️' },
  weight_gain:        { label: 'Unexplained weight gain', emoji: '⚖️' },
  hair_growth_excess: { label: 'Excess hair growth',      emoji: '🧔' },
  skin_darkening:     { label: 'Skin darkening',          emoji: '🟤' },
  hair_loss:          { label: 'Hair thinning',           emoji: '💇' },
  pimples:            { label: 'Frequent acne',           emoji: '😣' },
  fast_food_frequent: { label: 'Frequent fast food',      emoji: '🍔' },
  bmi:                { label: 'Elevated BMI',            emoji: '📊' },
  waist_hip_ratio:    { label: 'High waist-hip ratio',    emoji: '📐' },
  bp_systolic:        { label: 'Elevated blood pressure', emoji: '🩺' },
  cycle_length_days:  { label: 'Abnormal cycle length',   emoji: '📅' },
  regular_exercise:   { label: 'Low physical activity',   emoji: '🏃' },
}

const FactorPills = ({ factors, detected, accent }) => (
  <div>
    <span style={{
      display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
      color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12,
    }}>
      Key contributing factors
    </span>
    {factors && factors.length > 0 ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {factors.map((f) => {
          const meta = FACTOR_META[f] || { label: f.replace(/_/g, ' '), emoji: '•' }
          return (
            <span key={f} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 99,
              background: detected ? 'rgba(251,113,133,0.1)' : 'rgba(45,212,191,0.1)',
              border: `1px solid ${detected ? 'rgba(251,113,133,0.3)' : 'rgba(45,212,191,0.3)'}`,
              color: detected ? CORAL : TEAL,
              fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
            }}>
              <span style={{ fontSize: 14 }}>{meta.emoji}</span>
              {meta.label}
            </span>
          )
        })}
      </div>
    ) : (
      <p style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>
        No significant risk factors detected
      </p>
    )}
  </div>
)

// ── What this means card ──────────────────────────────────────────────────
const WhatThisMeans = ({ result }) => {
  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low
  const pct = Math.round(result.risk_probability)

  const messages = {
    low: [
      `Your health data shows a ${pct}% probability of PCOS-related hormonal patterns — this is reassuringly low.`,
      `Continue your current habits. If you notice new symptoms like irregular periods, unexpected hair growth, or persistent acne, schedule a check-up.`,
      `Keep logging your cycles in CycleWise — a longer track record gives more accurate insights over time.`,
    ],
    ambiguous: [
      `Your data shows a ${pct}% probability of PCOS-related patterns. This sits in a borderline zone — not alarming, but worth attention.`,
      `We recommend a routine check-up with your gynecologist. Simple blood tests (LH, FSH, testosterone) can clarify the picture quickly.`,
      `Lifestyle adjustments — particularly around diet, sleep, and stress — can meaningfully improve hormonal balance while you monitor symptoms.`,
    ],
    high: [
      `Your health data indicates a ${pct}% probability of PCOS-related hormonal patterns. Multiple markers in your profile align with known PCOS indicators.`,
      `This is a screening result, not a diagnosis. A qualified gynecologist or endocrinologist can confirm through hormonal blood panels and pelvic ultrasound.`,
      `Don't wait — early intervention with lifestyle changes and, if needed, medication significantly reduces long-term health risks associated with PCOS.`,
    ],
  }

  const lines = messages[result.risk_level] || messages.low

  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 20, padding: '20px 20px 22px',
    }}>
      <span style={{
        display: 'block', fontFamily: FONT, fontSize: 11, fontWeight: 700,
        color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14,
      }}>What this means</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, marginTop: 2,
              width: 20, height: 20, borderRadius: '50%',
              background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: cfg.color, fontWeight: 800,
            }}>{i + 1}</span>
            <p style={{ fontFamily: FONT, fontSize: 13.5, color: INK, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Disclaimer ────────────────────────────────────────────────────────────
const Disclaimer = () => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 16, padding: '14px 16px',
  }}>
    <span style={{ fontSize: 20, flexShrink: 0 }}>⚕️</span>
    <div>
      <p style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: ORANGE, margin: '0 0 4px' }}>
        Medical Disclaimer
      </p>
      <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(249,115,22,0.75)', margin: 0, lineHeight: 1.55 }}>
        This AI result is a <strong>screening tool only</strong> — not a medical diagnosis. PCOS requires clinical confirmation via blood tests and ultrasound by a qualified physician. Always consult a healthcare professional before making health decisions.
      </p>
    </div>
  </div>
)

// ── Loading skeleton ───────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '40px 0' }}>
    <div style={{
      width: 64, height: 64, borderRadius: '50%',
      border: `3px solid ${BORDER}`,
      borderTopColor: TEAL,
      animation: 'pcos-spin 0.9s linear infinite',
    }}/>
    <div>
      <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: INK, textAlign: 'center', margin: '0 0 6px' }}>
        Analyzing your cycle data…
      </p>
      <p style={{ fontFamily: FONT, fontSize: 13, color: MUTED, textAlign: 'center', margin: 0 }}>
        Running Stage A model across 18 health indicators
      </p>
    </div>
  </div>
)

// ── Deep Dive CTA Button ──────────────────────────────────────────────────
const DeepDiveButton = ({ result, navigate }) => {
  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low

  return (
    <button
      onClick={() => navigate(cfg.detailRoute)}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: cfg.detailButtonBg,
        border: `1.5px solid ${cfg.detailButtonBorder}`,
        borderRadius: 18, padding: '18px 20px',
        cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: FONT,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = cfg.detailButtonBg.replace('0.1)', '0.17)')
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = cfg.detailButtonBg
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: `${cfg.detailButtonColor}18`,
          border: `1px solid ${cfg.detailButtonColor}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {cfg.detailEmoji}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: cfg.detailButtonColor, margin: 0, letterSpacing: -0.2 }}>
            {cfg.detailLabel}
          </p>
          <p style={{ fontSize: 12, color: MUTED, margin: '3px 0 0' }}>
            {cfg.detailSub}
          </p>
        </div>
      </div>
      <span style={{ fontSize: 18, color: cfg.detailButtonColor, opacity: 0.7 }}>→</span>
    </button>
  )
}

// ── Main PCOSResultPage ───────────────────────────────────────────────────
const PCOSResultPage = () => {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    predictAPI.predictPCOS()
      .then((r) => setResult(r.data))
      .catch(() => {
        toast.error('Failed to load PCOS analysis. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const cfg = result ? (RISK_CONFIG[result.risk_level] || RISK_CONFIG.low) : RISK_CONFIG.low

  return (
    <div style={{
      minHeight: '100dvh',
      background: result ? cfg.pageBg : 'linear-gradient(160deg, #0c1017 0%, #101820 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 48px', fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.6s ease',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -120, right: -100,
        width: 500, height: 500,
        background: `radial-gradient(circle, ${result ? cfg.glow : 'rgba(45,212,191,0.08)'} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s ease',
      }}/>
      <div style={{
        position: 'fixed', bottom: -120, left: -100,
        width: 460, height: 460,
        background: `radial-gradient(circle, ${result ? cfg.glow : 'rgba(45,212,191,0.06)'} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s ease',
      }}/>

      {/* Sticky nav */}
      <nav style={{
        width: '100%', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,16,23,0.75)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56,
        boxSizing: 'border-box',
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
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            fontFamily: FONT, fontSize: 13, fontWeight: 600,
            color: MUTED, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = INK }}
          onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
        >
          ← Dashboard
        </button>
      </nav>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 480, padding: '28px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Page title */}
        <div style={{ marginBottom: 22, animation: 'pcos-fadeUp 0.4s ease-out' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99, marginBottom: 12,
            background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.25)',
          }}>
            <span style={{ fontSize: 12 }}>🧬</span>
            <span style={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 700, color: PURPLE, letterSpacing: '0.05em' }}>
              STAGE A · AI SCREENING
            </span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 5px', letterSpacing: -0.5 }}>
            PCOS Risk Analysis
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, margin: 0 }}>
            Based on 18 onboarding health indicators
          </p>
        </div>

        {loading ? (
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 22, padding: '10px 20px 24px',
            animation: 'pcos-fadeUp 0.4s ease-out',
          }}>
            <LoadingSkeleton/>
          </div>
        ) : result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'pcos-fadeUp 0.4s ease-out' }}>

            {/* Main result card */}
            <div style={{
              background: cfg.bg,
              border: `1px solid ${cfg.color}30`,
              borderRadius: 22, padding: '22px 20px 24px',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            }}>
              {/* Status header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {cfg.emoji}
                </div>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: INK, margin: 0, letterSpacing: -0.2 }}>
                    {cfg.headline}
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, margin: '3px 0 0', lineHeight: 1.4 }}>
                    {cfg.sub}
                  </p>
                </div>
              </div>

              {/* Gauge */}
              <ArcGauge probability={result.risk_probability} riskLevel={result.risk_level}/>

              {/* Divider */}
              <div style={{ height: 1, background: BORDER, margin: '18px 0' }}/>

              {/* Factor pills */}
              <FactorPills
                factors={result.key_risk_factors}
                detected={result.pcos_detected}
                accent={cfg.color}
              />
            </div>

            {/* What this means */}
            <WhatThisMeans result={result}/>

            {/* ── Deep Dive CTA — risk-adaptive ── */}
            <DeepDiveButton result={result} navigate={navigate}/>

            <Disclaimer/>

          </div>
        ) : (
          /* Error state */
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 22, padding: '36px 20px',
            textAlign: 'center', animation: 'pcos-fadeUp 0.4s ease-out',
          }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>😞</span>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: INK, margin: '0 0 6px' }}>
              Analysis unavailable
            </p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: MUTED, margin: '0 0 20px' }}>
              We couldn't load your results. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                fontFamily: FONT, fontSize: 14, fontWeight: 700,
                color: '#061a16', background: TEAL,
                border: 'none', borderRadius: 99, padding: '11px 28px',
                cursor: 'pointer',
              }}
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* Footer note */}
        
      </div>

      <style>{`
        @keyframes pcos-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pcos-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PCOSResultPage