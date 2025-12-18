# backend/processor.py
import fitz
import re
from collections import Counter

def extract_pdf_text(content: bytes):
    doc = fitz.open(stream=content, filetype="pdf")
    metadata = doc.metadata or {}
    texts = []
    for page in doc:
        texts.append(page.get_text())
    page_count = len(doc)
    doc.close()
    full_text = "".join(texts)
    return metadata, page_count, full_text

def simple_study_sheet(text: str):
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    main_idea = sentences[0] if sentences else "Main idea not available."

    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    stopwords = {"this", "that", "with", "from", "have", "which",
                 "these", "those", "your", "their", "will", "about"}
    filtered = [w for w in words if w not in stopwords]
    common = [w for w, _ in Counter(filtered).most_common(5)]

    return {
        "main_idea": main_idea,
        "key_concepts": common,
        "examples": [
            "Example 1 will be generated with AI in a later phase.",
            "Example 2 will be generated with AI in a later phase.",
        ],
    }
