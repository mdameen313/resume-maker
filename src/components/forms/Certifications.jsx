import { Input, Btn, Card } from "../ui/UI";

export const emptyCert = () => ({ name: "", description: "" });

export default function Certifications({ d, setA, addA, remA }) {
  return (
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
}
