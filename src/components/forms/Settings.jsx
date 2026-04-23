import { Input, Card } from "../ui/UI";

export default function Settings({ groqKey, setGroqKey }) {
  return (
    <div>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>
          API Connection
        </div>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 16 }}>
          The app is securely connected to the backend. All AI features (PDF Import, Summary generation, Cover Letter generation) are fully unlocked and ready to use!
        </p>
      </Card>
      <Card style={{ border: "1px dashed var(--border-main)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginBottom: 8 }}>☁️ Cloud Sync (Coming Soon)</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
          User accounts and cloud auto-save will be added soon. For now, please complete and export your resume in one session.
        </div>
      </Card>
    </div>
  );
}
