import { useState } from "react";
import { Input, Btn, Card } from "../ui/UI";

export default function CoverLetter({ d, groqKey, jobDesc, setJobDesc, coverLetter, setCoverLetter }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateLetter = async () => {
    if (!groqKey) {
      setError("Please add your Groq API Key in the Settings tab first.");
      return;
    }
    if (!jobDesc.trim()) {
      setError("Please paste a target job description first.");
      return;
    }
    setLoading(true);
    setError("");
    
    // Convert current resume to string context
    const resumeContext = `Name: ${d.name}\nTitle: ${d.title}\nSkills: ${d.skills}\nProjects: ${(d.projects||[]).map(p=>p.name).join(", ")}\nExperience: ${(d.experience||[]).map(e=>e.title + ' at ' + e.company).join(", ")}`;

    const prompt = `You are an expert career coach writing a cover letter. Write a highly tailored, professional 3-paragraph cover letter for the candidate based on their resume and the target job description.

CANDIDATE RESUME SUMMARY:
${resumeContext}

TARGET JOB DESCRIPTION:
${jobDesc}

Instructions:
- Output ONLY the cover letter text, no preamble, no markdown.
- Make it confident, modern, and aligned with the job description keywords.
- Address it to "Hiring Manager" if no name is given.`;

    try {
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
      
      setCoverLetter(json.choices[0].message.content.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        label="Target Job Description"
        value={jobDesc}
        onChange={setJobDesc}
        rows={5}
        placeholder="Paste the job description here so the AI can tailor your cover letter..."
      />
      {error && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 20 }}>
        <Btn full onClick={generateLetter} loading={loading}>
          ✨ Generate AI Cover Letter
        </Btn>
      </div>

      {(coverLetter || loading) && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#7a90a8", marginBottom: 10 }}>Generated Cover Letter</div>
          {loading ? (
             <div style={{ color: "#dde3ec", fontSize: 13, padding: 10 }}>Writing your tailored cover letter...</div>
          ) : (
            <Input 
              value={coverLetter}
              onChange={setCoverLetter}
              rows={15}
            />
          )}
        </Card>
      )}
    </div>
  );
}
