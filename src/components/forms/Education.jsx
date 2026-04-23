import { Input, Btn, Card } from "../ui/UI";

export const emptyEdu = () => ({ degree: "", institution: "", location: "", start: "", end: "", year: "", gpa: "" });

export default function Education({ d, setA, addA, remA }) {
  return (
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
}
