import { useNavigate } from 'react-router-dom'
import HospitalFinder from './HospitalFinder'

const FONT    = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const CORAL   = '#fb7185'
const INK     = '#eef1f4'
const MUTED   = '#8d97a3'
const BORDER  = 'rgba(255,255,255,0.09)'
const CARD_BG = 'rgba(255,255,255,0.04)'

const ACTIONS = [
  
  
  
]

const RISKS_IF_UNTREATED = [
  { emoji: '🩸', label: 'Type 2 diabetes risk', detail: 'Insulin resistance in PCOS can progress to pre-diabetes without intervention.' },
  { emoji: '❤️', label: 'Cardiovascular health', detail: 'Elevated androgens and metabolic changes increase long-term cardiovascular risk.' },
  { emoji: '🤰', label: 'Fertility concerns', detail: 'Anovulatory cycles are common in PCOS — early intervention significantly improves outcomes.' },
  { emoji: '🧠', label: 'Mental health', detail: 'PCOS is associated with higher rates of anxiety and depression — addressing it holistically matters.' },
]

const HighRiskPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1a0810 0%, #2d0f1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 56px', fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: -140, right: -120,
        width: 540, height: 540,
        background: 'radial-gradient(circle, rgba(251,113,133,0.14) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div style={{
        position: 'fixed', bottom: -100, left: -80,
        width: 420, height: 420,
        background: 'radial-gradient(circle, rgba(251,113,133,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Nav */}
      <nav style={{
        width: '100%', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(26,8,16,0.8)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🌸</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>CycleWise</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            fontSize: 13, fontWeight: 600, color: MUTED,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = INK }}
          onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
        >
          ← Back to Results
        </button>
      </nav>

      <div style={{ width: '100%', maxWidth: 480, padding: '32px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{
          background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.28)',
          borderRadius: 24, padding: '32px 24px 28px',
          textAlign: 'center', marginBottom: 16,
          animation: 'hr-fadeUp 0.45s ease-out',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
            background: 'rgba(251,113,133,0.12)', border: '2px solid rgba(251,113,133,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
          }}>🔴</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 14,
            background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: CORAL, letterSpacing: '0.06em' }}>
              HIGH RISK · STAGE A RESULT
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: -0.5 }}>
            PCOS risk indicators found
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            Multiple markers align with PCOS patterns. This is a screening — not a diagnosis — but we strongly recommend clinical evaluation soon.
          </p>
        </div>

        {/* Action plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {ACTIONS.map((section, i) => (
            <div key={i} style={{
              background: section.bg, border: `1px solid ${section.color}25`,
              borderRadius: 20, padding: '18px 18px 20px',
              animation: `hr-fadeUp 0.5s ease-out ${0.07 * (i + 1)}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: section.color, flexShrink: 0,
                }}/>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: section.color,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>{section.urgency}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {section.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      flexShrink: 0, marginTop: 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: `${section.color}18`, border: `1px solid ${section.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8.5, color: section.color, fontWeight: 900,
                    }}>{j + 1}</span>
                    <p style={{ fontSize: 13, color: INK, margin: 0, opacity: 0.85, lineHeight: 1.55 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Doctor / hospital finder — powered by consultation/nearby */}
        <HospitalFinder />

        {/* Why act now */}
        <div style={{
          background: CARD_BG, border: `1px solid ${BORDER}`,
          borderRadius: 20, padding: '20px 20px 22px', marginBottom: 14,
          animation: 'hr-fadeUp 0.5s ease-out 0.28s both',
        }}>
          <span style={{
            display: 'block', fontSize: 11, fontWeight: 700,
            color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14,
          }}>Why early action matters</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {RISKS_IF_UNTREATED.map((r, i) => (
              <div key={i} style={{
                background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.12)',
                borderRadius: 14, padding: '13px 12px',
              }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 7 }}>{r.emoji}</span>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: '0 0 4px' }}>{r.label}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.45 }}>{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
            cursor: 'pointer', fontSize: 14, fontWeight: 700, color: CORAL,
            letterSpacing: -0.2, transition: 'background 0.15s',
            animation: 'hr-fadeUp 0.5s ease-out 0.36s both',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.16)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.1)' }}
        >
          Go to Dashboard
        </button>

        <p style={{
          textAlign: 'center', fontSize: 11.5,
          color: 'rgba(141,151,163,0.45)', marginTop: 18, lineHeight: 1.5,
        }}>
          This AI result is a screening tool only — not a medical diagnosis · Consult a qualified physician
        </p>
      </div>

      <style>{`
        @keyframes hr-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hr-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default HighRiskPage