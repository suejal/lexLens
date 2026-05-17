# LexLens 🔎⚖️

LexLens is an AI-powered legal contract analyzer built to make complex legal jargon easy to understand. Think of it as your personal, AI-powered paralegal. You drop in a hefty contract, and within seconds, LexLens reads through it, identifies the spicy (and sometimes dangerous) clauses, and gives you a plain-English translation of exactly what you're about to sign. 

I built this project to solve a real-world problem: most people sign contracts without truly understanding the risk. LexLens scores the fairness of the contract, pulls out the top risks, and tells you exactly what clauses you need to push back on.

## 🚀 What It Does
- **Smart Document Parsing:** Upload a PDF or DOCX file, and the backend strips and cleans the text automatically.
- **AI-Powered Risk Analysis:** Uses the GLM-4.5-Air model to read the entire contract in one pass and accurately flag skewed terms.
- **Plain-English Translations:** Translates complex legal terminology into regular, everyday language.
- **Risk Scoring:** Assigns a 1-10 risk score and visually heat-maps clauses as Red, Amber, or Green. 
- **Downloadable Reports:** Dynamically generates a polished PDF report of your results that you can share with your team.

## 💻 The Tech Stack

I built this as a full-stack monorepo, keeping the architecture modular and separated cleanly between frontend and backend.

### Frontend
- **React & TypeScript:** For a robust, type-safe, and snappy user interface.
- **Vite:** Because waiting for slow builds is the worst.
- **Tailwind CSS:** Used for custom, premium styling (dark mode, glassmorphism, nice typography).
- **Framer Motion:** Added buttery smooth micro-animations and page transitions to make the app feel alive and premium, not just functional.

### Backend
- **Node.js & Express 5:** Handles the routing, file uploads, and API orchestration. 
- **TypeScript:** Typed end-to-end to catch bugs before they ever hit production.
- **PostgreSQL (Supabase):** Stores analysis results securely. I wrote custom SQL migrations to handle the schema.
- **Multer, pdf-parse & mammoth:** Safely processes multipart file uploads and cleanly extracts text from PDFs and Word docs.
- **pdfkit:** For streaming generated PDF reports directly back to the client.
- **GLM-4.5-Air API:** The AI engine powering the analysis. I engineered a highly condensed, resilient, one-shot system prompt to squeeze maximum accuracy while adhering to strict rate limits. 

## 🧠 Technical Highlights
- **Rate-Limiting & Resilience:** Implementing AI features on free-tier rate limits is tricky. I built an in-memory queueing rate limiter to respect a strict 20 Request-per-Minute limit. I also added smart retry logic, so if the upstream AI provider throws a 503 error, the backend gracefully tries again instead of immediately crashing the user's experience.
- **Token Optimization:** To ensure massive contracts don't blow past maximum token limits, I wrote a preprocessing service that aggressively trims whitespaces, footers, and hard-truncates documents to safely fit within the AI's context window.
- **Dynamic Fallbacks:** AI models sometimes fail to return perfect JSON. The backend features a multi-stage parser that tries direct JSON parsing, strips markdown fences if the AI mistakenly added them, or uses Regex to salvage the object—preventing the app from breaking.

## 🛠️ How to run locally

**1. Clone the repo**
\`\`\`bash
git clone https://github.com/suejal/lexLens.git
cd lexLens
\`\`\`

**2. Install dependencies & add environment variables**
You'll need a `.env` in the backend containing your `DATABASE_URL` (Postgres) and `ROUTEWAY_API_KEY`. 
\`\`\`bash
npm install
\`\`\`

**3. Run the complete stack**
\`\`\`bash
npm run dev
\`\`\`
This will concurrently start the Vite frontend on \`localhost:5173\` and the Express backend on \`localhost:5001\` (proxied together seamlessly!).

---

*If you're a recruiter or hiring manager reading this—feel free to reach out! I love talking about full-stack architecture, building resilient AI applications, and crafting great user experiences.*