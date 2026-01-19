import fitz  # PyMuPDF
import re
import base64
from collections import Counter
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
import os


def extract_pdf_text(pdf_bytes):
    """
    Extract text and images from a PDF.

    Returns:
        metadata: dict        - PDF metadata (title, author, etc.)
        page_count: int       - number of pages
        full_text: str        - concatenated text from all pages
        page_texts: list[str] - list of text per page
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
    page_texts = texts
    doc.close()
    return metadata, page_count, full_text, page_texts, images


# ---------- Phase 2: richer study sheet ----------

STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
    "this", "that", "with", "from", "your", "about", "their", "there",
    "these", "those", "have", "will", "would"
}


def _split_into_sections(text: str):
    raw_sections = re.split(r"\n{2,}", text.strip())
    sections = [s.strip() for s in raw_sections if len(s.strip()) > 200]
    if not sections and text.strip():
        sections = [text.strip()]
    return sections[:6]


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
    return [w.capitalize() for w, _ in counts.most_common(max_terms)], counts


def _difficulty_tag(word_count: int, unique_terms: int) -> str:
    score = word_count + unique_terms * 5
    if score < 300:
        return "Easy"
    if score < 900:
        return "Medium"
    return "Hard"


def _make_questions(key_terms):
    questions = []
    for term in key_terms[:5]:
        questions.append(f"What is {term}?")
        questions.append(f"Why is {term} important in this topic?")
    return questions[:6]


def analyze_code_ai(code: str):
    """
    AI Tutor analyzes student code and provides progressive hints
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "analysis": "OpenAI API key not configured.",
            "hints": ["Please set your OPENAI_API_KEY in the .env file."],
            "phase": "3-ai-tutor",
        }

    llm = ChatOpenAI(model="gpt-4o", temperature=0.3, api_key=api_key)

    response_schemas = [
        ResponseSchema(name="analysis", description="Brief analysis of the code's correctness and logic"),
        ResponseSchema(name="hints", description="List of 3 progressive hints: Conceptual, Directional, Eureka Question", type="list"),
    ]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template="""
You are an expert CS instructor providing guidance to students learning to code.

Analyze the following student code and provide helpful hints without giving away the solution.

Code to analyze:
{code}

{format_instructions}

Focus on:
- Identifying logical errors or misconceptions
- Providing progressive hints that build understanding
- Encouraging the student to think through the problem

Remember: Don't give the answer directly - guide them to discover it themselves.
""",
        input_variables=["code"],
        partial_variables={"format_instructions": format_instructions}
    )

    try:
        chain = prompt | llm | output_parser
        result = chain.invoke({"code": code[:2000]})  # Limit code length
        return {
            "analysis": result.get("analysis", "Code analysis complete."),
            "hints": result.get("hints", []),
            "phase": "3-ai-tutor",
        }
    except Exception as e:
        return {
            "analysis": "Unable to analyze code at this time.",
            "hints": ["Try running your code to see error messages.", "Check your logic step by step.", "Consider what the expected output should be."],
            "phase": "3-fallback-tutor",
        }


def generate_coding_challenge_ai(text: str):
    """
    Generate a Python coding challenge based on the study material
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "title": "API Key Required",
            "task": "Please set your OPENAI_API_KEY in the .env file to generate coding challenges.",
            "starter_code": "def solve():\n    # Your code here\n    pass",
            "test_cases": [],
        }

    llm = ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=api_key)

    response_schemas = [
        ResponseSchema(name="title", description="Catchy title for the coding challenge"),
        ResponseSchema(name="task", description="Clear description of what the student needs to implement"),
        ResponseSchema(name="starter_code", description="Python starter code with def solve(): function"),
        ResponseSchema(name="test_cases", description="List of hidden test cases (input/output pairs)", type="list"),
    ]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template="""
Act as a CS Instructor. Based on these notes, generate a Python coding challenge that reinforces the concepts.

Notes: {text}

Create a challenge that:
- Is appropriate difficulty for the topic
- Has a clear, solvable problem
- Includes starter code with a solve() function
- Provides test cases for validation

{format_instructions}
""",
        input_variables=["text"],
        partial_variables={"format_instructions": format_instructions}
    )

    try:
        chain = prompt | llm | output_parser
        result = chain.invoke({"text": text[:4000]})
        return result
    except Exception as e:
        return {
            "title": "Sample Challenge",
            "task": "Write a function that returns 'Hello, World!'",
            "starter_code": "def solve():\n    return 'Hello, World!'",
            "test_cases": [{"input": [], "output": "Hello, World!"}],
        }


def smart_study_sheet(text: str):
    """
    Phase 2: AI-powered structured study sheet using GPT-4o
    """
    text = text.strip()
    if not text:
        return {
            "main_idea": "No content found.",
            "sections": [],
            "questions": [],
            "tips": ["Try uploading a PDF with more text."],
            "core_terms": [],
            "flashcards": [],
            "phase": "2-ai-powered",
        }

    # Initialize OpenAI model
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "main_idea": "OpenAI API key not configured.",
            "sections": [],
            "questions": [],
            "tips": ["Please set your OPENAI_API_KEY in the .env file."],
            "core_terms": [],
            "flashcards": [],
            "phase": "2-ai-powered",
        }

    llm = ChatOpenAI(model="gpt-4o", temperature=0.3, api_key=api_key)

    # Define output schema
    response_schemas = [
        ResponseSchema(name="main_idea", description="A concise headline summarizing the main topic of the text (max 200 chars)"),
        ResponseSchema(name="key_concepts", description="List of 5-8 key concepts or terms from the text", type="list"),
        ResponseSchema(name="examples", description="List of 3-5 real-world examples or applications of the concepts", type="list"),
        ResponseSchema(name="sections", description="Break down the text into 3-6 logical sections, each with title, summary, and difficulty level", type="list", items={
            "title": "string",
            "summary": "string",
            "difficulty": "string (Easy/Medium/Hard)"
        }),
        ResponseSchema(name="questions", description="6 practice questions based on the content", type="list"),
        ResponseSchema(name="tips", description="3 study tips for this material", type="list"),
    ]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template="""
You are an expert educator creating a study guide from lecture notes or textbook content.

Analyze the following text and create a comprehensive study sheet. Focus on:
- Extracting the core topic and main idea
- Identifying key concepts and terminology
- Providing practical examples
- Breaking down complex topics into digestible sections
- Creating effective study questions and tips

Text to analyze:
{text}

{format_instructions}

Ensure the output is educational, accurate, and engaging for students.
""",
        input_variables=["text"],
        partial_variables={"format_instructions": format_instructions}
    )

    try:
        chain = prompt | llm | output_parser
        result = chain.invoke({"text": text[:8000]})  # Limit text length

        # Process sections to add key_terms and flashcards
        sections = result.get("sections", [])
        core_terms = result.get("key_concepts", [])[:10]

        flashcards = []
        for term in core_terms:
            flashcards.append({
                "term": term,
                "definition": f"In your notes, {term} appears as an important concept. Summarize its meaning and significance in your own words."
            })

        return {
            "main_idea": result.get("main_idea", "Analysis complete."),
            "sections": sections,
            "questions": result.get("questions", []),
            "tips": result.get("tips", []),
            "core_terms": core_terms,
            "flashcards": flashcards,
            "phase": "2-ai-powered",
        }

    except Exception as e:
        # Fallback to fake AI if API fails
        return _fallback_study_sheet(text)


def _fallback_study_sheet(text: str):
    """
    Fallback fake AI study sheet when API fails
    """
    sections_raw = _split_into_sections(text)
    first_section = sections_raw[0]
    main_idea = _summary_from_section(first_section, max_len=320)

    sections_payload = []
    term_section_map = {}

    for idx, sec in enumerate(sections_raw, start=1):
        summary = _summary_from_section(sec)
        words_in_sec = re.findall(r"\b[a-zA-Z]{3,}\b", sec)
        word_count = len(words_in_sec)
        terms, term_counts = _key_terms(sec)
        unique_terms = len(terms)
        difficulty = _difficulty_tag(word_count, unique_terms)

        for term in terms:
            term_section_map.setdefault(term, set()).add(idx)

        sections_payload.append(
            {
                "title": f"Section {idx}",
                "summary": summary,
                "key_terms": terms,
                "difficulty": difficulty,
            }
        )

    core_terms = [term for term, sec_ids in term_section_map.items() if len(sec_ids) >= 2]
    all_terms_ordered = list(dict.fromkeys([t for sec in sections_payload for t in sec["key_terms"]]))
    questions = _make_questions(all_terms_ordered)
    flashcards = _make_flashcards(core_terms or all_terms_ordered)

    tips = [
        "Review sections tagged 'Hard' more than once and relate them to examples.",
        "Turn core terms into written definitions in your own words.",
        "Use the questions and flashcards as a self‑quiz before exams.",
    ]

    return {
        "main_idea": main_idea,
        "sections": sections_payload,
        "questions": questions,
        "tips": tips,
        "core_terms": core_terms,
        "flashcards": flashcards,
        "phase": "2-fallback-fake-ai",
    }
