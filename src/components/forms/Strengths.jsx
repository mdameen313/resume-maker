import { Input, Btn, Card } from "../ui/UI";

export const emptyStr = () => ({ title: "", description: "" });

export default function Strengths({ d, set, setA, addA, remA }) {
  return (
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
}
