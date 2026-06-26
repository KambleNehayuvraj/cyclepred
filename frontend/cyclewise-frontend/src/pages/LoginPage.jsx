import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/common/Toast.jsx'

// ── Design tokens — match RegisterPage / LandingPage exactly ──────────────
const FONT   = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const TEAL   = '#2dd4bf'
const CORAL  = '#fb7185'
const INK    = '#eef1f4'
const MUTED  = '#8d97a3'
const BG     = 'linear-gradient(160deg, #062a22 0%, #0a3d2e 60%, #0c1017 100%)'
const CARD   = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.09)'

// ── Sub-components (shared shape with RegisterPage) ────────────────────────
const Label = ({ children }) => (
  <span style={{
    display: 'block',
    fontFamily: FONT, fontSize: 12, fontWeight: 600,
    color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: 7,
  }}>{children}</span>
)

const Field = ({ error, children }) => (
  <div style={{ marginBottom: error ? 4 : 18 }}>
    {children}
    {error && (
      <p style={{ fontFamily: FONT, fontSize: 12, color: CORAL, marginTop: 5 }}>{error}</p>
    )}
  </div>
)

const inputStyle = (hasError) => ({
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? CORAL : BORDER}`,
  borderRadius: 12,
  padding: '13px 14px 13px 42px',
  fontFamily: FONT,
  fontSize: 15,
  color: INK,
  outline: 'none',
  transition: 'border-color 0.2s',
})

const IconWrap = ({ children }) => (
  <span style={{
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    fontSize: 16, lineHeight: 1, pointerEvents: 'none',
  }}>{children}</span>
)

// ── LoginPage ────────────────────────────────────────────────────────────
const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]         = useState({ email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [focused, setFocused]   = useState(null)

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.email.includes('@')) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const data = await login(form.email.toLowerCase(), form.password)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 🌸`)
      navigate(data.user.onboarding_completed ? from : '/onboarding', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : (typeof detail === 'string' ? detail : 'Invalid email or password.')
      toast.error(msg)
      setErrors({ password: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: FONT,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: -120, right: -80,
        width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -80,
        width: 340, height: 340,
        background: 'radial-gradient(circle, rgba(251,113,133,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
        animation: 'lg-fadeUp 0.4s ease-out',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(45,212,191,0.14)',
            border: '1px solid rgba(45,212,191,0.25)',
            fontSize: 26, marginBottom: 12,
          }}>🌸</div>
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: INK, letterSpacing: -0.3 }}>
            CycleWise
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginTop: 3 }}>
            Your AI-powered health companion
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 24,
          padding: '28px 28px 24px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: FONT, fontSize: 22, fontWeight: 800,
              color: INK, margin: 0, letterSpacing: -0.3,
            }}>Welcome back</h2>
            <p style={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, marginTop: 4 }}>
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <Field error={errors.email}>
              <Label>Email Address</Label>
              <div style={{ position: 'relative' }}>
                <IconWrap>✉️</IconWrap>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={form.email}
                  onChange={set('email')}
                  disabled={loading}
                  autoComplete="email"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle(errors.email),
                    borderColor: focused === 'email' && !errors.email ? TEAL : errors.email ? CORAL : BORDER,
                  }}
                />
              </div>
            </Field>

            {/* Password */}
            <Field error={errors.password}>
              <Label>Password</Label>
              <div style={{ position: 'relative' }}>
                <IconWrap>🔒</IconWrap>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set('password')}
                  disabled={loading}
                  autoComplete="current-password"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputStyle(errors.password),
                    paddingRight: 44,
                    borderColor: focused === 'password' && !errors.password ? TEAL : errors.password ? CORAL : BORDER,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, lineHeight: 1, padding: 0,
                    opacity: 0.6,
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '14px 0',
                backgroundColor: loading ? 'rgba(45,212,191,0.5)' : TEAL,
                color: '#061a16',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 15.5,
                borderRadius: 99,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {loading
                ? <>
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'lg-spin 0.8s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(6,26,22,0.3)" strokeWidth="2.5" fill="none" />
                      <path d="M8 2 A6 6 0 0 1 14 8" stroke="#061a16" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                    Signing in…
                  </>
                : '✨  Sign in'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
            <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>new here?</span>
            <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
          </div>

          <Link to="/register" style={{
            display: 'block', textAlign: 'center',
            border: `1px solid ${BORDER}`,
            borderRadius: 99,
            padding: '12px 0',
            fontFamily: FONT, fontWeight: 600, fontSize: 14.5,
            color: INK,
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = TEAL }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER }}
          >
            Create one free
          </Link>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontFamily: FONT,
          fontSize: 11.5, color: 'rgba(141,151,163,0.6)',
          marginTop: 16, lineHeight: 1.5, padding: '0 8px',
        }}>
          CycleWise is for informational use only.<br />Always consult a healthcare professional.
        </p>
      </div>

      <style>{`
        @keyframes lg-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lg-spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(141,151,163,0.5); }
        input:focus { outline: none; }
        input:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default LoginPage