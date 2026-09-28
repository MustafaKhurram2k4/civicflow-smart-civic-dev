from typing import Any, Dict

from pydantic import BaseModel, Field

from config import settings


class ComplaintAssistResult(BaseModel):
    category: str = Field(description="One of: Road Damage, Garbage, Pothole, Other")
    urgency: str = Field(description="One of: Low, Medium, High, Critical")
    summary: str = Field(description="A short, crisp citizen complaint description")

def analyze_complaint_text(description: str) -> Dict[str, Any]:
    """
    AI Smart Assist service:
    Extracts category, urgency level, and concise issue summary from unstructured complaint text.
    """
    text = description.lower()
    
    # 1. Category extraction
    if any(k in text for k in ["pothole", "hole"]):
        category = "Pothole"
    elif any(k in text for k in ["road", "tar", "asphalt", "lane", "traffic", "crack"]):
        category = "Road Damage"
    elif any(k in text for k in ["garbage", "waste", "trash", "dump", "bin", "clean"]):
        category = "Garbage"
    else:
        category = "Other"
        
    # 2. Urgency classification
    if any(k in text for k in ["danger", "accident", "school", "hazard", "emergency", "open drain", "severe"]):
        urgency = "High"
    elif any(k in text for k in ["week", "days", "overflow", "dark", "slowdown"]):
        urgency = "Medium"
    else:
        urgency = "Low"
        
    # 3. Summary generation
    clean_desc = description.strip()
    if len(clean_desc) > 110:
        summary = f"{clean_desc[:107]}..."
    else:
        summary = clean_desc
        
    return {
        "category": category,
        "urgency": urgency,
        "summary": summary
    }


async def analyze_complaint_text_with_gemini(description: str) -> Dict[str, Any]:
    clean_desc = description.strip()
    if not clean_desc:
        return {"category": "Other", "urgency": "Low", "summary": ""}

    if not settings.GEMINI_API_KEY:
        return analyze_complaint_text(clean_desc)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        return analyze_complaint_text(clean_desc)

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = f"""
You are CivicFlow Smart Assist for citizen civic complaints.

Rewrite the complaint description so it is short and crisp while preserving the real issue, place clues, duration, and safety concern if present.

Also classify:
- category must be exactly one of: Road Damage, Garbage, Pothole, Other
- urgency must be exactly one of: Low, Medium, High, Critical

Rules:
- Do not invent facts.
- Keep the summary to one sentence, ideally under 25 words.
- Use plain language suitable for a municipal complaint form.
- If the issue is not clearly road damage, garbage, or pothole, use Other.

Citizen description:
{clean_desc}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=ComplaintAssistResult,
            ),
        )
    except Exception:
        return analyze_complaint_text(clean_desc)

    if not response.text:
        return analyze_complaint_text(clean_desc)

    try:
        result = ComplaintAssistResult.model_validate_json(response.text)
    except Exception:
        return analyze_complaint_text(clean_desc)
    data = result.model_dump()
    if data["category"] not in {"Road Damage", "Garbage", "Pothole", "Other"}:
        data["category"] = "Other"
    if data["urgency"] not in {"Low", "Medium", "High", "Critical"}:
        data["urgency"] = "Medium"
    return data
