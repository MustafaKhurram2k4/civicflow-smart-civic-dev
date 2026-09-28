from pydantic import BaseModel
from fastapi import APIRouter
from services.ai_service import analyze_complaint_text_with_gemini

router = APIRouter(prefix="/ai", tags=["AI Smart Assist"])

class ClassifyRequest(BaseModel):
    description: str

class ClassifyResponse(BaseModel):
    category: str
    urgency: str
    summary: str

@router.post("/classify", response_model=ClassifyResponse)
async def classify_complaint(body: ClassifyRequest):
    """
    Analyzes complaint description and returns category, urgency and concise summary.
    """
    res = await analyze_complaint_text_with_gemini(body.description)
    return ClassifyResponse(**res)
