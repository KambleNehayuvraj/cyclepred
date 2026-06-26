import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../api/services'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/common/Toast.jsx'

// ── Design tokens — identical to LandingPage + RegisterPage ───────────────
const FONT    = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const TEAL    = '#2dd4bf'
const CORAL   = '#fb7185'
const ORANGE  = '#f97316'
const INK     = '#eef1f4'
const MUTED   = '#8d97a3'
const BORDER  = 'rgba(255,255,255,0.09)'
const CARD_BG = 'rgba(255,255,255,0.04)'

// Per-step gradient themes matching the LandingPage language
const STEP_THEMES = [
  { bg: 'linear-gradient(160deg, #0c1017 0%, #101820 100%)', accent: TEAL,   glow: 'rgba(45,212,191,0.12)' },
  { bg: 'linear-gradient(160deg, #1a0c22 0%, #2a0e38 100%)', accent: '#c084fc', glow: 'rgba(192,132,252,0.12)' },
  { bg: 'linear-gradient(160deg, #1a0810 0%, #2d0f1a 100%)', accent: CORAL,  glow: 'rgba(251,113,133,0.12)' },
  { bg: 'linear-gradient(160deg, #062a22 0%, #0a3d2e 100%)', accent: TEAL,   glow: 'rgba(45,212,191,0.12)' },
]

const STEPS = [
  { id: 1, title: 'Basic Info',    emoji: '📋', subtitle: 'Tell us about yourself' },
  { id: 2, title: 'Cycle Details', emoji: '🌙', subtitle: 'Your menstrual cycle' },
  { id: 3, title: 'Symptoms',      emoji: '🩺', subtitle: 'What you experience' },
  { id: 4, title: 'Lifestyle',     emoji: '🌿', subtitle: 'Daily habits & wellbeing' },
]

// Theme used for the final "support" slide, after all questions are answered
const SUPPORT_THEME = { bg: 'linear-gradient(160deg, #062a22 0%, #0a3d2e 100%)', accent: TEAL, glow: 'rgba(45,212,191,0.14)' }

const INITIAL = {
  age: '', weight_kg: '', height_cm: '',
  waist_cm: '', hip_cm: '', bp_systolic: '', bp_diastolic: '',
  cycle_regularity: '', avg_cycle_length: '28', avg_period_duration: '5',
  last_period_date: '', flow_intensity: '',
  has_acne: false, has_excessive_hair_growth: false, has_hair_thinning: false,
  has_mood_swings: false, has_cramps: false, has_bloating: false,
  has_fatigue: false, has_pelvic_pain: false,
  has_weight_gain: false, has_skin_darkening: false, fast_food_frequent: false,
  exercise_days_per_week: '3', stress_level: '5', sleep_hours: '7', diet_type: '',
}

// ── Shared primitives ──────────────────────────────────────────────────────
const Label = ({ children }) => (
  <span style={{
    display: 'block', fontFamily: FONT, fontSize: 11.5, fontWeight: 700,
    color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8,
  }}>{children}</span>
)

const FieldGroup = ({ label, error, children, style }) => (
  <div style={{ marginBottom: error ? 4 : 20, ...style }}>
    {label && <Label>{label}</Label>}
    {children}
    {error && <p style={{ fontFamily: FONT, fontSize: 12, color: CORAL, marginTop: 5 }}>{error}</p>}
  </div>
)

const inputBase = (hasError, accent) => ({
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${hasError ? CORAL : BORDER}`,
  borderRadius: 12,
  padding: '12px 14px',
  fontFamily: FONT,
  fontSize: 15,
  color: INK,
  outline: 'none',
  transition: 'border-color 0.2s',
  appearance: 'none',
  WebkitAppearance: 'none',
})

// Pill selector
const PillSelect = ({ options, value, onChange, cols = 2, accent }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
    {options.map((opt) => {
      const active = value === opt.value
      return (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
          padding: '11px 10px',
          borderRadius: 12,
          border: `1px solid ${active ? accent : BORDER}`,
          background: active ? `${accent}22` : 'rgba(255,255,255,0.03)',
          color: active ? accent : MUTED,
          fontFamily: FONT, fontSize: 13.5, fontWeight: active ? 700 : 500,
          cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {opt.emoji && <span style={{ fontSize: 16 }}>{opt.emoji}</span>}
          {opt.label}
        </button>
      )
    })}
  </div>
)

// Range slider
const RangeSlider = ({ value, onChange, min, max, step = 1, unit, markers, accent }) => (
  <div style={{ marginTop: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{min}{unit}</span>
      <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: accent }}>{value}<span style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>{unit}</span></span>
      <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{max}{unit}</span>
    </div>
    <div style={{ position: 'relative' }}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', accentColor: accent, cursor: 'pointer', height: 4 }}
      />
    </div>
    {markers && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {markers.map((m) => (
          <span key={m} style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(141,151,163,0.5)' }}>{m}</span>
        ))}
      </div>
    )}
  </div>
)

// Symptom toggle pill
const SymptomToggle = ({ label, emoji, checked, onChange, accent }) => (
  <button type="button" onClick={() => onChange(!checked)} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px',
    borderRadius: 14,
    border: `1px solid ${checked ? accent : BORDER}`,
    background: checked ? `${accent}18` : 'rgba(255,255,255,0.03)',
    color: checked ? INK : MUTED,
    fontFamily: FONT, fontSize: 13.5, fontWeight: checked ? 600 : 400,
    cursor: 'pointer', textAlign: 'left', width: '100%',
    transition: 'all 0.15s',
  }}>
    <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
    <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>
    <span style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${checked ? accent : BORDER}`,
      background: checked ? accent : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, color: '#061a16', fontWeight: 800,
      transition: 'all 0.15s',
    }}>{checked ? '✓' : ''}</span>
  </button>
)

// BMI calculation
const getBMI = (w, h) => h > 0 ? (w / ((h / 100) ** 2)).toFixed(1) : null
const getBMILabel = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: ORANGE }
  if (bmi < 25)   return { label: 'Healthy', color: TEAL }
  if (bmi < 30)   return { label: 'Overweight', color: ORANGE }
  return { label: 'Obese', color: CORAL }
}

// ── Step 1: Basic Info ─────────────────────────────────────────────────────
const Step1 = ({ data, set, errors, accent }) => {
  const bmi = data.weight_kg && data.height_cm ? getBMI(+data.weight_kg, +data.height_cm) : null
  const bmiInfo = bmi ? getBMILabel(+bmi) : null

  return (
    <div>
      <FieldGroup label="How old are you?" error={errors.age}>
        <input type="number" placeholder="e.g. 25" value={data.age}
          onChange={(e) => set('age')(e.target.value)} min="10" max="60"
          style={{ ...inputBase(errors.age), borderColor: errors.age ? CORAL : BORDER }} />
      </FieldGroup>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldGroup label="Weight (kg)" error={errors.weight_kg}>
          <input type="number" placeholder="58" value={data.weight_kg}
            onChange={(e) => set('weight_kg')(e.target.value)}
            style={{ ...inputBase(errors.weight_kg), borderColor: errors.weight_kg ? CORAL : BORDER }} />
        </FieldGroup>
        <FieldGroup label="Height (cm)" error={errors.height_cm}>
          <input type="number" placeholder="162" value={data.height_cm}
            onChange={(e) => set('height_cm')(e.target.value)}
            style={{ ...inputBase(errors.height_cm), borderColor: errors.height_cm ? CORAL : BORDER }} />
        </FieldGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldGroup label="Waist (cm)" error={errors.waist_cm}>
          <input type="number" placeholder="78" value={data.waist_cm}
            onChange={(e) => set('waist_cm')(e.target.value)}
            style={{ ...inputBase(errors.waist_cm), borderColor: errors.waist_cm ? CORAL : BORDER }} />
        </FieldGroup>
        <FieldGroup label="Hip (cm)" error={errors.hip_cm}>
          <input type="number" placeholder="96" value={data.hip_cm}
            onChange={(e) => set('hip_cm')(e.target.value)}
            style={{ ...inputBase(errors.hip_cm), borderColor: errors.hip_cm ? CORAL : BORDER }} />
        </FieldGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldGroup label="BP — Systolic" error={errors.bp_systolic}>
          <input type="number" placeholder="118" value={data.bp_systolic}
            onChange={(e) => set('bp_systolic')(e.target.value)}
            style={{ ...inputBase(errors.bp_systolic), borderColor: errors.bp_systolic ? CORAL : BORDER }} />
        </FieldGroup>
        <FieldGroup label="BP — Diastolic" error={errors.bp_diastolic}>
          <input type="number" placeholder="76" value={data.bp_diastolic}
            onChange={(e) => set('bp_diastolic')(e.target.value)}
            style={{ ...inputBase(errors.bp_diastolic), borderColor: errors.bp_diastolic ? CORAL : BORDER }} />
        </FieldGroup>
      </div>

      <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(141,151,163,0.6)', marginBottom: 16, marginTop: -8 }}>
        Don't have a BP reading? A recent doctor's visit works fine.
      </p>

      {bmi && (
        <div style={{
          background: `${bmiInfo.color}14`,
          border: `1px solid ${bmiInfo.color}40`,
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'ob-fadeIn 0.3s ease-out',
        }}>
          <span style={{ fontSize: 26 }}>📊</span>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 11, color: MUTED, margin: 0 }}>Your BMI</p>
            <p style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: bmiInfo.color, margin: 0 }}>
              {bmi} <span style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>— {bmiInfo.label}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 2: Cycle Details ──────────────────────────────────────────────────
const Step2 = ({ data, set, errors, accent }) => (
  <div>
    <FieldGroup label="How regular is your cycle?" error={errors.cycle_regularity}>
      <PillSelect value={data.cycle_regularity} onChange={set('cycle_regularity')} cols={3} accent={accent}
        options={[
          { value: 'regular',        label: 'Regular',        emoji: '✅' },
          { value: 'irregular',      label: 'Irregular',      emoji: '〰️' },
          { value: 'very_irregular', label: 'Very irregular', emoji: '❓' },
        ]} />
    </FieldGroup>

    <FieldGroup label={`Average cycle length`}>
      <RangeSlider value={data.avg_cycle_length} onChange={set('avg_cycle_length')}
        min={14} max={60} unit=" days" markers={['14', '28', '45', '60']} accent={accent} />
    </FieldGroup>

    <FieldGroup label={`Period duration`}>
      <RangeSlider value={data.avg_period_duration} onChange={set('avg_period_duration')}
        min={1} max={14} unit=" days" markers={['1', '5', '10', '14']} accent={accent} />
    </FieldGroup>

    <FieldGroup label="Date of last period" error={errors.last_period_date}>
      <input type="date" value={data.last_period_date}
        onChange={(e) => set('last_period_date')(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        style={{
          ...inputBase(errors.last_period_date),
          borderColor: errors.last_period_date ? CORAL : BORDER,
          colorScheme: 'dark',
        }} />
    </FieldGroup>

    <FieldGroup label="Flow intensity" error={errors.flow_intensity}>
      <PillSelect value={data.flow_intensity} onChange={set('flow_intensity')} cols={2} accent={accent}
        options={[
          { value: 'light',      label: 'Light',      emoji: '💧' },
          { value: 'moderate',   label: 'Moderate',   emoji: '💧💧' },
          { value: 'heavy',      label: 'Heavy',      emoji: '💧💧💧' },
          { value: 'very_heavy', label: 'Very heavy', emoji: '🔴' },
        ]} />
    </FieldGroup>
  </div>
)

// ── Step 3: Symptoms ───────────────────────────────────────────────────────
const SYMPTOMS = [
  { key: 'has_acne',                  label: 'Frequent acne breakouts',           emoji: '😣' },
  { key: 'has_excessive_hair_growth', label: 'Unusual facial or body hair',       emoji: '🧔' },
  { key: 'has_hair_thinning',         label: 'Hair thinning or loss',             emoji: '💇' },
  { key: 'has_mood_swings',           label: 'Significant mood swings',           emoji: '🎭' },
  { key: 'has_cramps',                label: 'Painful menstrual cramps',          emoji: '😖' },
  { key: 'has_bloating',              label: 'Bloating during cycle',             emoji: '🫧' },
  { key: 'has_fatigue',               label: 'Excessive fatigue',                 emoji: '😴' },
  { key: 'has_pelvic_pain',           label: 'Pelvic pain outside period',        emoji: '🫀' },
  { key: 'has_weight_gain',           label: 'Unexplained weight gain',           emoji: '⚖️' },
  { key: 'has_skin_darkening',        label: 'Dark patches (neck/underarms)',     emoji: '🟤' },
  { key: 'fast_food_frequent',        label: 'Fast food 3+ times a week',         emoji: '🍔' },
]

const Step3 = ({ data, set, accent }) => {
  const count = SYMPTOMS.filter((s) => data[s.key]).length
  return (
    <div>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: '10px 14px', marginBottom: 18,
      }}>
        <p style={{ fontFamily: FONT, fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>
          Select everything you regularly experience. Honesty helps our AI give you the most accurate insights.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SYMPTOMS.map((s) => (
          <SymptomToggle key={s.key} label={s.label} emoji={s.emoji}
            checked={data[s.key]} onChange={(v) => set(s.key)(v)} accent={accent} />
        ))}
      </div>

      {count > 0 && (
        <div style={{
          marginTop: 16, background: `${accent}14`, border: `1px solid ${accent}40`,
          borderRadius: 12, padding: '10px 14px', textAlign: 'center',
          animation: 'ob-fadeIn 0.3s ease-out',
        }}>
          <p style={{ fontFamily: FONT, fontSize: 13, color: accent, margin: 0, fontWeight: 600 }}>
            {count} symptom{count > 1 ? 's' : ''} selected — our AI will factor these in
          </p>
        </div>
      )}
    </div>
  )
}

// ── Step 4: Lifestyle ──────────────────────────────────────────────────────
const Step4 = ({ data, set, errors, accent }) => (
  <div>
    <FieldGroup label="Exercise days per week">
      <RangeSlider value={data.exercise_days_per_week} onChange={set('exercise_days_per_week')}
        min={0} max={7} unit=" days" markers={['None', '2', '4', 'Daily']} accent={accent} />
    </FieldGroup>

    <FieldGroup label="Stress level">
      <RangeSlider value={data.stress_level} onChange={set('stress_level')}
        min={1} max={10} unit="/10" markers={['😌 Low', '😐 Mid', '😰 High']} accent={accent} />
    </FieldGroup>

    <FieldGroup label="Average sleep per night">
      <RangeSlider value={data.sleep_hours} onChange={set('sleep_hours')}
        min={2} max={14} step={0.5} unit="h" markers={['2h', '6h', '8h', '14h']} accent={accent} />
    </FieldGroup>

    <FieldGroup label="Diet type" error={errors.diet_type}>
      <PillSelect value={data.diet_type} onChange={set('diet_type')} cols={2} accent={accent}
        options={[
          { value: 'vegetarian',     label: 'Vegetarian',  emoji: '🥗' },
          { value: 'vegan',          label: 'Vegan',       emoji: '🌱' },
          { value: 'non-vegetarian', label: 'Non-Veg',     emoji: '🍗' },
          { value: 'mixed',          label: 'Mixed',       emoji: '🍱' },
        ]} />
    </FieldGroup>
  </div>
)

// ── Step 5: We're here to support you ──────────────────────────────────────
const SUPPORT_POINTS = [
  { emoji: '🔍', title: 'Analyze your cycle',     desc: 'Our AI reads your profile and symptoms to spot patterns early.' },
  { emoji: '📈', title: 'Keep a track record',     desc: 'Every cycle you log builds a clearer picture over time.' },
  { emoji: '🌙', title: 'Plan around your mood',   desc: 'Get suggestions that fit how you actually feel each day.' },
]

const Step5 = ({ accent }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: 60, height: 60, borderRadius: '50%',
      background: `${accent}1f`, border: `1px solid ${accent}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, margin: '0 auto 18px',
    }}>💛</div>

    <h2 style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: -0.3 }}>
      We're here to support you
    </h2>
    <p style={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, margin: '0 0 22px', lineHeight: 1.6 }}>
      You've shared what we need. From here, CycleWise can analyze your cycle, keep a record over time, and help you plan your days around your mood.
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {SUPPORT_POINTS.map((f) => (
        <div key={f.title} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
          padding: '13px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`,
        }}>
          <span style={{ fontSize: 21, flexShrink: 0, lineHeight: 1.3 }}>{f.emoji}</span>
          <div>
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>{f.title}</p>
            <p style={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, margin: '3px 0 0', lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ── Validation ─────────────────────────────────────────────────────────────
const validateStep = (step, data) => {
  const e = {}
  if (step === 1) {
    if (!data.age || +data.age < 10 || +data.age > 60)  e.age         = 'Enter age between 10–60'
    if (!data.weight_kg || +data.weight_kg < 30)         e.weight_kg   = 'Enter valid weight (kg)'
    if (!data.height_cm || +data.height_cm < 100)        e.height_cm   = 'Enter valid height (cm)'
    if (!data.waist_cm || +data.waist_cm < 40)           e.waist_cm    = 'Enter valid waist (cm)'
    if (!data.hip_cm || +data.hip_cm < 40)               e.hip_cm      = 'Enter valid hip (cm)'
    if (!data.bp_systolic || +data.bp_systolic < 70)     e.bp_systolic  = 'Enter systolic BP'
    if (!data.bp_diastolic || +data.bp_diastolic < 40)   e.bp_diastolic = 'Enter diastolic BP'
  }
  if (step === 2) {
    if (!data.cycle_regularity) e.cycle_regularity = 'Select cycle regularity'
    if (!data.last_period_date) e.last_period_date  = 'Select your last period date'
    if (!data.flow_intensity)   e.flow_intensity    = 'Select flow intensity'
  }
  if (step === 4) {
    if (!data.diet_type) e.diet_type = 'Select your diet type'
  }
  return e
}

// ── Main OnboardingPage ────────────────────────────────────────────────────
const OnboardingPage = () => {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [data, setData]       = useState(INITIAL)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const isSupportStep = step > STEPS.length
  const theme  = isSupportStep ? SUPPORT_THEME : STEP_THEMES[step - 1]
  const accent = theme.accent

  const set = (key) => (val) => {
    setData((p) => ({ ...p, [key]: val }))
    if (errors[key]) setErrors((p) => ({ ...p, [key]: null }))
  }

  const next = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => { setStep((s) => s - 1); setErrors({}) }

  const submit = async () => {
    const errs = validateStep(4, data)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await userAPI.submitOnboarding({
        ...data,
        age:                    parseInt(data.age),
        weight_kg:              parseFloat(data.weight_kg),
        height_cm:              parseFloat(data.height_cm),
        waist_cm:               parseFloat(data.waist_cm),
        hip_cm:                 parseFloat(data.hip_cm),
        bp_systolic:            parseInt(data.bp_systolic),
        bp_diastolic:           parseInt(data.bp_diastolic),
        avg_cycle_length:       parseInt(data.avg_cycle_length),
        avg_period_duration:    parseInt(data.avg_period_duration),
        exercise_days_per_week: parseInt(data.exercise_days_per_week),
        stress_level:           parseInt(data.stress_level),
        sleep_hours:            parseFloat(data.sleep_hours),
      })
      updateUser({ onboarding_completed: true })
      toast.success('Health profile saved! 🎉 Analyzing your cycle…')
      navigate('/pcos')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progress = (Math.min(step, STEPS.length) / STEPS.length) * 100

  return (
    <div style={{
      minHeight: '100dvh',
      background: theme.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px 40px',
      fontFamily: FONT,
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.5s ease',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: -100, right: -80,
        width: 400, height: 400,
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: -100, left: -80,
        width: 360, height: 360,
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.5s ease',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Top logo bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${accent}22`, border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🌸</div>
          <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>CycleWise</span>
        </div>

        {/* Step header — only for the 4 question steps */}
        {!isSupportStep && (
          <div key={`header-${step}`} style={{ marginBottom: 22, animation: 'ob-fadeUp 0.35s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 32 }}>{STEPS[step - 1].emoji}</span>
              <div>
                <h1 style={{
                  fontFamily: FONT, fontSize: 24, fontWeight: 800,
                  color: INK, margin: 0, letterSpacing: -0.3,
                }}>{STEPS[step - 1].title}</h1>
                <p style={{ fontFamily: FONT, fontSize: 13.5, color: MUTED, margin: 0 }}>
                  {STEPS[step - 1].subtitle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar + step indicators */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEPS.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: step >= s.id ? accent : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${step >= s.id ? accent : BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, fontSize: 11, fontWeight: 700,
                  color: step >= s.id ? '#061a16' : MUTED,
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}>{step > s.id ? '✓' : s.id}</div>
                {s.id < STEPS.length && (
                  <div style={{
                    height: 2, width: 40,
                    background: step > s.id ? accent : 'rgba(255,255,255,0.08)',
                    borderRadius: 99, transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>
          {/* Thin progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, ${accent}88, ${accent})`,
              borderRadius: 99, transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Card */}
        <div key={step} style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 22,
          padding: '22px 20px 24px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'ob-fadeUp 0.35s ease-out',
        }}>
          {step === 1 && <Step1 data={data} set={set} errors={errors} accent={accent} />}
          {step === 2 && <Step2 data={data} set={set} errors={errors} accent={accent} />}
          {step === 3 && <Step3 data={data} set={set} accent={accent} />}
          {step === 4 && <Step4 data={data} set={set} errors={errors} accent={accent} />}
          {step === 5 && <Step5 accent={accent} />}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {step > 1 && (
            <button onClick={back} disabled={loading} style={{
              flex: 1, padding: '13px 0',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${BORDER}`,
              borderRadius: 99, cursor: 'pointer',
              fontFamily: FONT, fontSize: 15, fontWeight: 600, color: INK,
              transition: 'border-color 0.2s',
            }}>← Back</button>
          )}
          {!isSupportStep
            ? (
              <button onClick={next} style={{
                flex: 2, padding: '13px 0',
                backgroundColor: accent, color: '#061a16',
                border: 'none', borderRadius: 99, cursor: 'pointer',
                fontFamily: FONT, fontSize: 15.5, fontWeight: 700, letterSpacing: 0.1,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >Continue →</button>
            ) : (
              <button onClick={submit} disabled={loading} style={{
                flex: 2, padding: '13px 0',
                backgroundColor: loading ? `${TEAL}80` : TEAL,
                color: '#061a16', border: 'none', borderRadius: 99,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: FONT, fontSize: 15.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}>
                {loading
                  ? <>
                      <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'ob-spin 0.8s linear infinite' }}>
                        <circle cx="8" cy="8" r="6" stroke="rgba(6,26,22,0.3)" strokeWidth="2.5" fill="none" />
                        <path d="M8 2 A6 6 0 0 1 14 8" stroke="#061a16" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      </svg>
                      Analyzing…
                    </>
                  : '🌸  Analyze My Cycle'
                }
              </button>
            )
          }
        </div>

        <p style={{
          textAlign: 'center', fontFamily: FONT,
          fontSize: 11.5, color: 'rgba(141,151,163,0.5)',
          marginTop: 14, lineHeight: 1.5,
        }}>
          Your data is private and encrypted — used only for AI health insights.
        </p>
      </div>

      <style>{`
        @keyframes ob-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ob-fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes ob-spin {
          to { transform: rotate(360deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        input::placeholder { color: rgba(141,151,163,0.45); }
        input:focus { outline: none; }
        input[type="range"] { -webkit-appearance: none; appearance: none; background: rgba(255,255,255,0.1); border-radius: 99px; height: 4px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--thumb-color, #2dd4bf); cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}

export default OnboardingPage