import { Input } from "../ui/UI";

export default function Skills({ d, set }) {
  return (
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
}
