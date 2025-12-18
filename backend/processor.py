import fitz  # PyMuPDF
import re
import base64
from collections import Counter

def extract_pdf_text(pdf_bytes):
    """EXTRACT TEXT + IMAGES FROM PDF"""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    metadata = doc.metadata or {}
    texts = [page.get_text() for page in doc]
    images = []
    
    # EXTRACT IMAGES FROM EVERY PAGE
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images()
        for img_index, img in enumerate(image_list):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha < 4:  # RGB/GRAYSCALE
                img_data = pix.tobytes("png")
                images.append({
                    "page": page_num + 1,
                    "index": img_index + 1,
                    "width": pix.width,
                    "height": pix.height,
                    "base64": base64.b64encode(img_data).decode('ascii')
                })
            pix = None
    
    doc.close()
    return metadata, len(doc), "".join(texts), images

def simple_study_sheet(text):
    """FAKE AI STUDY SHEET"""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    main_idea = sentences[0][:250] + "..." if sentences else "No content found"
    
    words = re.findall(r'\b[a-zA-Z]{5,}\b', text.lower())
    stopwords = {"the", "and", "for", "are", "but", "not", "you", "all", "can", "had"}
    filtered = [w for w in words if w not in stopwords]
    concepts = [w.capitalize() for w, _ in Counter(filtered).most_common(6)]
    
    return {
        "main_idea": main_idea,
        "concepts": concepts or ["No concepts"],
        "examples": ["Phase 2: Real AI examples"],
        "phase": "1-fake-ai"
    }
