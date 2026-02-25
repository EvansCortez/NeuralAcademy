# 🎓 NeuralAcademy
### *Where Theory Meets Code*

**NeuralAcademy** is a personal AI‑powered learning project that turns static study notes into interactive learning experiences. It bridges the gap between conceptual reading and practical application by extracting key ideas from PDFs today, and will eventually generate custom coding assignments directly from your uploaded materials.

---

## 🚀 Key Differentiators

* **AI‑Style Study Sheets (Current – Phase 2):**  
  Extracts main ideas, sections, key terms, and practice questions from uploaded PDFs using deterministic text processing. Designed to be upgradeable to real LLM‑powered summaries later.

* **Integrated Coding Playground (Planned – Phase 3):**  
  A built‑in sandbox that will create and evaluate code assignments tailored to your specific notes. A stubbed `/run-code` endpoint already exists in the backend.

* **"Ask Sage" AI Tutor (Planned):**  
  A supportive feedback loop that will provide progressive hints and logical guidance rather than just answers.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite.
* **Backend:** Python (FastAPI).
* **Processing / “AI”:** PyMuPDF for PDF text + image extraction, plus a LangChain + OpenAI GPT‑4o pipeline for structured study sheets with a deterministic fallback when no API key is configured.
* **AI Stack:** LangChain and OpenAI GPT‑4o (via `OPENAI_API_KEY`) for study guides and coding challenges.
* **Sandbox:** Python code sandbox executed in a restricted subprocess (Phase 3 UI still in progress).

---

## 📅 Roadmap (Target: Jan 22, 2026)

- [x] **Phase 1: Foundation**  
  PDF upload, text extraction, basic dashboard, and image gallery.

- [x] **Phase 2: The “Brain” (In Progress)**  
  Structured study sheets (sections, key terms, questions, tips) using deterministic logic. Future: swap in LangChain + GPT‑4o for real AI summaries.

- [ ] **Phase 3: The “Evaluator” (Planned)**  
  Secure code sandbox, auto‑generated coding exercises, and “Ask Sage” AI tutoring on top of the study content.
