import fitz  # PyMuPDF
import re
import base64
from collections import Counter


def extract_pdf_text(pdf_bytes):
    """
    Extract text and images from a PDF.

    Returns:
        metadata: dict        - PDF metadata (title, author, etc.)
        page_count: int       - number of pages
        full_text: str        - concatenated text from all pages
        images: list[dict]    - list of image info + base64 data
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    metadata = doc.metadata or {}

    texts = [page.get_text() for page in doc]
    images = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images()
        for img_index, img in enumerate(image_list):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            try:
                if pix.n - pix.alpha < 4:  # RGB/gray images
                    img_data = pix.tobytes("png")
                    images.append(
                        {
                            "page": page_num + 1,
                            "index": img_index + 1,
                            "width": pix.width,
                            "height": pix.height,
                            "base64": base64.b64encode(img_data).decode("ascii"),
                        }
                    )
            finally:
                pix = None

    page_count = len(doc)
    full_text = "".join(texts)
    doc.close()
    return metadata, page_count, full_text, images


# ---------- Phase 2: smarter study sheet ----------

STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "this", "that", "with", "from", "your", "about", "their", "there",
    "these", "those", "have", "will", "would"
}


def _split_into_sections(text: str):
    """
    Simple 'section' splitter:
    - Split on two or more newlines
    - Filter out tiny chunks
    - Limit total sections for UI
    """
    raw_sections = re.split(r"\n{2,}", text.strip())
    sections = [s.strip() for s in raw_sections if len(s.strip()) > 200]
    if not sections and text.strip():
        sections = [text.strip()]
    return sections[:6]  # limit for nicer UI


def _summary_from_section(section: str, max_len: int = 300) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", section.strip())
    if not sentences:
        return "No summary available."
    base = sentences[0]
    if len(base) > max_len:
        return base[:max_len] + "..."
    if len(sentences) > 1 and len(base) < max_len // 2:
        combo = (base + " " + sentences[1]).strip()
        return combo[:max_len] + ("..." if len(combo) > max_len else "")
    return base


def _key_terms(section: str, max_terms: int = 6):
    words = re.findall(r"\b[a-zA-Z]{5,}\b", section.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    counts = Counter(filtered)
    return [w.capitalize() for w, _ in counts.most_common(max_terms)]


def _make_questions(key_terms):
    """
    Template‑based questions generated from key terms.
    """
    questions = []
    for term in key_terms[:5]:
        questions.append(f"What is {term}?")
        questions.append(f"Why is {term} important in this topic?")
    return questions[:6]


def smart_study_sheet(text: str):
    """
    Phase 2: structured, multi‑section study sheet.
    Still deterministic (no external AI), but feels 'AI‑like'.

    Returns JSON‑serializable dict with:
      - main_idea: str
      - sections: [{title, summary, key_terms}]
      - questions: [str]
      - tips: [str]
      - phase: str
    """
    text = text.strip()
    if not text:
        return {
            "main_idea": "No content found.",
            "sections": [],
            "questions": [],
            "tips": ["Try uploading a PDF with more text."],
            "phase": "2-structured-fake-ai",
        }

    sections_raw = _split_into_sections(text)
    first_section = sections_raw[0]
    main_idea = _summary_from_section(first_section, max_len=320)

    sections_payload = []
    all_terms = []

    for idx, sec in enumerate(sections_raw, start=1):
        summary = _summary_from_section(sec)
        terms = _key_terms(sec)
        all_terms.extend(terms)
        sections_payload.append(
            {
                "title": f"Section {idx}",
                "summary": summary,
                "key_terms": terms,
            }
        )

    # Combine all key terms into global questions
    global_terms = list(dict.fromkeys(all_terms))  # de‑duplicate, keep order
    questions = _make_questions(global_terms)

    tips = [
        "Skim each section summary, then re‑read the original PDF pages.",
        "Turn key terms into flashcards (front: term, back: your own definition).",
        "Answer the questions out loud or in writing before your quiz.",
    ]

    return {
        "main_idea": main_idea,
        "sections": sections_payload,
        "questions": questions,
        "tips": tips,
        "phase": "2-structured-fake-ai",
    }
