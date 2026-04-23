import { Input, Btn, Card } from "../ui/UI";

export const emptyProj = () => ({ name: "", tech: "", date: "", badge: "", bullets: "" });

export default function Projects({ d, setA, addA, remA }) {
  return (
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
}
