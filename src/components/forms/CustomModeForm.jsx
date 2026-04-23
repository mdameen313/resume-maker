import { Input, Btn, Card } from "../ui/UI";

export const emptyCustomItem = () => ({
  title: "",
  subtitle: "",
  rightText: "",
  bullets: ""
});

export default function CustomModeForm({ sectionData, updateSection }) {
  const addItem = () => {
    updateSection({
      ...sectionData,
      items: [...(sectionData.items || []), emptyCustomItem()]
    });
  };

  const removeItem = (idx) => {
    updateSection({
      ...sectionData,
      items: sectionData.items.filter((_, i) => i !== idx)
    });
  };

  const updateItem = (idx, field, value) => {
    const newItems = [...(sectionData.items || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    updateSection({ ...sectionData, items: newItems });
  };

  return (
    <div>
      <Input 
        label="Section Heading Name" 
        value={sectionData.headingTitle || ""} 
        onChange={(v) => updateSection({ ...sectionData, headingTitle: v })} 
        placeholder="e.g. My Custom Awards" 
      />
      
      <div style={{ margin: "24px 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-main)", borderBottom: "1px solid var(--border-main)", paddingBottom: 6 }}>
        Section Items
      </div>

      {(!sectionData.items || sectionData.items.length === 0) && (
        <Btn v="ghost" full onClick={addItem}>+ Add First Item</Btn>
      )}

      {(sectionData.items || []).map((item, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Item #{i + 1}</span>
            <Btn v="danger" sm onClick={() => removeItem(i)}>✕ Remove</Btn>
          </div>
          <Input 
            label="Main Title (Bold)" 
            value={item.title} 
            onChange={(v) => updateItem(i, "title", v)} 
            placeholder="e.g. Employee of the Month" 
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input 
              label="Subtitle (Italic)" 
              value={item.subtitle} 
              onChange={(v) => updateItem(i, "subtitle", v)} 
              placeholder="e.g. Tech Corp Inc." 
            />
            <Input 
              label="Right Text (Date/Location)" 
              value={item.rightText} 
              onChange={(v) => updateItem(i, "rightText", v)} 
              placeholder="e.g. 2026" 
            />
          </div>
          <Input 
            label="Details / Bullets (One per line)" 
            value={item.bullets} 
            onChange={(v) => updateItem(i, "bullets", v)} 
            rows={4}
            placeholder="Won for outstanding performance...&#10;Contributed to saving..." 
          />
        </Card>
      ))}

      {(sectionData.items && sectionData.items.length > 0) && (
        <Btn v="ghost" full onClick={addItem}>+ Add Another Item</Btn>
      )}
    </div>
  );
}
