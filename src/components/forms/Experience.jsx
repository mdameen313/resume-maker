import { Input, Btn, Card } from "../ui/UI";

export const emptyExp = () => ({ title: "", company: "", location: "", start: "", end: "Present", bullets: "" });

export default function Experience({ d, setA, addA, remA }) {
  return (
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
}
