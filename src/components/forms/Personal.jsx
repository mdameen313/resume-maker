import { Input } from "../ui/UI";

export default function Personal({ d, set }) {
  return (
    <div>
      <Input label="Full Name *" value={d.name} onChange={set("name")} placeholder="Your Name" />
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
}
