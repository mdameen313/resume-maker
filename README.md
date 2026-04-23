# 🚀 AI Resume Builder

Welcome to the **AI Resume Builder!** This codebase is a fully functional, highly premium React application designed to let you instantly launch a resume builder or an advanced resume generation feature to your existing platform.

It is entirely client-side, lightning-fast, and powered by the Groq API for near-instant AI text processing.

## 🌟 Key Features included in this Source Code
- **Deep AI Integration:** Uses the blazing-fast Groq API (`llama-3.1-8b-instant`) to draft professional summaries and tailored cover letters automatically.
- **Smart PDF Import:** Extracts data from existing PDF resumes using local `pdfjs-dist` text extraction, then uses the LLM to map the raw text perfectly into structured JSON fields.
- **Auto-Save Engine:** Implements `localStorage` state keeping so users never lose their data when they refresh the page.
- **"Bring Your Own Key" (BYOK) UI:** We built a dedicated App Settings tab. The platform never sends API requests from your own server—the user enters their Groq API key securely in their browser to cover token costs.
- **4 Premium ATS Templates:** Clean, professional layouts that render perfectly in A4 format via HTML/CSS inline.
- **Export to PDF:** Native, pixel-perfect `window.print()` PDF exporting bypassing the need for backend Node.js heavy PDF generators like Puppeteer.

## 🛠️ Tech Stack
- Frontend Framework: React 19 + Vite
- Styling: Plain/Vanilla React CSS-in-JS primitives for maximum portability
- Extractor: PDF.js (`pdfjs-dist`)
- LLM Native: Groq API (OpenAI Compatible Fetch Implementation)

## 📥 Getting Started

Starting the application requires only two commands:

```bash
# 1. Install Dependencies
npm install

# 2. Start the Development Server
npm run dev
```

Visit `http://localhost:5174/` to view the running application!

## ⚙️ How the Application Architecture Works

This logic has been cleanly modularized for easy adaptation:
*   `src/components/ui/UI.jsx`: Contains completely reusable visual components. Change the colors or borders here, and it will cascade dynamically.
*   `src/components/forms/`: Individual topic forms (`Personal`, `Education`, etc.)
*   `src/App.jsx`: The top-level state manager. LocalStorage hooks, step-routing, and the `ResumeDocument` HTML/CSS printing templates live here.


