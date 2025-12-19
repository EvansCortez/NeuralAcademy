from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

from processor import extract_pdf_text, smart_study_sheet
from models import StudyGuideRequest
from sandbox import run_student_code


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
    with open("../frontend/10-index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.get("/status")
def status():
    return {
        "name": "NeuralAcademy",
        "phase": "2",
        "features": [
            "PDF text",
            "PDF images",
            "Structured study sheet",
            "Code sandbox stub",
        ],
        "ready": True,
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Basic validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    # Read file bytes
    content = await file.read()

    # Use helper to extract metadata, text, and images
    metadata, page_count, full_text, images = extract_pdf_text(content)

    return {
        "filename": file.filename,
        "title": metadata.get("title", "No Title"),
        "author": metadata.get("author", "Unknown"),
        "page_count": page_count,
        "text_preview": full_text[:2500],
        "full_text": full_text,
        "images": images[:6],  # max 6 images for preview
    }


@app.post("/generate-study-sheet")
async def generate_study_sheet(req: StudyGuideRequest):
    # Structured, multi-section fake AI study sheet
    return smart_study_sheet(req.text)


@app.post("/run-code")
async def run_code(req: StudyGuideRequest):
    # Phase 2 stub: safe code execution placeholder
    return run_student_code(req.text)


if __name__ == "__main__":
    print("🚀 NeuralAcademy Phase 2 starting on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
