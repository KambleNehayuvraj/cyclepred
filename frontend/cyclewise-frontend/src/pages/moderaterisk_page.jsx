import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FONT   = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const ORANGE = '#f97316'
const INK    = '#eef1f4'
const MUTED  = '#8d97a3'
const BORDER = 'rgba(255,255,255,0.09)'
const CARD   = 'rgba(255,255,255,0.04)'

// ── Lab fields config ─────────────────────────────────────────────────────
const LAB_FIELDS = [
  {
    key: 'fsh', label: 'FSH', unit: 'mIU/mL', placeholder: 'e.g. 6.5',
    hint: 'Follicle-stimulating hormone', step: '0.1',
  },
  {
    key: 'lh', label: 'LH', unit: 'mIU/mL', placeholder: 'e.g. 12.0',
    hint: 'Luteinizing hormone', step: '0.1',
  },
  {
    key: 'amh', label: 'AMH', unit: 'ng/mL', placeholder: 'e.g. 4.2',
    hint: 'Anti-Müllerian hormone', step: '0.01',
  },
  {
    key: 'testosterone_ng_ml', label: 'Testosterone', unit: 'ng/mL', placeholder: 'e.g. 0.6',
    hint: 'Total testosterone', step: '0.01',
  },
  {
    key: 'tsh', label: 'TSH', unit: 'µIU/mL', placeholder: 'e.g. 2.1',
    hint: 'Thyroid-stimulating hormone', step: '0.01',
  },
  {
    key: 'prolactin', label: 'Prolactin', unit: 'ng/mL', placeholder: 'e.g. 15.0',
    hint: 'Serum prolactin', step: '0.1',
  },
  {
    key: 'follicle_no_l', label: 'Follicles (L)', unit: 'count', placeholder: 'e.g. 8',
    hint: 'Antral follicle count — left ovary', step: '1', isInt: true,
  },
  {
    key: 'follicle_no_r', label: 'Follicles (R)', unit: 'count', placeholder: 'e.g. 9',
    hint: 'Antral follicle count — right ovary', step: '1', isInt: true,
  },
  {
    key: 'avg_f_size_l_mm', label: 'Avg Follicle Size (L)', unit: 'mm', placeholder: 'e.g. 5.2',
    hint: 'Average follicle size — left ovary', step: '0.1',
  },
  {
    key: 'avg_f_size_r_mm', label: 'Avg Follicle Size (R)', unit: 'mm', placeholder: 'e.g. 5.4',
    hint: 'Average follicle size — right ovary', step: '0.1',
  },
  {
    key: 'endometrium_mm', label: 'Endometrium', unit: 'mm', placeholder: 'e.g. 7.0',
    hint: 'Endometrial thickness', step: '0.1',
  },
]

// ── Input component ───────────────────────────────────────────────────────
const LabInput = ({ field, value, onChange, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>
        {field.label}
        <span style={{ fontSize: 10.5, color: MUTED, fontWeight: 500, marginLeft: 5 }}>
          ({field.unit})
        </span>
      </label>
    </div>
    <p style={{ fontSize: 10.5, color: MUTED, margin: '0 0 4px', lineHeight: 1.4 }}>{field.hint}</p>
    <input
      type="number"
      step={field.step}
      min="0"
      placeholder={field.placeholder}
      value={value}
      onChange={e => onChange(field.key, e.target.value)}
      style={{
        width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.06)',
        border: error ? '1px solid rgba(239,68,68,0.6)' : `1px solid ${BORDER}`,
        color: INK, fontSize: 13.5, fontFamily: FONT, outline: 'none',
        transition: 'border 0.15s',
      }}
      onFocus={e => { e.target.style.border = `1px solid ${ORANGE}60` }}
      onBlur={e => {
        e.target.style.border = error
          ? '1px solid rgba(239,68,68,0.6)'
          : `1px solid ${BORDER}`
      }}
    />
    {error && (
      <p style={{ fontSize: 10.5, color: '#f87171', margin: 0 }}>{error}</p>
    )}
  </div>
)

// ── Clinical referral placeholder ─────────────────────────────────────────
const ClinicalReferralCard = ({ probability, navigate }) => (
  <div style={{
    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 20, padding: '24px 20px', marginBottom: 14,
    animation: 'mr-fadeUp 0.4s ease-out',
  }}>
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
        background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>🏥</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 12px', borderRadius: 99, marginBottom: 10,
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.06em' }}>
          STAGE B · CLINICAL REFERRAL RECOMMENDED
        </span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: -0.4 }}>
        PCOS Confirmed by AI Analysis
      </h2>
      <p style={{ fontSize: 13.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
        The Stage B model returned a <strong style={{ color: '#f87171' }}>{probability}%</strong> PCOS probability based on your lab values. Clinical evaluation is strongly recommended.
      </p>
    </div>

    {/* Confidence bar */}
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Model Confidence
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#f87171' }}>{probability}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${probability}%`,
          background: 'linear-gradient(90deg, #f97316, #ef4444)',
          transition: 'width 0.8s ease-out',
        }}/>
      </div>
    </div>

    {/* Doctor Connect → navigates to High Risk page */}
    <div
      onClick={() => navigate('/highrisk')}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/highrisk') }}
      style={{
        background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(249,115,22,0.14)'
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(249,115,22,0.08)'
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>🔜</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE, margin: '0 0 4px' }}>
          Connect To Doctor
        </p>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
          You can directly connect with PCOS-specialist gynaecologists. You'll be able to share your CycleWise report and book a consultation.
        </p>
      </div>
      <span style={{ fontSize: 16, color: ORANGE, flexShrink: 0, alignSelf: 'center' }}>→</span>
    </div>

    {/* Immediate action items */}
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        What to do right now
      </p>
      {[
        { icon: '📋', text: 'Book an appointment with a gynaecologist or endocrinologist within 2–4 weeks' },
        { icon: '🧪', text: 'Bring your lab report — the values you entered here match the Rotterdam criteria markers' },
        { icon: '📱', text: 'Keep tracking your symptoms in CycleWise — your log is valuable clinical data' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
          <p style={{ fontSize: 12.5, color: INK, margin: 0, opacity: 0.85, lineHeight: 1.5 }}>{item.text}</p>
        </div>
      ))}
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────
const ModerateRiskPage = () => {
  const navigate = useNavigate()

  const [values,   setValues]   = useState({})
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState(null)
  const [result,   setResult]   = useState(null)   // stage-b-confirm response

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }))
  }

  const validate = () => {
    const newErrors = {}
    LAB_FIELDS.forEach(f => {
      const v = values[f.key]
      if (v === undefined || v === '') {
        newErrors[f.key] = 'Required'
      } else if (isNaN(Number(v)) || Number(v) < 0) {
        newErrors[f.key] = 'Enter a valid positive number'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError(null)

    const body = {}
    LAB_FIELDS.forEach(f => {
      body[f.key] = f.isInt ? parseInt(values[f.key], 10) : parseFloat(values[f.key])
    })

    try {
      const token = localStorage.getItem('cw_token')
      const res   = await fetch('/predict/stage-b-confirm', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data)

      // If low risk — redirect to recommendations after a brief delay
      if (data.verdict === 'low') {
        setTimeout(() => navigate('/lowrisk'), 1800)
      }

    } catch (e) {
      setApiError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1a0c00 0%, #2a1800 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 56px', fontFamily: FONT,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'fixed', top: -140, right: -120, width: 540, height: 540,
        background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>
      <div style={{
        position: 'fixed', bottom: -100, left: -80, width: 420, height: 420,
        background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      {/* Nav */}
      <nav style={{
        width: '100%', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(26,12,0,0.8)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
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
          background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 24, padding: '32px 24px 28px',
          textAlign: 'center', marginBottom: 20,
          animation: 'mr-fadeUp 0.45s ease-out',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
            background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
          }}>⚠️</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, marginBottom: 14,
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: ORANGE, letterSpacing: '0.06em' }}>
              BORDERLINE · STAGE A RESULT
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: -0.5 }}>
            Some patterns worth watching
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            Stage A flagged borderline indicators. Enter your lab values below and our Stage B ensemble model will give you a definitive assessment.
          </p>
        </div>

        {/* ── RESULT STATE: low risk redirect notice ── */}
        {result?.verdict === 'low' && (
          <div style={{
            background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.3)',
            borderRadius: 16, padding: '16px 18px', marginBottom: 14,
            display: 'flex', gap: 12, alignItems: 'center',
            animation: 'mr-fadeUp 0.35s ease-out',
          }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#2dd4bf', margin: '0 0 3px' }}>
                Stage B: Low Risk ({result.probability}% probability)
              </p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                PCOS not confirmed. Redirecting you to your wellness plan…
              </p>
            </div>
          </div>
        )}

        {/* ── RESULT STATE: high risk → clinical referral card ── */}
        {result?.verdict === 'high' && (
          <ClinicalReferralCard probability={result.probability} navigate={navigate} />
        )}

        {/* ── FORM (hidden once result is shown) ── */}
        {!result && (
          <div style={{ animation: 'mr-fadeUp 0.5s ease-out 0.08s both' }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: MUTED,
              letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 14px',
            }}>
              Enter your lab values
            </p>

            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 20, padding: '20px 18px', marginBottom: 14,
            }}>
              <p style={{ fontSize: 12, color: MUTED, margin: '0 0 16px', lineHeight: 1.5 }}>
                These values come from a standard hormonal blood panel and pelvic ultrasound. Enter exactly as shown on your lab report.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {LAB_FIELDS.map(f => (
                  <LabInput
                    key={f.key}
                    field={f}
                    value={values[f.key] ?? ''}
                    onChange={handleChange}
                    error={errors[f.key]}
                  />
                ))}
              </div>
            </div>

            {/* API error */}
            {apiError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 14,
              }}>
                <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: 16,
                background: loading ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.9)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14.5, fontWeight: 800, color: '#1a0800',
                letterSpacing: -0.2, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid #1a080080',
                    borderTop: '2px solid #1a0800',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}/>
                  Analysing your labs…
                </>
              ) : (
                'Run Stage B Analysis →'
              )}
            </button>

            <p style={{
              textAlign: 'center', fontSize: 11, color: 'rgba(141,151,163,0.45)',
              marginTop: 14, lineHeight: 1.5,
            }}>
              Your lab values are not stored · Results are not a medical diagnosis
            </p>
          </div>
        )}

        {/* Dashboard button — always visible after result */}
        {result && (
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', padding: '15px', borderRadius: 16, marginTop: 4,
              background: CARD, border: `1px solid ${BORDER}`,
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: MUTED,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
          >
            Go to Dashboard
          </button>
        )}

        <p style={{
          textAlign: 'center', fontSize: 11.5,
          color: 'rgba(141,151,163,0.45)', marginTop: 18, lineHeight: 1.5,
        }}>
          This is a screening result, not a diagnosis · Always consult a qualified healthcare professional
        </p>
      </div>

      <style>{`
        @keyframes mr-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}

export default ModerateRiskPage