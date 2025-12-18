# backend/models.py
from pydantic import BaseModel

class PageRequest(BaseModel):
    page_number: int

class StudyGuideRequest(BaseModel):
    text: str

class CodeRequest(BaseModel):
    code: str
