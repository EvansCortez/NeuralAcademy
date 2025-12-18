from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor import extract_pdf_text, simple_study_sheet
from models import PageRequest, StudyGuideRequest, CodeRequest
from sandbox import run_code_stub
import fitz  # PyMuPDF
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # later: lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "NeuralAcademy Backend is Running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")

        metadata = doc.metadata
        full_text = ""
        for page in doc:
            full_text += page.get_text()

        page_count = len(doc)
        doc.close()

        return {
            "filename": file.filename,
            "title": metadata.get("title") or "Untitled Document",
            "page_count": page_count,
            "text_preview": full_text[:2000],
        }
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to process PDF")
    
@app.post("/run-code")
async def run_code(req: CodeRequest):
    return run_code_stub(req.code)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
