from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

# IMPORT MY FILES
from processor import extract_pdf_text, simple_study_sheet
from models import StudyGuideRequest

app = FastAPI(title="🧠 NeuralAcademy - Phase 1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/", response_class=HTMLResponse)
async def home():
    with open("../frontend/10-index.html", "r") as f:
        return f.read()

@app.get("/status")
def status():
    return {
        "name": "NeuralAcademy", 
        "phase": "1", 
        "features": ["PDF text", "PDF images", "Study sheet"],
        "ready": True
    }

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files allowed")
    
    content = await file.read()
    metadata, page_count, full_text, images = extract_pdf_text(content)
    
    return {
        "filename": file.filename,
        "title": metadata.get("title", "No Title"),
        "author": metadata.get("author", "Unknown"),
        "pages": page_count,
        "preview": full_text[:2500],
        "images": images[:6]  # MAX 6 IMAGES FOR PREVIEW
    }

@app.post("/study-sheet")
async def study_sheet(req: StudyGuideRequest):
    return simple_study_sheet(req.text)

if __name__ == "__main__":
    print("🚀 NeuralAcademy Phase 1 starting on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
