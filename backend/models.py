from typing import Any, Literal

from pydantic import BaseModel


class StudyGuideRequest(BaseModel):
    text: str


class StatusResponse(BaseModel):
    name: str
    phase: str
    features: list[str]
    ready: bool


class UploadImage(BaseModel):
    page: int
    index: int
    width: int
    height: int
    base64: str


class UploadResponse(BaseModel):
    filename: str
    title: str
    author: str
    page_count: int
    text_preview: str
    full_text: str
    page_texts: list[str]
    images: list[UploadImage]


class StudySheetSection(BaseModel):
    title: str
    summary: str
    difficulty: str


class Flashcard(BaseModel):
    term: str
    definition: str


class StudySheetResponse(BaseModel):
    main_idea: str
    sections: list[StudySheetSection]
    questions: list[str]
    tips: list[str]
    core_terms: list[str]
    flashcards: list[Flashcard]
    phase: str


class CodingChallengeTestCase(BaseModel):
    input: Any | None = None
    output: Any | None = None


class CodingChallengeResponse(BaseModel):
    title: str
    task: str
    starter_code: str
    test_cases: list[CodingChallengeTestCase]


class CodeRunResult(BaseModel):
    status: Literal["success", "error", "timeout"]
    output: str
    error: str
    code_preview: str


class CodeAnalysisResponse(BaseModel):
    analysis: str
    hints: list[str]
    phase: str

