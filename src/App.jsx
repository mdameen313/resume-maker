import { useState, useRef } from "react";


// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = "AIzaSyBDERnPZJSB0OaPIJtCQM3JDFEwjSowru8"; 

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "nithin",
    name: "Classic ATS",
    desc: "Compact, recruiter-proven single-column layout",
    accent: "#000",
    subColor: "#333",
    divider: "1.5px solid #000",
    headerAlign: "left",
    nameBold: true,
  },
  {
    id: "modern",
    name: "Modern Pro",
    desc: "Navy header band, clean white body",
    accent: "#0f4c75",
    subColor: "#0f4c75",
    divider: "2px solid #0f4c75",
    headerAlign: "left",
    headerBg: "#0f4c75",
    headerText: "#fff",
    nameBold: true,
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Tinted header, purple accents, senior-feel",
    accent: "#5b21b6",
    subColor: "#7c3aed",
    divider: "2px solid #5b21b6",
    headerBg: "#f5f3ff",
    headerBorder: "3px solid #5b21b6",
    headerAlign: "left",
    nameBold: true,
  },
  {
    id: "minimal",
    name: "Ultra Minimal",
    desc: "Serif typeface, generous whitespace",
    accent: "#444",
    subColor: "#666",
    divider: "1px solid #bbb",
    headerAlign: "center",
    serif: true,
    nameBold: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEPS  (Projects & Certifications added to match Nithin's resume)
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "personal",      label: "Personal Info",    icon: "👤" },
  { id: "education",     label: "Education",        icon: "🎓" },
  { id: "skills",        label: "Technical Skills", icon: "⚡" },
  { id: "projects",      label: "Projects",         icon: "🚀" },
  { id: "certifications",label: "Certifications",   icon: "🏅" },
  { id: "strengths",     label: "Key Strengths",    icon: "💪" },
  { id: "experience",    label: "Experience",       icon: "💼" },
  { id: "preview",       label: "Preview & Export", icon: "📄" },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI SUMMARY  — uses the baked-in key, no user prompt
// ─────────────────────────────────────────────────────────────────────────────
async function generateSummaryAI(data) {
  const projectList = (data.projects || []).map(p => p.name).filter(Boolean).join(", ");
  const certList    = (data.certifications || []).map(c => c.name).filter(Boolean).join(", ");
  const prompt = `You are a professional resume writer. Write a concise 3–4 sentence Professional Summary for this candidate's resume:

Name: ${data.name}
Role/Title: ${data.title}
Education: ${(data.education || []).map(e => `${e.degree} at ${e.institution}`).join("; ")}
Skills: ${data.skills}
Projects: ${projectList}
Certifications: ${certList}
Key Strengths: ${(data.strengths || []).map(s => s.title).filter(Boolean).join(", ")}

Instructions:
- Write in third person or noun-phrase style (no "I")
- Lead with the candidate's academic stage and domain focus
- Mention 2–3 specific technical strengths with real skill names
- Reference notable achievements (publications, patents, certifications) if present
- End with what they bring to teams / career goal
- NEVER use: results-driven, dynamic, passionate, hardworking, motivated, team player
- Output ONLY the summary paragraph — no labels, no bullets, no explanation`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
      }),
    }
  );
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME DOCUMENT RENDERER
// This is the actual A4 sheet — 4 template variants
// ─────────────────────────────────────────────────────────────────────────────
function ResumeDocument({ data, template }) {
  const T = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const ff = T.serif ? "'Georgia', 'Times New Roman', serif" : "'Arial', 'Helvetica', sans-serif";

  // ── Section header rule (same as Nithin's horizontal line style) ──────────
  const Sec = ({ title }) => (
    <div style={{ marginTop: 13, marginBottom: 5 }}>
      <div style={{
        fontSize: "9.5pt", fontWeight: 700, letterSpacing: "0.05em",
        textTransform: "uppercase", color: T.accent,
        borderBottom: T.divider, paddingBottom: 2,
      }}>
        {title}
      </div>
    </div>
  );

  // ── Contact row ───────────────────────────────────────────────────────────
  const contactItems = [
    data.phone, data.email,
    data.linkedin || null,
    data.github   || null,
    data.location || null,
  ].filter(Boolean);

  const isModern    = template === "modern";
  const isExecutive = template === "executive";
  const isMinimal   = template === "minimal";

  const headerPad  = isModern ? "18px 24px 16px" : "20px 24px 14px";
  const headerBg   = T.headerBg   || "transparent";
  const headerText = T.headerText || "#111";
  const headerBorderBottom = isExecutive ? T.headerBorder
    : isModern ? "none" : "none";

  // Skills: Nithin uses category: items  style
  const skillLines = (data.skills || "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return (
    <div style={{
      width: "210mm", minHeight: "297mm", background: "#fff",
      fontFamily: ff, fontSize: "9.5pt", lineHeight: 1.45,
      color: "#1a1a1a", boxSizing: "border-box",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: headerBg, padding: headerPad,
        borderBottom: headerBorderBottom,
        textAlign: T.headerAlign || "left",
      }}>
        <div style={{
          fontSize: isModern ? "20pt" : "18pt",
          fontWeight: T.nameBold ? 700 : 400,
          color: headerText,
          letterSpacing: isMinimal ? "0.06em" : "-0.01em",
          lineHeight: 1.1,
        }}>
          {data.name || "Your Name"}
        </div>
        {data.title && (
          <div style={{
            fontSize: "10pt", marginTop: 2,
            color: isModern ? "rgba(255,255,255,0.8)" : T.subColor,
            fontStyle: isMinimal ? "italic" : "normal",
            fontWeight: 400,
          }}>
            {data.title}
          </div>
        )}
        <div style={{
          marginTop: 6, fontSize: "8pt",
          color: isModern ? "rgba(255,255,255,0.7)" : "#555",
          display: "flex", flexWrap: "wrap",
          justifyContent: isMinimal ? "center" : "flex-start",
          gap: 0,
        }}>
          {contactItems.map((item, i) => (
            <span key={i}>
              {item}
              {i < contactItems.length - 1 && (
                <span style={{ margin: "0 7px", opacity: 0.45 }}>◆</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "2px 24px 24px" }}>

        {/* Education */}
        {(data.education || []).some(e => e.degree || e.institution) && (
          <>
            <Sec title="Education" />
            {(data.education || []).map((e, i) => (e.degree || e.institution) && (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{e.institution}</span>
                  <span style={{ fontSize: "8.5pt", color: "#555" }}>{e.location}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "9pt", fontStyle: "italic", color: T.subColor }}>{e.degree}</span>
                  <span style={{ fontSize: "8.5pt", color: "#555" }}>
                    {e.start && e.end ? `${e.start} – ${e.end}` : e.year || ""}
                  </span>
                </div>
                {e.gpa && <div style={{ fontSize: "8.5pt", color: "#666" }}>GPA: {e.gpa}</div>}
              </div>
            ))}
          </>
        )}

        {/* Technical Skills — category: items format */}
        {data.skills && (
          <>
            <Sec title="Technical Skills" />
            <div style={{ fontSize: "9pt", lineHeight: 1.6 }}>
              {skillLines.map((line, i) => {
                const colonIdx = line.indexOf(":");
                if (colonIdx !== -1) {
                  const cat = line.slice(0, colonIdx + 1).trim();
                  const val = line.slice(colonIdx + 1).trim();
                  return (
                    <div key={i}>
                      <span style={{ fontWeight: 700 }}>{cat}</span>
                      {" "}{val}
                    </div>
                  );
                }
                return <div key={i}>{line}</div>;
              })}
            </div>
          </>
        )}

        {/* Projects */}
        {(data.projects || []).some(p => p.name) && (
          <>
            <Sec title="Projects & Research" />
            {(data.projects || []).map((p, i) => p.name && (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>
                    {p.name}
                    {p.tech && (
                      <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>
                        {" "}| {p.tech}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "8.5pt", color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>
                    {p.badge || p.date}
                  </span>
                </div>
                {p.bullets && (
                  <ul style={{ margin: "3px 0 0", paddingLeft: 15 }}>
                    {p.bullets.split("\n").filter(Boolean).map((b, j) => (
                      <li key={j} style={{ fontSize: "9pt", color: "#222", marginBottom: 1.5, lineHeight: 1.4 }}>
                        {b.replace(/^[-•]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {/* Certifications */}
        {(data.certifications || []).some(c => c.name) && (
          <>
            <Sec title="Certifications" />
            {(data.certifications || []).map((c, i) => c.name && (
              <div key={i} style={{ marginBottom: 5, fontSize: "9pt" }}>
                <span style={{ fontWeight: 700 }}>{c.name}</span>
                {c.description && (
                  <span style={{ color: "#555" }}>: {c.description}</span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Key Strengths */}
        {(data.strengths || []).some(s => s.title) && (
          <>
            <Sec title="Key Strengths" />
            {(data.strengths || []).map((s, i) => s.title && (
              <div key={i} style={{ marginBottom: 4, fontSize: "9pt" }}>
                <span style={{ fontWeight: 700 }}>{s.title}</span>
                {s.description && <span style={{ color: "#333" }}>: {s.description}</span>}
              </div>
            ))}
          </>
        )}

        {/* Work Experience */}
        {(data.experience || []).some(e => e.title || e.company) && (
          <>
            <Sec title="Work Experience" />
            {(data.experience || []).map((exp, i) => (exp.title || exp.company) && (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{exp.title}</span>
                  <span style={{ fontSize: "8.5pt", color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>
                    {exp.start}{exp.start && exp.end ? " – " : ""}{exp.end}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "9pt", color: T.subColor, fontStyle: "italic" }}>{exp.company}</span>
                  {exp.location && <span style={{ fontSize: "8.5pt", color: "#777" }}>{exp.location}</span>}
                </div>
                {exp.bullets && (
                  <ul style={{ margin: "3px 0 0", paddingLeft: 15 }}>
                    {exp.bullets.split("\n").filter(Boolean).map((b, j) => (
                      <li key={j} style={{ fontSize: "9pt", color: "#222", marginBottom: 1.5, lineHeight: 1.4 }}>
                        {b.replace(/^[-•]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {/* Languages */}
        {data.languages && (
          <>
            <Sec title="Languages" />
            <div style={{ fontSize: "9pt" }}>{data.languages}</div>
          </>
        )}

        {/* Professional Summary — last section, like Nithin's */}
        {data.summary && (
          <>
            <Sec title="Professional Summary" />
            <p style={{ margin: 0, fontSize: "9pt", color: "#222", lineHeight: 1.55 }}>
              {data.summary}
            </p>
          </>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const iS = {
  width: "100%", background: "#0c0f15", border: "1px solid #1e2a3a",
  borderRadius: 7, color: "#dde3ec", padding: "8px 12px", fontSize: 13,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical",
};

function Input({ label, value, onChange, placeholder, type = "text", rows, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "#7a90a8", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={iS} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iS} />
      }
      {hint && <div style={{ fontSize: 10.5, color: "#4a6080", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function Btn({ children, onClick, v = "primary", disabled, sm, full, loading }) {
  const vs = {
    primary: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff" },
    secondary: { background: "#151c27", color: "#7a90a8", border: "1px solid #1e2a3a" },
    ghost: { background: "transparent", color: "#6366f1", border: "1px solid #4f46e5" },
    danger: { background: "#200f0f", color: "#f87171" },
    green: { background: "linear-gradient(135deg,#065f46,#059669)", color: "#fff" },
    dark: { background: "#0c0f15", color: "#94a3b8", border: "1px solid #1e2a3a" },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      border: "none", borderRadius: 7,
      padding: sm ? "5px 13px" : "9px 20px",
      fontSize: sm ? 11.5 : 13.5, fontWeight: 600,
      cursor: (disabled || loading) ? "not-allowed" : "pointer",
      opacity: (disabled || loading) ? 0.55 : 1,
      fontFamily: "inherit", whiteSpace: "nowrap",
      width: full ? "100%" : "auto",
      display: full ? "block" : "inline-block",
      ...vs[v],
    }}>
      {loading ? "⏳ Please wait..." : children}
    </button>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#151c27", border: "1px solid #1e2a3a", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#94a3b8", margin: "3px 4px 3px 0" }}>
      {label}
      <span onClick={onRemove} style={{ cursor: "pointer", color: "#6366f1", fontWeight: 700, fontSize: 13, lineHeight: 1 }}>×</span>
    </span>
  );
}

function SL({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 18, marginBottom: 8, paddingTop: 14, borderTop: "1px solid #151c27" }}>{children}</div>;
}

function Card({ children, style }) {
  return <div style={{ background: "#0c0f15", border: "1px solid #1e2a3a", borderRadius: 9, padding: 14, marginBottom: 14, ...style }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const emptyExp  = () => ({ title: "", company: "", location: "", start: "", end: "Present", bullets: "" });
const emptyEdu  = () => ({ degree: "", institution: "", location: "", start: "", end: "", year: "", gpa: "" });
const emptyProj = () => ({ name: "", tech: "", date: "", badge: "", bullets: "" });
const emptyCert = () => ({ name: "", description: "" });
const emptyStr  = () => ({ title: "", description: "" });

function App() {
  const [phase, setPhase]   = useState("template");
  const [tmpl, setTmpl]     = useState("nithin");
  const [step, setStep]     = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone,    setAiDone]    = useState(false);
  const [aiError,   setAiError]   = useState("");
  const resumeRef = useRef(null);

  const [d, setD] = useState({
    name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "",
    summary: "",
    education:      [emptyEdu()],
    skills:         "",
    projects:       [emptyProj()],
    certifications: [emptyCert()],
    strengths:      [emptyStr()],
    experience:     [],
    languages:      "",
  });

  const set  = f  => v  => setD(x => ({ ...x, [f]: v }));
  const setA = (f, i, k) => v => setD(x => {
    const arr = [...x[f]]; arr[i] = { ...arr[i], [k]: v }; return { ...x, [f]: arr };
  });
  const addA = (f, empty) => () => setD(x => ({ ...x, [f]: [...x[f], empty()] }));
  const remA = (f, i)     => ()  => setD(x => ({ ...x, [f]: x[f].filter((_, j) => j !== i) }));

  // ── Auto-generate summary when entering preview ────────────────────────
  const enterPreview = async () => {
    setPhase("preview");
    if (d.summary || aiDone) return;
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      setAiError("Add your API key at the top of the file to enable AI summary generation.");
      return;
    }
    setAiLoading(true); setAiError("");
    try {
      const s = await generateSummaryAI(d);
      setD(x => ({ ...x, summary: s }));
      setAiDone(true);
    } catch (e) {
      setAiError("AI error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ── PDF download via print window ─────────────────────────────────────
  const downloadPDF = () => {
    const w = window.open("", "_blank");
    const h = resumeRef.current?.innerHTML;
    if (!h || !w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${d.name || "Resume"}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}
@page{size:A4;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head><body>${h}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  };

  // ─────────────────────────────────────────────────────────────────────
  // TEMPLATE PICKER
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "template") {
    return (
      <div style={APP}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "#6366f1", textTransform: "uppercase", marginBottom: 10 }}>
              ATS Resume Builder
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#eef2f8", margin: 0, lineHeight: 1.1 }}>
              Choose your template
            </h1>
            <p style={{ color: "#4a6080", marginTop: 10, fontSize: 14 }}>
              All templates are ATS-safe, render in-browser, export as PDF
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => setTmpl(t.id)} style={{
                background: tmpl === t.id ? "#0e1520" : "#090d13",
                border: `2px solid ${tmpl === t.id ? "#6366f1" : "#1a2232"}`,
                borderRadius: 11, padding: 18, cursor: "pointer", transition: "all 0.15s",
              }}>
                {/* mini paper mockup */}
                <div style={{ background: "#fff", borderRadius: 5, padding: "9px 11px", marginBottom: 11, height: 72, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1.5px solid ${t.accent}`, paddingBottom: 3, marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 7.5, color: t.accent, textTransform: "uppercase" }}>YOUR NAME</div>
                    <div style={{ fontSize: 6, color: "#999", marginTop: 1 }}>email · phone</div>
                  </div>
                  {["Education", "Technical Skills", "Projects"].map((sec, si) => (
                    <div key={si} style={{ marginBottom: 3 }}>
                      <div style={{ fontSize: 5.5, fontWeight: 700, color: t.accent, borderBottom: `0.5px solid ${t.accent}`, marginBottom: 1, textTransform: "uppercase" }}>{sec}</div>
                      <div style={{ height: 2.5, background: "#eee", borderRadius: 1, width: `${75 - si * 12}%` }} />
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight: 700, color: "#dde3ec", fontSize: 13, marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: "#4a6080" }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Btn onClick={() => setPhase("form")}>
              Start with {TEMPLATES.find(t => t.id === tmpl)?.name} →
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // FORM PHASE
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "form") {
    const s = STEPS[step];

    const body = () => {
      switch (s.id) {
        // ── Personal ─────────────────────────────────────────────────
        case "personal": return (
          <div>
            <Input label="Full Name *" value={d.name} onChange={set("name")} placeholder="Nithin Kumar S" />
            <Input label="Professional Title" value={d.title} onChange={set("title")} placeholder="Backend Developer · Computer Science Student" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Phone" value={d.phone} onChange={set("phone")} placeholder="+91 70192 43498" />
              <Input label="Email" value={d.email} onChange={set("email")} placeholder="you@gmail.com" />
            </div>
            <Input label="LinkedIn (full URL or handle)" value={d.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/yourname" />
            <Input label="GitHub" value={d.github} onChange={set("github")} placeholder="github.com/yourname" />
            <Input label="Location" value={d.location} onChange={set("location")} placeholder="Bengaluru, India" />
          </div>
        );

        // ── Education ────────────────────────────────────────────────
        case "education": return (
          <div>
            {d.education.map((e, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8" }}>Education #{i + 1}</span>
                  {d.education.length > 1 && <Btn v="danger" sm onClick={remA("education", i)}>✕</Btn>}
                </div>
                <Input label="Institution" value={e.institution} onChange={setA("education", i, "institution")} placeholder="The Oxford College of Engineering" />
                <Input label="Degree / Programme" value={e.degree} onChange={setA("education", i, "degree")} placeholder="Bachelor of Engineering in Computer Science" />
                <Input label="Location" value={e.location} onChange={setA("education", i, "location")} placeholder="Bengaluru, India" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Input label="Start" value={e.start} onChange={setA("education", i, "start")} placeholder="Sep 2023" />
                  <Input label="End / Expected" value={e.end} onChange={setA("education", i, "end")} placeholder="Aug 2027" />
                  <Input label="GPA (opt)" value={e.gpa} onChange={setA("education", i, "gpa")} placeholder="8.7 / 10" />
                </div>
              </Card>
            ))}
            <Btn v="ghost" onClick={addA("education", emptyEdu)}>+ Add Education</Btn>
          </div>
        );

        // ── Skills ───────────────────────────────────────────────────
        case "skills": return (
          <div>
            <Input
              label="Technical Skills"
              value={d.skills}
              onChange={set("skills")}
              rows={9}
              placeholder={`Backend & APIs: Node.js, Express.js, RESTful APIs, Microservices\nLanguages: JavaScript, TypeScript, Python, Java, C, C++\nDatabases: MongoDB, PostgreSQL, MySQL, Redis\nCloud & Infrastructure: AWS, Docker, Distributed Systems\nAI/ML: Machine Learning, LLM Integration, Groq, Mixtral\nTools & Frameworks: Git, Linux, React, Next.js, CI/CD`}
              hint="Format: Category: skill1, skill2  — one category per line. Each category:items pair renders in bold + normal text like Nithin's resume."
            />
          </div>
        );

        // ── Projects ─────────────────────────────────────────────────
        case "projects": return (
          <div>
            {d.projects.map((p, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8" }}>Project #{i + 1}</span>
                  {d.projects.length > 1 && <Btn v="danger" sm onClick={remA("projects", i)}>✕</Btn>}
                </div>
                <Input label="Project Name *" value={p.name} onChange={setA("projects", i, "name")} placeholder="AI-Driven Investment Advisor Chatbot" />
                <Input label="Tech Stack" value={p.tech} onChange={setA("projects", i, "tech")} placeholder="Next.js, Node.js, TypeScript, Groq AI, REST APIs" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="Date / Period" value={p.date} onChange={setA("projects", i, "date")} placeholder="Dec 2024" />
                  <Input label="Badge / Status" value={p.badge} onChange={setA("projects", i, "badge")} placeholder="Patent Filed  /  IEEE Published" hint="Shows right-aligned next to the name" />
                </div>
                <Input label="Bullet Points (one per line)" value={p.bullets} onChange={setA("projects", i, "bullets")} rows={4}
                  placeholder="Architected full-stack system with Node.js backend for financial guidance&#10;Designed REST API with 99.9% uptime and secure authentication&#10;Built PDF export, session management, anomaly detection" />
              </Card>
            ))}
            <Btn v="ghost" onClick={addA("projects", emptyProj)}>+ Add Project</Btn>
          </div>
        );

        // ── Certifications ───────────────────────────────────────────
        case "certifications": return (
          <div>
            {d.certifications.map((c, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8" }}>Certification #{i + 1}</span>
                  {d.certifications.length > 1 && <Btn v="danger" sm onClick={remA("certifications", i)}>✕</Btn>}
                </div>
                <Input label="Certification Name" value={c.name} onChange={setA("certifications", i, "name")} placeholder="AWS APAC Solutions Architecture Job Simulation" />
                <Input label="Brief Description" value={c.description} onChange={setA("certifications", i, "description")}
                  placeholder="Cloud architecture, distributed systems, infrastructure design, scalability" rows={2} />
              </Card>
            ))}
            <Btn v="ghost" onClick={addA("certifications", emptyCert)}>+ Add Certification</Btn>
          </div>
        );

        // ── Key Strengths ────────────────────────────────────────────
        case "strengths": return (
          <div>
            <div style={{ fontSize: 12, color: "#4a6080", marginBottom: 14 }}>
              These render as <strong style={{ color: "#7a90a8" }}>Bold Title: description</strong> lines — great for soft/meta skills like Nithin's "System Architecture", "API Development", etc.
            </div>
            {d.strengths.map((s, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8" }}>Strength #{i + 1}</span>
                  {d.strengths.length > 1 && <Btn v="danger" sm onClick={remA("strengths", i)}>✕</Btn>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                  <Input label="Title" value={s.title} onChange={setA("strengths", i, "title")} placeholder="System Architecture" />
                  <Input label="One-line description" value={s.description} onChange={setA("strengths", i, "description")} placeholder="Experience designing scalable, reliable backend systems focused on performance" />
                </div>
              </Card>
            ))}
            <Btn v="ghost" onClick={addA("strengths", emptyStr)}>+ Add Strength</Btn>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a2232" }}>
              <Input label="Languages (optional)" value={d.languages} onChange={set("languages")}
                placeholder="English (Full Professional), Kannada (Native), Hindi, Tamil (Working Proficiency)" />
            </div>
          </div>
        );

        // ── Experience ───────────────────────────────────────────────
        case "experience": return (
          <div>
            <div style={{ fontSize: 12, color: "#4a6080", marginBottom: 12 }}>
              Optional — skip if you only have projects (like Nithin's resume).
            </div>
            {d.experience.length === 0 && (
              <Btn v="ghost" onClick={addA("experience", emptyExp)}>+ Add Work Experience</Btn>
            )}
            {d.experience.map((e, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8" }}>Role #{i + 1}</span>
                  <Btn v="danger" sm onClick={remA("experience", i)}>✕ Remove</Btn>
                </div>
                <Input label="Job Title" value={e.title} onChange={setA("experience", i, "title")} placeholder="Software Engineer Intern" />
                <Input label="Company" value={e.company} onChange={setA("experience", i, "company")} placeholder="Infosys" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Input label="Location" value={e.location} onChange={setA("experience", i, "location")} placeholder="Remote" />
                  <Input label="Start" value={e.start} onChange={setA("experience", i, "start")} placeholder="Jun 2024" />
                  <Input label="End" value={e.end} onChange={setA("experience", i, "end")} placeholder="Present" />
                </div>
                <Input label="Achievements (one per line)" value={e.bullets} onChange={setA("experience", i, "bullets")} rows={4}
                  placeholder="Built REST APIs serving 500k+ daily requests&#10;Reduced DB query time by 35% with indexing" />
              </Card>
            ))}
            {d.experience.length > 0 && (
              <Btn v="ghost" onClick={addA("experience", emptyExp)}>+ Add Another Role</Btn>
            )}
          </div>
        );

        // ── Preview gate ──────────────────────────────────────────────
        case "preview": return (
          <div>
            <Card style={{ border: "1px solid #1e3a1e" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", marginBottom: 8 }}>✅ All set!</div>
              <div style={{ fontSize: 12.5, color: "#7a90a8", lineHeight: 1.6 }}>
                Clicking below will open the full A4 preview.
                {GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE"
                  ? " Your Professional Summary will be auto-generated by Claude AI."
                  : " Add your API key to the top of the file to enable AI summary generation."}
              </div>
            </Card>
            <Btn full onClick={enterPreview}>🚀 Generate &amp; Preview Resume →</Btn>
          </div>
        );

        default: return null;
      }
    };

    return (
      <div style={{ ...APP, flexDirection: "row", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: "#060810", borderRight: "1px solid #1a2232", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "18px 14px", borderBottom: "1px solid #1a2232" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "#4f46e5", textTransform: "uppercase" }}>Resume Builder</div>
            <div style={{ fontSize: 11.5, color: "#4a6080", marginTop: 2 }}>{TEMPLATES.find(t => t.id === tmpl)?.name}</div>
          </div>
          <div style={{ flex: 1, paddingTop: 6, overflowY: "auto" }}>
            {STEPS.map((s2, i) => (
              <div key={s2.id} onClick={() => setStep(i)} style={{
                padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                background: step === i ? "#0e1520" : "transparent",
                borderLeft: step === i ? "2px solid #6366f1" : "2px solid transparent",
                color: step === i ? "#dde3ec" : "#3a5070",
                fontSize: 12.5, fontWeight: step === i ? 600 : 400, transition: "all 0.12s",
              }}>
                <span style={{ fontSize: 13 }}>{s2.icon}</span> {s2.label}
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid #1a2232" }}>
            <div onClick={() => setPhase("template")} style={{ fontSize: 11.5, color: "#3a5070", cursor: "pointer" }}>← Templates</div>
          </div>
        </div>

        {/* Form pane */}
        <div style={{ width: 420, overflowY: "auto", padding: "28px 24px", borderRight: "1px solid #1a2232" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2f8", marginBottom: 18 }}>
            {s.icon} {s.label}
          </div>
          {body()}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && <Btn v="secondary" onClick={() => setStep(x => x - 1)}>← Back</Btn>}
            {step < STEPS.length - 1 && <Btn onClick={() => setStep(x => x + 1)}>Next →</Btn>}
          </div>
        </div>

        {/* Live mini preview */}
        <div style={{ flex: 1, background: "#090c12", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "9px 14px", borderBottom: "1px solid #1a2232", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, color: "#3a5070" }}>Live Preview</span>
            <Btn sm onClick={enterPreview}>Full Preview →</Btn>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", padding: "16px 8px" }}>
            <div style={{ transform: "scale(0.50)", transformOrigin: "top center", width: "210mm", pointerEvents: "none" }}>
              <ResumeDocument data={d} template={tmpl} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PREVIEW / EDIT PHASE
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...APP, flexDirection: "row", height: "100vh", overflow: "hidden" }}>
      {/* Edit sidebar */}
      <div style={{ width: 290, background: "#060810", borderRight: "1px solid #1a2232", overflowY: "auto", padding: "14px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, color: "#dde3ec", fontSize: 13.5 }}>✏️ Live Edit</span>
          <div style={{ display: "flex", gap: 5 }}>
            <Btn v="dark" sm onClick={() => setPhase("form")}>← Form</Btn>
            <Btn v="green" sm onClick={downloadPDF}>⬇ PDF</Btn>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: "#3a5070", marginBottom: 12 }}>Edits update the preview in real-time</div>

        {aiLoading && (
          <Card style={{ border: "1px solid #312e81" }}>
            <div style={{ fontSize: 12, color: "#a5b4fc" }}>✨ AI is writing your Professional Summary...</div>
          </Card>
        )}
        {aiError && (
          <Card style={{ border: "1px solid #7f1d1d" }}>
            <div style={{ fontSize: 11.5, color: "#f87171" }}>{aiError}</div>
            <div style={{ marginTop: 8 }}>
              <Btn sm onClick={enterPreview}>Retry AI</Btn>
            </div>
          </Card>
        )}

        <SL>Personal</SL>
        <Input label="Name"     value={d.name}     onChange={set("name")}     placeholder="Full Name" />
        <Input label="Title"    value={d.title}    onChange={set("title")}    placeholder="Job Title" />
        <Input label="Email"    value={d.email}    onChange={set("email")}    placeholder="Email" />
        <Input label="Phone"    value={d.phone}    onChange={set("phone")}    placeholder="Phone" />
        <Input label="Location" value={d.location} onChange={set("location")} placeholder="City" />
        <Input label="LinkedIn" value={d.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/…" />
        <Input label="GitHub"   value={d.github}   onChange={set("github")}   placeholder="github.com/…" />

        <SL>Skills</SL>
        <Input label="Technical Skills (Category: items per line)" value={d.skills} onChange={set("skills")} rows={5} />

        <SL>Professional Summary</SL>
        <Input label="Summary (AI-generated — edit freely)" value={d.summary} onChange={set("summary")} rows={4}
          placeholder={aiLoading ? "Generating with AI..." : "Will be auto-generated by AI on preview..."} />
        {!aiLoading && !aiDone && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" && (
          <Btn sm v="ghost" onClick={enterPreview} loading={aiLoading}>✨ Regenerate Summary</Btn>
        )}

        {d.projects.map((p, i) => (
          <div key={i}>
            <SL>Project {i + 1}{p.name ? `: ${p.name.slice(0, 22)}…` : ""}</SL>
            <Input label="Name"       value={p.name}    onChange={setA("projects", i, "name")}    placeholder="Project name" />
            <Input label="Tech"       value={p.tech}    onChange={setA("projects", i, "tech")}    placeholder="Stack" />
            <Input label="Date/Badge" value={p.badge || p.date} onChange={v => { setA("projects", i, "badge")(v); setA("projects", i, "date")(v); }} placeholder="Dec 2024" />
            <Input label="Bullets"    value={p.bullets} onChange={setA("projects", i, "bullets")} rows={3} placeholder="Achievement bullets" />
          </div>
        ))}

        {d.experience.length > 0 && d.experience.map((e, i) => (
          <div key={i}>
            <SL>Experience {i + 1}</SL>
            <Input label="Title"   value={e.title}   onChange={setA("experience", i, "title")}   placeholder="Job Title" />
            <Input label="Company" value={e.company} onChange={setA("experience", i, "company")} placeholder="Company" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Input label="Start" value={e.start} onChange={setA("experience", i, "start")} placeholder="Jan 2024" />
              <Input label="End"   value={e.end}   onChange={setA("experience", i, "end")}   placeholder="Present" />
            </div>
            <Input label="Bullets" value={e.bullets} onChange={setA("experience", i, "bullets")} rows={3} />
          </div>
        ))}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #1a2232" }}>
          <Btn v="green" full onClick={downloadPDF}>⬇ Download as PDF</Btn>
          <div style={{ fontSize: 10.5, color: "#3a5070", marginTop: 7, textAlign: "center", lineHeight: 1.5 }}>
            Print dialog opens → choose "Save as PDF"
          </div>
        </div>
      </div>

      {/* A4 Canvas */}
      <div style={{ flex: 1, background: "#0e1219", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "9px 18px", borderBottom: "1px solid #1a2232", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12.5, color: "#3a5070" }}>
            📄 A4 Live Preview &nbsp;—&nbsp;
            <span style={{ color: "#7a90a8" }}>{TEMPLATES.find(t => t.id === tmpl)?.name}</span>
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {aiLoading && <span style={{ fontSize: 11, color: "#a5b4fc" }}>✨ Writing summary…</span>}
            <span style={{ fontSize: 10.5, color: "#22c55e" }}>● Live</span>
            <Btn sm v="green" onClick={downloadPDF}>⬇ Download PDF</Btn>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.75)", borderRadius: 2 }}>
            <div ref={resumeRef}>
              <ResumeDocument data={d} template={tmpl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const APP = {
  display: "flex", flexDirection: "column", minHeight: "100vh",
  background: "#07090e",
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  color: "#dde3ec",
};
export default App;
