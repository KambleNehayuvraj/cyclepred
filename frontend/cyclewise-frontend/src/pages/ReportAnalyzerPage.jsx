import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/* ─── Styles ─── */
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
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  inner: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "2rem 2rem",
  },
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
    display: "inline-block",
  },
  h1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    color: "#3d1a2e",
    fontWeight: 400,
    marginBottom: "0.3rem",
  },
  h1Accent: { color: "#c97da0", fontStyle: "italic" },
  subtext: { fontSize: "13px", color: "#a08090", marginBottom: "2rem", lineHeight: 1.6 },

  /* Upload zone */
  uploadZone: (dragging, hasFile) => ({
    border: `1.5px dashed ${dragging ? "#c97da0" : hasFile ? "#6abf8e" : "#dcc0cc"}`,
    borderRadius: "20px",
    background: dragging ? "#fef0f5" : hasFile ? "#f0fbf5" : "#fff",
    padding: "3rem 2rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "1.5rem",
    position: "relative",
  }),
  uploadIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#fbeaf2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    fontSize: "26px",
  },
  uploadTitle: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#3d1a2e",
    marginBottom: "0.4rem",
  },
  uploadSub: { fontSize: "13px", color: "#a08090", marginBottom: "1rem" },
  browseBtn: {
    background: "#c97da0",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 22px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
  },
  fileTypes: {
    fontSize: "11px",
    color: "#c0a0b0",
    marginTop: "0.75rem",
  },

  /* Preview */
  previewRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "14px",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
  },
  previewThumb: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    objectFit: "cover",
    border: "0.5px solid #e8d5db",
  },
  previewThumbPdf: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    background: "#fbeaf2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  previewInfo: { flex: 1 },
  previewName: { fontSize: "14px", fontWeight: 500, color: "#3d1a2e", margin: 0 },
  previewSize: { fontSize: "12px", color: "#a08090", margin: "2px 0 0" },
  removeBtn: {
    background: "#fff0f3",
    color: "#b03060",
    border: "none",
    borderRadius: "10px",
    padding: "5px 12px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  analyzeBtn: (loading) => ({
    width: "100%",
    background: loading ? "#e0c0d0" : "linear-gradient(135deg, #c97da0, #d4649a)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px",
    fontSize: "15px",
    fontFamily: "'DM Serif Display', serif",
    fontWeight: 400,
    cursor: loading ? "not-allowed" : "pointer",
    letterSpacing: "0.01em",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }),

  /* Loading skeleton */
  skeleton: {
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "1.5rem",
  },
  skeletonLine: (w) => ({
    height: "12px",
    borderRadius: "6px",
    background: "linear-gradient(90deg, #f5e8ef 25%, #fdf0f5 50%, #f5e8ef 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    width: w,
    marginBottom: "10px",
  }),

  /* Results */
  resultSection: { marginBottom: "2rem" },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#a08090",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
  },
  severityCard: (sev) => ({
    background: sev === "normal"
      ? "#eaf7f0"
      : sev === "mild_concern"
      ? "#fffaeb"
      : "#fff0f3",
    border: `0.5px solid ${sev === "normal" ? "#a8dfc0" : sev === "mild_concern" ? "#f5dfa0" : "#f5b0c0"}`,
    borderRadius: "16px",
    padding: "1.25rem 1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  }),
  severityIcon: (sev) => ({
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: sev === "normal" ? "#d0f0e0" : sev === "mild_concern" ? "#faeac0" : "#fad0da",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  }),
  severityTitle: (sev) => ({
    fontSize: "16px",
    fontWeight: 500,
    color: sev === "normal" ? "#1a6040" : sev === "mild_concern" ? "#7a5010" : "#801030",
    margin: 0,
  }),
  severityDesc: {
    fontSize: "13px",
    color: "#a08090",
    margin: "3px 0 0",
  },
  severityBadge: (sev) => ({
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "20px",
    background: sev === "normal" ? "#c0ead0" : sev === "mild_concern" ? "#f5dfa0" : "#f5b0c0",
    color: sev === "normal" ? "#1a6040" : sev === "mild_concern" ? "#7a5010" : "#801030",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    flexShrink: 0,
  }),
  infoCard: {
    background: "#fff",
    border: "0.5px solid #e8d5db",
    borderRadius: "16px",
    padding: "1.25rem 1.5rem",
    marginBottom: "1rem",
  },
  infoCardTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#3d1a2e",
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  findingRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "7px 0",
    borderBottom: "0.5px solid #f5eaef",
    fontSize: "14px",
    color: "#3d1a2e",
    lineHeight: 1.5,
  },
  findingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#c97da0",
    marginTop: "6px",
    flexShrink: 0,
  },
  recRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "7px 0",
    borderBottom: "0.5px solid #f5eaef",
    fontSize: "14px",
    color: "#3d1a2e",
    lineHeight: 1.5,
  },
  recNum: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#f8eaf1",
    color: "#c97da0",
    fontSize: "11px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  explanationBox: {
    background: "#f8f0ff",
    border: "0.5px solid #dcc8f0",
    borderRadius: "14px",
    padding: "1rem 1.25rem",
    fontSize: "14px",
    color: "#4a2a6a",
    lineHeight: 1.7,
    marginBottom: "1rem",
  },
  reportTypePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fbeaf2",
    color: "#c97da0",
    fontSize: "13px",
    fontWeight: 500,
    padding: "5px 14px",
    borderRadius: "20px",
    marginBottom: "1.25rem",
  },
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
    marginTop: "1.5rem",
  },
  newAnalysisBtn: {
    background: "#fff",
    color: "#c97da0",
    border: "1px solid #e0c0d0",
    borderRadius: "14px",
    padding: "11px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    marginTop: "0.75rem",
  },
};

/* ─── Helpers ─── */
const SEVERITY_META = {
  normal: { icon: "✅", label: "Normal", title: "Everything looks good" },
  mild_concern: { icon: "⚠️", label: "Mild Concern", title: "Some values need attention" },
  high_concern: { icon: "🔴", label: "High Concern", title: "Please consult a doctor soon" },
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/* ─── Skeleton loader ─── */
function Skeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={S.skeleton}>
        <div style={S.skeletonLine("40%")} />
        <div style={S.skeletonLine("70%")} />
        <div style={S.skeletonLine("55%")} />
        <div style={{ ...S.skeletonLine("80%"), marginTop: "1.5rem" }} />
        <div style={S.skeletonLine("65%")} />
        <div style={S.skeletonLine("72%")} />
      </div>
    </>
  );
}

/* ─── Results view ─── */
function Results({ data, onReset }) {
  const sev = data.severity || "normal";
  const meta = SEVERITY_META[sev] || SEVERITY_META.normal;

  return (
    <div style={S.resultSection}>
      {/* Report type */}
      <div style={S.reportTypePill}>
        🧾 {data.report_type || "Medical Report"}
      </div>

      {/* Severity card */}
      <div style={S.severityCard(sev)}>
        <div style={S.severityIcon(sev)}>{meta.icon}</div>
        <div>
          <p style={S.severityTitle(sev)}>{meta.title}</p>
          <p style={S.severityDesc}>Based on your uploaded report</p>
        </div>
        <span style={S.severityBadge(sev)}>{meta.label}</span>
      </div>

      {/* Explanation */}
      {data.explanation && (
        <>
          <p style={S.sectionLabel}>AI Summary</p>
          <div style={S.explanationBox}>
            {data.explanation}
          </div>
        </>
      )}

      {/* Findings */}
      {data.findings?.length > 0 && (
        <div style={S.infoCard}>
          <div style={S.infoCardTitle}>
            <span>🔬</span> Key Findings
          </div>
          {data.findings.map((f, i) => (
            <div
              key={i}
              style={{
                ...S.findingRow,
                borderBottom: i === data.findings.length - 1 ? "none" : S.findingRow.borderBottom,
              }}
            >
              <div style={S.findingDot} />
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div style={S.infoCard}>
          <div style={S.infoCardTitle}>
            <span>💊</span> Recommendations
          </div>
          {data.recommendations.map((r, i) => (
            <div
              key={i}
              style={{
                ...S.recRow,
                borderBottom: i === data.recommendations.length - 1 ? "none" : S.recRow.borderBottom,
              }}
            >
              <div style={S.recNum}>{i + 1}</div>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={S.disclaimer}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>⚕️</span>
        <span>
          <strong>Medical disclaimer:</strong> This AI analysis is a screening aid only — not a
          medical diagnosis. Always consult a qualified healthcare professional for interpretation
          of your reports and treatment decisions.
        </span>
      </div>

      <button style={S.newAnalysisBtn} onClick={onReset}>
        ↩ Analyse another report
      </button>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReportAnalyzerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    setError(null);
    setFile(f);
    setResult(null);
    if (f.type !== "application/pdf") {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      handleFile(dropped);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("cw_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/predict/report-analysis`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const isPdf = file?.type === "application/pdf";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={S.page}>
        {/* Top nav */}
        <div style={S.topBar}>
          <button style={S.topBarLink} onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <span style={{ color: "#d0b0be" }}>›</span>
          <span>Report Analysis</span>
        </div>

        <div style={S.inner}>
          {/* Header */}
          <div style={S.aiBadge}>
            <span style={S.aiBadgeDot} />
            AI-Powered Report Screening
          </div>
          <h1 style={S.h1}>
            Upload your{" "}
            <span style={S.h1Accent}>lab report</span>
          </h1>
          <p style={S.subtext}>
            Upload a blood test, hormonal panel, or scan report. Our AI will extract key findings
            and provide easy-to-understand insights personalised to your health profile.
          </p>

          {!result ? (
            <>
              {/* Drop zone */}
              {!file && (
                <div
                  style={S.uploadZone(dragging, false)}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={S.uploadIcon}>
                    {dragging ? "📂" : "🧾"}
                  </div>
                  <p style={S.uploadTitle}>
                    {dragging ? "Drop your report here" : "Drag & drop your report"}
                  </p>
                  <p style={S.uploadSub}>or click to browse from your device</p>
                  <button
                    style={S.browseBtn}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Browse files
                  </button>
                  <p style={S.fileTypes}>Supported: JPG, PNG, PDF · Max 10 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              )}

              {/* File preview row */}
              {file && (
                <div style={S.previewRow}>
                  {isPdf ? (
                    <div style={S.previewThumbPdf}>📄</div>
                  ) : (
                    <img src={preview} alt="report preview" style={S.previewThumb} />
                  )}
                  <div style={S.previewInfo}>
                    <p style={S.previewName}>{file.name}</p>
                    <p style={S.previewSize}>{formatBytes(file.size)}</p>
                  </div>
                  <button style={S.removeBtn} onClick={reset}>Remove</button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p style={{ color: "#b03060", fontSize: "13px", marginBottom: "1rem" }}>
                  ⚠️ {error}
                </p>
              )}

              {/* Analyse button */}
              {file && (
                <button style={S.analyzeBtn(loading)} onClick={analyze} disabled={loading}>
                  {loading ? (
                    <>
                      <span style={{ fontSize: "16px" }}>⏳</span> Analysing your report…
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "16px" }}>🔬</span> Analyse Report
                    </>
                  )}
                </button>
              )}

              {/* Loading skeleton */}
              {loading && <Skeleton />}

              {/* What we analyse info */}
              {!file && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {[
                    { icon: "🩸", title: "Blood panels", desc: "CBC, hormones, thyroid, insulin" },
                    { icon: "📊", title: "Hormone reports", desc: "LH, FSH, estrogen, testosterone" },
                    { icon: "🖼️", title: "Scan reports", desc: "Ultrasound findings, notes" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        background: "#fff",
                        border: "0.5px solid #e8d5db",
                        borderRadius: "14px",
                        padding: "1rem",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "0.5rem" }}>{item.icon}</div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#3d1a2e", margin: "0 0 4px" }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#a08090", margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Results data={result} onReset={reset} />
          )}
        </div>
      </div>
    </>
  );
}