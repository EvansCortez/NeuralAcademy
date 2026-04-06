from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
from dotenv import load_dotenv
import os

from processor import (
    extract_pdf_text,
    smart_study_sheet,
    generate_coding_challenge_ai,
    analyze_code_ai,
)
from models import (
    StudyGuideRequest,
    StatusResponse,
    UploadResponse,
    StudySheetResponse,
    CodingChallengeResponse,
    CodeRunResult,
    CodeAnalysisResponse,
)
from sandbox import run_student_code

load_dotenv()  # Load environment variables from .env file


app = FastAPI(title="🧠 NeuralAcademy - Phase 2")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def home():
    # Serve the frontend HTML file
    with open("../frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/status", response_model=StatusResponse)
def status() -> StatusResponse:
    return StatusResponse(
        name="NeuralAcademy",
        phase="2",
        features=[
            "PDF text",
            "PDF images",
            "Structured study sheet",
            "Code sandbox stub",
        ],
        ready=True,
    )


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    # Basic validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # Read file bytes
    content = await file.read()

    # Use helper to extract metadata, text, and images
    metadata, page_count, full_text, page_texts, images = extract_pdf_text(content)

    return UploadResponse(
        filename=file.filename,
        title=metadata.get("title", "No Title"),
        author=metadata.get("author", "Unknown"),
        page_count=page_count,
        text_preview=full_text[:2500],
        full_text=full_text,
        page_texts=page_texts,
        images=images[:6],  # type: ignore[arg-type]  # list[dict] -> list[UploadImage]
    )


@app.post("/generate-study-sheet", response_model=StudySheetResponse)
async def generate_study_sheet(req: StudyGuideRequest) -> StudySheetResponse:
    # Structured, multi-section fake AI study sheet
    return smart_study_sheet(req.text)  # type: ignore[return-value]


@app.post("/generate-coding-challenge", response_model=CodingChallengeResponse)
async def generate_coding_challenge(
    req: StudyGuideRequest,
) -> CodingChallengeResponse:
    # Phase 2: AI-generated coding challenge
    return generate_coding_challenge_ai(req.text)  # type: ignore[return-value]


@app.post("/run-code", response_model=CodeRunResult)
async def run_code(req: StudyGuideRequest) -> CodeRunResult:
    # Phase 2: safe code execution
    return run_student_code(req.text)  # type: ignore[return-value]


@app.post("/analyze-code", response_model=CodeAnalysisResponse)
async def analyze_code(req: StudyGuideRequest) -> CodeAnalysisResponse:
    # Phase 3: AI Tutor analyzes code and provides progressive hints
    return analyze_code_ai(req.text)  # type: ignore[return-value]


if __name__ == "__main__":
    print("🚀 NeuralAcademy Phase 3 starting on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
