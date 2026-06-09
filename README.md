# NeuralAcademy

## Where Theory Meets Code

NeuralAcademy is a personal AI-powered learning project that turns static study notes into interactive learning experiences. It is designed to bridge the gap between conceptual reading and practical application by helping learners upload PDFs, extract the important ideas, and grow those notes into guided study tools and coding practice.

Today, the project already supports PDF upload, text extraction, metadata parsing, page-by-page reading, and a frontend workspace for exploring uploaded material. The long-term vision is to evolve that workflow into an AI tutor that can generate study sheets, coding exercises, and progressive hints based on the learner's own content.

## What Makes It Different

### AI-Style Study Sheets

NeuralAcademy is built around the idea that notes should become usable learning artifacts, not just static files. The backend already includes study-sheet generation endpoints, with support for both deterministic fallbacks and optional LLM-powered responses when an OpenAI API key is configured.

### Integrated Coding Playground

The platform is moving toward a built-in coding practice loop where theory becomes implementation. A code execution endpoint and challenge-generation endpoint already exist in the backend, giving the project a foundation for the planned evaluator experience.

### Ask Sage AI Tutor

The long-term tutoring layer is meant to coach rather than simply answer. The current backend includes an analysis endpoint intended to return guided hints and feedback on submitted code, which sets up the future "Ask Sage" experience.

## Current Stack

- Frontend: React 19, TypeScript, Vite
- Backend: FastAPI, Python
- PDF Processing: PyMuPDF
- AI Layer: LangChain + OpenAI GPT-4o, with fallback behavior when `OPENAI_API_KEY` is not set
- Code Execution: Python subprocess sandbox prototype
- Testing: Vitest on the frontend, `pytest` available in the backend

## Current Features

- Upload PDF files to the FastAPI backend
- Extract document metadata, full text, page text, and embedded images
- Review uploaded documents in a React dashboard
- Save recent uploads in local browser history
- Generate study sheets from uploaded text through backend endpoints
- Generate coding challenges from study content through backend endpoints
- Run Python code in a restricted execution flow
- Analyze submitted code for tutoring-style feedback

## Roadmap

### Phase 1: Foundation

- PDF upload
- Text extraction
- Basic dashboard
- Image extraction

### Phase 2: The Brain

- Structured study sheets
- Main ideas, sections, terms, flashcards, and questions
- Deterministic fallback logic
- Optional GPT-powered enrichment when API access is configured

### Phase 3: The Evaluator

- Secure coding playground UI
- Auto-generated coding assignments from study material
- "Ask Sage" progressive hint system
- Tighter study-to-code workflow inside the frontend

## Project Structure

```text
NeuralAcademy/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── processor.py
│   ├── sandbox.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on `http://127.0.0.1:8000`.

Optional:

- Set `OPENAI_API_KEY` in a `.env` file inside `backend/` to enable GPT-powered study sheets, coding challenges, and tutor analysis.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite app runs on `http://127.0.0.1:5173` by default. If needed, you can point it at a different backend with `VITE_API_BASE_URL`.

## Vision

NeuralAcademy is ultimately about making learning more active. Instead of reading notes once and moving on, the goal is to turn each document into a study companion that can explain, quiz, challenge, and coach. The project starts with PDFs, but the deeper aim is a personalized system that helps learners move from understanding concepts to writing code with confidence.

## License

MIT
