import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Inline styles matching CycleWise pink/peach palette ─── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#fdf5f7",
    minHeight: "100vh",
    paddingBottom: "3rem",
  },
  topBar: {
    background: "#fff",
    borderBottom: "0.5px solid #e8d5db",
    padding: "0.75rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "13px",
    color: "#a08090",
  },
  topBarLink: {
    color: "#c97da0",
    cursor: "pointer",
    textDecoration: "none",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  header: { padding: "2rem 2rem 1rem", maxWidth: "960px", margin: "0 auto" },
  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#f0e8f8",
    color: "#7c4da8",
    fontSize: "11px",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "0.75rem",
    letterSpacing: "0.02em",
  },
  aiBadgeDot: {
    width: "6px",
    height: "6px",
    background: "#9b5fcf",
    borderRadius: "50%",
  },
  h1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    color: "#3d1a2e",
    marginBottom: "0.3rem",
    fontWeight: 400,
  },
  h1Accent: { color: "#c97da0", fontStyle: "italic" },
  metaRow: {
    fontSize: "13px",
    color: "#a08090",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  phaseTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "#fff3e8",
    color: "#c97040",
    fontSize: "11px",
    fontWeight: 500,
    padding: "2px 8px",
    borderRadius: "12px",
  },
  tabBarWrapper: {
    borderBottom: "0.5px solid #e8d5db",
  },
  tabBar: {
    display: "flex",
    gap: "0.25rem",
    padding: "0 2rem 1.25rem",
    overflowX: "auto",
    maxWidth: "960px",
    margin: "0 auto",
  },
  tab: (active) => ({
    background: active ? "#f8eaf1" : "none",
    border: "none",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    color: active ? "#c97da0" : "#a08090",
    fontWeight: active ? 500 : 400,
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }),
  content: { padding: "1.5rem 2rem", maxWidth: "960px", margin: "0 auto" },

  /* AI Chat Strip */
  aiStrip: {
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "16px",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  aiStripHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#7c4da8",
  },
  aiAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#e8c8f5,#f5c8dc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  aiMessages: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxHeight: "220px",
    overflowY: "auto",
  },
  aiMsg: (role) => ({
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    background: role === "user" ? "#f8eaf1" : "#f5f0ff",
    color: role === "user" ? "#3d1a2e" : "#3d1a2e",
    borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    padding: "8px 14px",
    fontSize: "13px",
    maxWidth: "80%",
    lineHeight: 1.5,
  }),
  aiInputRow: {
    display: "flex",
    gap: "8px",
  },
  aiInput: {
    flex: 1,
    border: "0.5px solid #e0d0d8",
    borderRadius: "20px",
    padding: "8px 14px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    background: "#fdf5f7",
    color: "#3d1a2e",
    outline: "none",
  },
  aiSendBtn: (loading) => ({
    background: loading ? "#e0c8d8" : "#c97da0",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 18px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: loading ? "not-allowed" : "pointer",
  }),

  /* Section title */
  sectionTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "18px",
    color: "#3d1a2e",
    fontWeight: 400,
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  /* Cards grid */
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "16px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    transition: "box-shadow 0.15s",
  },
  cardEmoji: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#3d1a2e",
    margin: 0,
  },
  cardDesc: {
    fontSize: "13px",
    color: "#a08090",
    margin: 0,
    lineHeight: 1.5,
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: (type) => ({
    fontSize: "11px",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "20px",
    background: type === "include" ? "#eaf7f0" : "#fff0f3",
    color: type === "include" ? "#2a7a56" : "#b03060",
  }),
  tipChip: {
    fontSize: "12px",
    padding: "4px 12px",
    borderRadius: "20px",
    background: "#f5f0ff",
    color: "#7c4da8",
    fontWeight: 400,
  },

  /* Yoga / Exercise / Meditation list */
  listCard: {
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "16px",
    padding: "1.25rem",
    marginBottom: "1rem",
  },
  listRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "0.5px solid #f5eaef",
  },
  listIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  listTitle: { fontSize: "14px", fontWeight: 500, color: "#3d1a2e", margin: 0 },
  listSub: { fontSize: "12px", color: "#a08090", margin: "2px 0 0" },
  durationTag: {
    marginLeft: "auto",
    fontSize: "11px",
    background: "#fff3e8",
    color: "#c97040",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: 500,
    flexShrink: 0,
  },

  /* Disclaimer */
  disclaimer: {
    background: "#fffaeb",
    border: "0.5px solid #f5dfa0",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    fontSize: "12px",
    color: "#7a6010",
    lineHeight: 1.6,
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
};

/* ─── Static data (replace with API response) ─── */
const DIET_DATA = {
  pcos: [
    {
      emoji: "🥣",
      bg: "#eaf7f0",
      title: "Low GI Diet",
      desc: "Stabilises insulin levels and supports hormonal balance throughout your cycle.",
      include: ["Oats", "Brown rice", "Lentils", "Sweet potato", "Leafy greens"],
      avoid: ["White sugar", "Refined flour", "Packaged juices", "Deep-fried food"],
    },
    {
      emoji: "🫐",
      bg: "#f0e8f8",
      title: "Anti-inflammatory Foods",
      desc: "Reduces chronic inflammation associated with PCOS symptoms.",
      include: ["Berries", "Turmeric", "Fatty fish", "Walnuts", "Olive oil"],
      avoid: ["Trans fats", "Processed meats", "Excess dairy"],
    },
  ],
  general: [
    {
      emoji: "🥗",
      bg: "#fff3e8",
      title: "Balanced Diet",
      desc: "Support your cycle health with nutrient-dense whole foods every day.",
      include: ["Seasonal fruits", "Vegetables", "Lean proteins", "Whole grains"],
      avoid: ["Ultra-processed food", "Excess caffeine"],
    },
    {
      emoji: "💧",
      bg: "#e8f5ff",
      title: "Hydration",
      desc: "Staying well-hydrated eases bloating and supports nutrient absorption.",
      include: ["Water (2–3 L/day)", "Herbal teas", "Coconut water"],
      avoid: ["Sugary sodas", "Excess alcohol"],
    },
  ],
};

const EXERCISE_DATA = [
  { emoji: "🚶‍♀️", bg: "#eaf7f0", title: "Brisk Walking", sub: "Low-impact cardio, ideal every day", duration: "30 min" },
  { emoji: "🏋️‍♀️", bg: "#f5f0ff", title: "Strength Training", sub: "Improves insulin sensitivity", duration: "3×/week" },
  { emoji: "🤸‍♀️", bg: "#fff3e8", title: "Pilates", sub: "Core strength & hormonal support", duration: "20–30 min" },
  { emoji: "🚴‍♀️", bg: "#f0f8ff", title: "Cycling", sub: "Great cardio without joint stress", duration: "20 min" },
];

const YOGA_DATA = [
  { emoji: "🧘‍♀️", bg: "#f5f0ff", title: "Supta Baddha Konasana", sub: "Opens hips, calms the nervous system", duration: "5 min" },
  { emoji: "🌙", bg: "#fff3e8", title: "Viparita Karani", sub: "Legs-up-the-wall — reduces cortisol", duration: "5–10 min" },
  { emoji: "🌿", bg: "#eaf7f0", title: "Balasana (Child's Pose)", sub: "Stress relief and gentle hip stretch", duration: "3 min" },
  { emoji: "☀️", bg: "#fff8e8", title: "Surya Namaskar", sub: "Full-body flow, boosts metabolism", duration: "5–10 rounds" },
];

const MEDITATION_DATA = [
  { emoji: "🌬️", bg: "#f0e8f8", title: "Box Breathing", sub: "4-4-4-4 rhythm to calm the nervous system", duration: "5 min" },
  { emoji: "🎧", bg: "#e8f5ff", title: "Body Scan Meditation", sub: "Release physical tension from head to toe", duration: "10 min" },
  { emoji: "📓", bg: "#fff3e8", title: "Gratitude Journaling", sub: "Shifts focus, lowers stress hormones", duration: "5 min" },
  { emoji: "🔔", bg: "#eaf7f0", title: "Mindful Breathing", sub: "Observe breath without control — anchors presence", duration: "10 min" },
];

const TABS = [
  { id: "diet", label: "Diet", emoji: "🥗" },
  { id: "exercise", label: "Exercise", emoji: "🏃‍♀️" },
  { id: "yoga", label: "Yoga", emoji: "🧘‍♀️" },
  { id: "meditation", label: "Meditation", emoji: "🌿" },
];

/* ─── LLM Chat using Anthropic API ─── */
async function askLLM(messages, userProfile) {
  const systemPrompt = `You are a compassionate women's health assistant inside CycleWise, a cycle-tracking app.
The user is in their ${userProfile.phase || "Follicular"} phase (Day ${userProfile.cycleDay || 7}).
PCOS status: ${userProfile.pcosDetected ? "PCOS detected" : "Low PCOS risk (16%)"}.
BMI: ${userProfile.bmi || 22}. Stress level: ${userProfile.stressLevel || 5}/10.

Give personalised, empathetic, evidence-based advice about diet, exercise, yoga, or cycle health.
Keep responses concise (2-4 sentences). Use a warm, friendly tone. Do NOT diagnose or replace medical advice.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "I'm here to help! Could you rephrase that?";
}

/* ─── Sub-components ─── */
function DietSection({ pcosDetected }) {
  const recs = pcosDetected ? DIET_DATA.pcos : DIET_DATA.general;
  return (
    <>
      <p style={S.sectionTitle}>
        <span>🥗</span> Your personalised diet plan
      </p>
      <div style={S.cardGrid}>
        {recs.map((r) => (
          <div key={r.title} style={S.card}>
            <div style={{ ...S.cardEmoji, background: r.bg }}>{r.emoji}</div>
            <p style={S.cardTitle}>{r.title}</p>
            <p style={S.cardDesc}>{r.desc}</p>
            <div>
              <p style={{ fontSize: "11px", color: "#a08090", marginBottom: "5px", fontWeight: 500 }}>INCLUDE</p>
              <div style={S.chipRow}>
                {r.include.map((f) => (
                  <span key={f} style={S.chip("include")}>{f}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#a08090", marginBottom: "5px", fontWeight: 500 }}>AVOID</p>
              <div style={S.chipRow}>
                {r.avoid.map((f) => (
                  <span key={f} style={S.chip("avoid")}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ListSection({ title, emoji, data }) {
  return (
    <>
      <p style={S.sectionTitle}>
        <span>{emoji}</span> {title}
      </p>
      <div style={S.listCard}>
        {data.map((item, i) => (
          <div
            key={item.title}
            style={{ ...S.listRow, borderBottom: i === data.length - 1 ? "none" : S.listRow.borderBottom }}
          >
            <div style={{ ...S.listIcon, background: item.bg }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={S.listTitle}>{item.title}</p>
              <p style={S.listSub}>{item.sub}</p>
            </div>
            <span style={S.durationTag}>{item.duration}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AIChat({ userProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your CycleWise assistant 🌸 You're currently in your ${userProfile.phase || "Follicular"} phase. Ask me anything about your diet, exercise, or cycle health.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await askLLM(
        next.map((m) => ({ role: m.role, content: m.content })),
        userProfile
      );
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't connect right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.aiStrip}>
      <div style={S.aiStripHeader}>
        <div style={S.aiAvatar}>✨</div>
        Ask your AI health assistant
      </div>
      <div style={S.aiMessages}>
        {messages.map((m, i) => (
          <div key={i} style={S.aiMsg(m.role)}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={S.aiMsg("assistant")}>
            <span style={{ opacity: 0.6 }}>Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={S.aiInputRow}>
        <input
          style={S.aiInput}
          placeholder="e.g. What should I eat before a workout today?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button style={S.aiSendBtn(loading)} onClick={send} disabled={loading}>
          {loading ? "…" : "Ask ↗"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("diet");

  // Replace this with real data from your context/API
  const userProfile = {
    name: "Shalini",
    phase: "Follicular",
    cycleDay: 7,
    pcosDetected: false,
    bmi: 22,
    stressLevel: 5,
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={S.page}>
        {/* Top nav */}
        <div style={S.topBar}>
          <button style={S.topBarLink} onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <span style={{ color: "#d0b0be" }}>›</span>
          <span>My Recommendations</span>
        </div>

        {/* Header */}
        <div style={S.header}>
          <div style={S.aiBadge}>
            <span style={S.aiBadgeDot} />
            AI-Powered Recommendations
          </div>
          <h1 style={S.h1}>
            Your personalised <span style={S.h1Accent}>health plan</span>
          </h1>
          <div style={S.metaRow}>
            <span>Based on your cycle data & health profile</span>
            <span style={S.phaseTag}>🌱 Follicular Phase · Day {userProfile.cycleDay}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabBarWrapper}>
          <div style={S.tabBar}>
            {TABS.map((t) => (
              <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={S.content}>
          {/* AI Chat strip always visible */}
          <AIChat userProfile={userProfile} />

          {/* Tab content */}
          {activeTab === "diet" && <DietSection pcosDetected={userProfile.pcosDetected} />}
          {activeTab === "exercise" && (
            <ListSection title="Exercise recommendations" emoji="🏃‍♀️" data={EXERCISE_DATA} />
          )}
          {activeTab === "yoga" && (
            <ListSection title="Yoga for your phase" emoji="🧘‍♀️" data={YOGA_DATA} />
          )}
          {activeTab === "meditation" && (
            <ListSection title="Mindfulness & stress relief" emoji="🌿" data={MEDITATION_DATA} />
          )}

          {/* Disclaimer */}
          <div style={S.disclaimer}>
            <span style={{ fontSize: "16px" }}>⚕️</span>
            <span>
              <strong>Medical disclaimer:</strong> These recommendations are generated by AI as a
              wellness guide only — not medical advice. Always consult a qualified healthcare
              professional for diagnosis or treatment.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}