import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { Input, Btn, Chip, SL, Card } from "./components/ui/UI";
import Personal from "./components/forms/Personal";
import Education, { emptyEdu } from "./components/forms/Education";
import Skills from "./components/forms/Skills";
import Projects, { emptyProj } from "./components/forms/Projects";
import Certifications, { emptyCert } from "./components/forms/Certifications";
import Strengths, { emptyStr } from "./components/forms/Strengths";
import Experience, { emptyExp } from "./components/forms/Experience";
import PreviewGate from "./components/forms/PreviewGate";
import Settings from "./components/forms/Settings";
import CoverLetter from "./components/forms/CoverLetter";
import CustomModeForm from "./components/forms/CustomModeForm";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
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
const ALL_SECTIONS = [
  { id: "education", label: "Education", icon: "🎓" },
  { id: "skills", label: "Technical Skills", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "certifications", label: "Certifications", icon: "🏅" },
  { id: "strengths", label: "Key Strengths", icon: "💪" },
  { id: "experience", label: "Experience", icon: "💼" },
];
const getSteps = (sectionOrder = [], customSections = [], isCustomMode = false) => {
  const top = [
    { id: "settings", label: "App Settings", icon: "⚙️" },
    { id: "personal", label: "Personal Info", icon: "👤" }
  ];
  const bottom = [
    { id: "coverletter", label: "Cover Letter", icon: "📝" },
    { id: "preview", label: "Preview & Export", icon: "📄" }
  ];
  
  if (isCustomMode) {
    const customOrdered = customSections.map((sec, idx) => ({
      id: `custom_${idx}`,
      label: sec.headingTitle || `Unnamed Section`,
      icon: "✨",
      isCustom: true,
      index: idx
    }));
    return [...top, ...customOrdered, ...bottom];
  }
  
  // Create ordered sections from sectionOrder
  const orderedSections = sectionOrder
    .map(id => ALL_SECTIONS.find(s => s.id === id))
    .filter(Boolean);
    
  return [...top, ...orderedSections, ...bottom];
};

// ─────────────────────────────────────────────────────────────────────────────
// AI SUMMARY  — uses the baked-in key, no user prompt
// ─────────────────────────────────────────────────────────────────────────────
async function generateSummaryAI(data, groqKey) {
  const projectList = (data.projects || []).map(p => p.name).filter(Boolean).join(", ");
  const certList = (data.certifications || []).map(c => c.name).filter(Boolean).join(", ");
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

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    })
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  return json.choices[0].message.content.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT FROM PDF LOCALLY (NO API KEY REQUIRED)
// ─────────────────────────────────────────────────────────────────────────────
async function extractResumeFromPdfLocal(base64Pdf, groqKey) {
  const binaryString = window.atob(base64Pdf);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let lastY = -1;
    for (const item of textContent.items) {
      // If the Y coordinate changes noticeably, we are on a new line
      if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
        text += "\n";
      }
      text += item.str + " ";
      lastY = item.transform[5];
    }
    text += "\n\n";
  }

  // Clean up excessive spaces
  text = text.replace(/ +/g, " ");

  const prompt = `You are an expert resume parser. Extract the information from the following raw PDF text and format it as a valid JSON object matching this structure EXACTLY:
{
  "name": "Full Name",
  "title": "Professional Title (guess based on exp/summary if missing)",
  "email": "Email Address",
  "phone": "Phone Number",
  "location": "City, Country",
  "linkedin": "LinkedIn URL",
  "github": "GitHub URL",
  "summary": "Professional Summary",
  "skills": "Technical Skills. Format EACH line precisely as 'Category: skill1, skill2'. VERY IMPORTANT: Use categories.",
  "languages": "Languages spoken",
  "education": [
    { "institution": "Name", "degree": "Degree", "location": "Location", "start": "Start Date", "end": "End Date", "gpa": "GPA" }
  ],
  "projects": [
    { "name": "Project Name", "tech": "Stack", "date": "Date", "badge": "Link", "bullets": "Bullet points, one per line" }
  ],
  "certifications": [
    { "name": "Name", "description": "Description" }
  ],
  "strengths": [
    { "title": "Strength Title", "description": "Short detail" }
  ],
  "experience": [
    { "title": "Job Title", "company": "Company", "location": "Location", "start": "Start Date", "end": "End Date", "bullets": "Achievements, one per line" }
  ]
}

Return ONLY perfect valid JSON.

RESUME TEXT:
"""
${text.slice(0, 7000)}
"""`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));

  return JSON.parse(json.choices[0].message.content.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME DOCUMENT RENDERER
// This is the actual A4 sheet — 4 template variants
// ─────────────────────────────────────────────────────────────────────────────
function ResumeDocument({ data, template, isCustomMode }) {
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
    data.github || null,
    data.location || null,
  ].filter(Boolean);

  const isModern = template === "modern";
  const isExecutive = template === "executive";
  const isMinimal = template === "minimal";

  const headerPad = isModern ? "18px 24px 16px" : "20px 24px 14px";
  const headerBg = T.headerBg || "transparent";
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

        {/* Render dynamically ordered standard sections or custom sections */}
        {isCustomMode ? (
          (data.customSections || []).map((sec, secIdx) => (
            <div key={`custom-${secIdx}`}>
              {sec.headingTitle && <Sec title={sec.headingTitle} />}
              {(sec.items || []).map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: "8.5pt", color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>
                      {item.rightText}
                    </span>
                  </div>
                  {(item.subtitle) && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "9pt", color: T.subColor, fontStyle: "italic" }}>{item.subtitle}</span>
                    </div>
                  )}
                  {item.bullets && (
                    <ul style={{ margin: "3px 0 0", paddingLeft: 15 }}>
                      {item.bullets.split("\n").filter(Boolean).map((b, j) => (
                        <li key={j} style={{ fontSize: "9pt", color: "#222", marginBottom: 1.5, lineHeight: 1.4 }}>
                          {b.replace(/^[-•]\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          (data.sectionOrder || ['education', 'skills', 'projects', 'certifications', 'strengths', 'experience']).map(secId => {
            if (secId === "education" && (data.education || []).some(e => e.degree || e.institution)) return (
              <div key="edu">
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
              </div>
            );
            
            if (secId === "skills" && data.skills) return (
              <div key="skills">
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
              </div>
            );
            
            if (secId === "projects" && (data.projects || []).some(p => p.name)) return (
              <div key="proj">
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
              </div>
            );
            
            if (secId === "certifications" && (data.certifications || []).some(c => c.name)) return (
              <div key="cert">
                <Sec title="Certifications" />
                {(data.certifications || []).map((c, i) => c.name && (
                  <div key={i} style={{ marginBottom: 5, fontSize: "9pt" }}>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    {c.description && (
                      <span style={{ color: "#555" }}>: {c.description}</span>
                    )}
                  </div>
                ))}
              </div>
            );
            
            if (secId === "strengths" && (data.strengths || []).some(s => s.title)) return (
              <div key="str">
                <Sec title="Key Strengths" />
                {(data.strengths || []).map((s, i) => s.title && (
                  <div key={i} style={{ marginBottom: 4, fontSize: "9pt" }}>
                    <span style={{ fontWeight: 700 }}>{s.title}</span>
                    {s.description && <span style={{ color: "#333" }}>: {s.description}</span>}
                  </div>
                ))}
              </div>
            );
            
            if (secId === "experience" && (data.experience || []).some(e => e.title || e.company)) return (
              <div key="exp">
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
              </div>
            );
            return null;
          })
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
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [phase, setPhase] = useState("form");
  const [step, setStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiError, setAiError] = useState("");
  const resumeRef = useRef(null);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const [groqKey, setGroqKey] = useState(import.meta.env.VITE_GROQ_API_KEY || "");
  const [tmpl, setTmpl] = useState("nithin");
  const [coverLetter, setCoverLetter] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  
  const [theme, setTheme] = useState(() => localStorage.getItem("resume_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("resume_theme", theme);
  }, [theme]);

  const [isCustomMode, setIsCustomMode] = useState(false);

  const [d, setD] = useState(() => {
    return {
      name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "",
      summary: "",
      education: [emptyEdu()],
      skills: "",
      projects: [emptyProj()],
      certifications: [emptyCert()],
      strengths: [emptyStr()],
      experience: [],
      languages: "",
      sectionOrder: ['education', 'skills', 'projects', 'certifications', 'strengths', 'experience'],
      customSections: []
    };
  });

  const set = f => v => setD(x => ({ ...x, [f]: v }));
  const setA = (f, i, k) => v => setD(x => {
    const arr = [...x[f]]; arr[i] = { ...arr[i], [k]: v }; return { ...x, [f]: arr };
  });
  const addA = (f, empty) => () => setD(x => ({ ...x, [f]: [...x[f], empty()] }));
  const remA = (f, i) => () => setD(x => ({ ...x, [f]: x[f].filter((_, j) => j !== i) }));

  // ── Drag and Drop Reordering ───────────────────────────────────────────
  const handleSort = () => {
    // Only sort the dynamic middle sections, keep top and bottom intact
    let newOrder = [...(d.sectionOrder || ['education', 'skills', 'projects', 'certifications', 'strengths', 'experience'])];
    
    const dragIdx = dragItem.current - 2; // Offset by 2 fixed top steps
    const dropIdx = dragOverItem.current - 2;
    
    if (dragIdx >= 0 && dragIdx < newOrder.length && dropIdx >= 0 && dropIdx < newOrder.length) {
      const draggedSection = newOrder.splice(dragIdx, 1)[0];
      newOrder.splice(dropIdx, 0, draggedSection);
      setD(x => ({ ...x, sectionOrder: newOrder }));
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // ── Handle PDF Import ──────────────────────────────────────────────────
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!groqKey) {
      alert("Please add your Groq API Key in App Settings to use AI resume imports!");
      return;
    }

    setPhase("importing");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result.split(',')[1];
          const extracted = await extractResumeFromPdfLocal(base64Data, groqKey);

          setD({
            name: extracted.name || "",
            title: extracted.title || "",
            email: extracted.email || "",
            phone: extracted.phone || "",
            location: extracted.location || "",
            linkedin: extracted.linkedin || "",
            github: extracted.github || "",
            summary: extracted.summary || "",
            skills: extracted.skills || "",
            languages: extracted.languages || "",
            education: (extracted.education && extracted.education.length) ? extracted.education : [emptyEdu()],
            projects: (extracted.projects && extracted.projects.length) ? extracted.projects : [emptyProj()],
            certifications: (extracted.certifications && extracted.certifications.length) ? extracted.certifications : [emptyCert()],
            strengths: (extracted.strengths && extracted.strengths.length) ? extracted.strengths : [emptyStr()],
            experience: extracted.experience || [],
          });
          setPhase("form");
        } catch (err) {
          alert("Error analyzing PDF: " + err.message);
          setPhase("template");
        }
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setPhase("template");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Error starting file read.");
      setPhase("template");
    }
  };

  // ── Auto-generate summary when entering preview ────────────────────────
  const enterPreview = async () => {
    setPhase("preview");
    if (d.summary || aiDone) return;
    if (!groqKey) {
      setAiError("Add your API key in App Settings to enable AI summary generation.");
      return;
    }
    setAiLoading(true); setAiError("");
    try {
      const s = await generateSummaryAI(d, groqKey);
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
        <div style={{ position: "absolute", top: 20, right: 24 }}>
          <Btn v="secondary" sm onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Btn>
        </div>
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

          <div style={{ display: "flex", justifyContent: "center", gap: 15, marginTop: 30 }}>
            <Btn onClick={() => { setIsCustomMode(false); setPhase("form"); }}>
              Start with {TEMPLATES.find(t => t.id === tmpl)?.name} →
            </Btn>
            <div style={{ position: "relative" }}>
              <Btn v="secondary" onClick={() => document.getElementById('pdf-upload').click()}>
                Import PDF Resume
              </Btn>
              <input id="pdf-upload" type="file" accept="application/pdf" style={{ display: "none" }} onChange={handlePdfUpload} />
            </div>
            <Btn v="ghost" onClick={() => { setIsCustomMode(true); setPhase("form"); }}>
              ✨ Design from Scratch
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // IMPORTING PHASE
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "importing") {
    return (
      <div style={{ ...APP, justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border-main)", padding: "40px 60px", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 15 }}>📄✨</div>
          <h2 style={{ margin: "0 0 10px 0", color: "var(--text-main)" }}>Analyzing your Resume...</h2>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Extracting details and formatting to {TEMPLATES.find(t => t.id === tmpl)?.name}</p>
          <div style={{ marginTop: 25, fontSize: 13, color: "#6366f1" }}>This might take a few seconds. We're filling the form fields for you...</div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // FORM PHASE
  // ─────────────────────────────────────────────────────────────────────
  if (phase === "form") {
    const activeSteps = getSteps(d.sectionOrder || [], d.customSections || [], isCustomMode);
    const s = activeSteps[step] || activeSteps[0];

    const body = () => {
      if (s.isCustom) {
        return (
          <CustomModeForm 
            sectionData={d.customSections[s.index] || {}} 
            updateSection={(newSec) => {
              const clone = [...(d.customSections || [])];
              clone[s.index] = newSec;
              setD(x => ({ ...x, customSections: clone }));
            }} 
          />
        );
      }
      switch (s.id) {
        // ── Personal ─────────────────────────────────────────────────
        case "settings": return <Settings groqKey={groqKey} setGroqKey={setGroqKey} />;
        case "personal": return <Personal d={d} set={set} />;
        case "education": return <Education d={d} setA={setA} addA={addA} remA={remA} />;
        case "skills": return <Skills d={d} set={set} />;
        case "projects": return <Projects d={d} setA={setA} addA={addA} remA={remA} />;
        case "certifications": return <Certifications d={d} setA={setA} addA={addA} remA={remA} />;
        case "strengths": return <Strengths d={d} set={set} setA={setA} addA={addA} remA={remA} />;
        case "experience": return <Experience d={d} setA={setA} addA={addA} remA={remA} />;
        case "coverletter": return <CoverLetter d={d} groqKey={groqKey} coverLetter={coverLetter} setCoverLetter={setCoverLetter} jobDesc={jobDesc} setJobDesc={setJobDesc} />;
        case "preview": return <PreviewGate GROQ_API_KEY={groqKey} enterPreview={enterPreview} />;
        default: return null;
      }
    };

    return (
      <div style={{ ...APP, flexDirection: "row", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-main)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "18px 14px", borderBottom: "1px solid var(--border-main)" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "#4f46e5", textTransform: "uppercase" }}>Resume Builder</div>
            <div style={{ fontSize: 11.5, color: "var(--text-dimer)", marginTop: 2 }}>{TEMPLATES.find(t => t.id === tmpl)?.name}</div>
          </div>
          <div style={{ flex: 1, paddingTop: 6, overflowY: "auto" }}>
            {(() => {
              const renderStepItem = (s2, i) => {
                if (!s2) return null;
                const isDraggable = !isCustomMode && i >= 2 && i < activeSteps.length - 2;
                return (
                  <div 
                    key={s2.id} 
                    onClick={() => setStep(i)} 
                    draggable={isDraggable}
                    onDragStart={(e) => { dragItem.current = i; }}
                    onDragEnter={(e) => { dragOverItem.current = i; }}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      padding: "8px 14px", cursor: isDraggable ? "grab" : "pointer", display: "flex", alignItems: "center", gap: 8,
                      background: step === i ? "var(--bg-active)" : "transparent",
                      borderLeft: step === i ? "2px solid #6366f1" : "2px solid transparent",
                      color: step === i ? "var(--text-main)" : "var(--text-dim)",
                      fontSize: 12.5, fontWeight: step === i ? 600 : 400, transition: "all 0.12s",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{s2.icon}</span> 
                    <span style={{ flex: 1 }}>{s2.label}</span>
                    {isDraggable && <span style={{ fontSize: 10, opacity: 0.3 }}>&nbsp;↕</span>}
                  </div>
                );
              };

              return (
                <>
                  {renderStepItem(activeSteps[0], 0)}
                  
                  <div style={{ background: "var(--bg-pane)", margin: "8px", borderRadius: "8px", border: "1px solid var(--border-main)", overflow: "hidden", paddingBottom: "4px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, padding: "10px 14px 4px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume Content</div>
                    {renderStepItem(activeSteps[1], 1)}
                    
                    {activeSteps.slice(2, -2).map((s2, idx) => renderStepItem(s2, idx + 2))}
                    
                    {isCustomMode && (
                      <div style={{ padding: "8px 14px" }}>
                        <Btn 
                          v="secondary" 
                          full 
                          onClick={() => {
                            const curr = d.customSections || [];
                            setD(x => ({ ...x, customSections: [...curr, { headingTitle: "New Section", items: [] }] }));
                            setStep(activeSteps.length - 2); // Navigate to new step
                          }}
                        >
                          + Add Section
                        </Btn>
                      </div>
                    )}
                  </div>
                  
                  {renderStepItem(activeSteps[activeSteps.length - 2], activeSteps.length - 2)}
                  {renderStepItem(activeSteps[activeSteps.length - 1], activeSteps.length - 1)}
                </>
              );
            })()}
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-main)" }}>
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
            {step < activeSteps.length - 1 && <Btn onClick={() => setStep(x => x + 1)}>Next →</Btn>}
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
              <ResumeDocument data={d} template={tmpl} isCustomMode={isCustomMode} />
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
        <Input label="Name" value={d.name} onChange={set("name")} placeholder="Full Name" />
        <Input label="Title" value={d.title} onChange={set("title")} placeholder="Job Title" />
        <Input label="Email" value={d.email} onChange={set("email")} placeholder="Email" />
        <Input label="Phone" value={d.phone} onChange={set("phone")} placeholder="Phone" />
        <Input label="Location" value={d.location} onChange={set("location")} placeholder="City" />
        <Input label="LinkedIn" value={d.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/…" />
        <Input label="GitHub" value={d.github} onChange={set("github")} placeholder="github.com/…" />

        <SL>Skills</SL>
        <Input label="Technical Skills (Category: items per line)" value={d.skills} onChange={set("skills")} rows={5} />

        <SL>Professional Summary</SL>
        <Input label="Summary (AI-generated — edit freely)" value={d.summary} onChange={set("summary")} rows={4}
          placeholder={aiLoading ? "Generating with AI..." : "Will be auto-generated by AI on preview..."} />
        {!aiLoading && !aiDone && !!groqKey && (
          <Btn sm v="ghost" onClick={enterPreview} loading={aiLoading}>✨ Regenerate Summary</Btn>
        )}

        {d.projects.map((p, i) => (
          <div key={i}>
            <SL>Project {i + 1}{p.name ? `: ${p.name.slice(0, 22)}…` : ""}</SL>
            <Input label="Name" value={p.name} onChange={setA("projects", i, "name")} placeholder="Project name" />
            <Input label="Tech" value={p.tech} onChange={setA("projects", i, "tech")} placeholder="Stack" />
            <Input label="Date/Badge" value={p.badge || p.date} onChange={v => { setA("projects", i, "badge")(v); setA("projects", i, "date")(v); }} placeholder="Dec 2024" />
            <Input label="Bullets" value={p.bullets} onChange={setA("projects", i, "bullets")} rows={3} placeholder="Achievement bullets" />
          </div>
        ))}

        {d.experience.length > 0 && d.experience.map((e, i) => (
          <div key={i}>
            <SL>Experience {i + 1}</SL>
            <Input label="Title" value={e.title} onChange={setA("experience", i, "title")} placeholder="Job Title" />
            <Input label="Company" value={e.company} onChange={setA("experience", i, "company")} placeholder="Company" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Input label="Start" value={e.start} onChange={setA("experience", i, "start")} placeholder="Jan 2024" />
              <Input label="End" value={e.end} onChange={setA("experience", i, "end")} placeholder="Present" />
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
              <ResumeDocument data={d} template={tmpl} isCustomMode={isCustomMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const APP = {
  display: "flex", flexDirection: "column", minHeight: "100vh",
  background: "var(--bg-app)",
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  color: "var(--text-main)",
};
export default App;
