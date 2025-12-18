from pydantic import BaseModel

class StudyGuideRequest(BaseModel):
    text: str
