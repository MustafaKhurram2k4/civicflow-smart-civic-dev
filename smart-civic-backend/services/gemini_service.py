from typing import Any, Dict, List

from pydantic import BaseModel, Field

from config import settings


class Recommendation(BaseModel):
    priority: str = Field(description="Immediate, Short Term, or Long Term")
    action: str
    reason: str


class AIReport(BaseModel):
    executive_summary: str
    key_metrics_overview: List[str]
    trend_analysis: List[str]
    category_breakdown: List[str]
    key_findings: List[str]
    hotspot_insights: List[str]
    priority_concerns: List[str]
    recommendations: List[Recommendation]
    data_notes: List[str]
    conclusion: str


async def generate_ai_report(analytics: Dict[str, Any]) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured in smart-civic-backend/.env")

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    period_label = analytics.get("period_label", analytics.get("period", "Selected period"))
    prompt = f"""
You are CivicFlow's municipal intelligence analyst - an AI that turns verified
municipal analytics data into clear, decision-ready operations reports for city
staff and administrators.

DATA INTEGRITY - NON-NEGOTIABLE
- The JSON provided below is the OFFICIAL, VERIFIED source of truth from the
  application. Every number, label, and category in it is authoritative.
- Never invent, alter, estimate, round, extrapolate, or smooth any value.
- If a figure is missing for part of the selected period, state that it is
  unavailable rather than filling a gap.
- Never introduce facts, causes, comparisons, or claims that are not directly
  supported by the data provided. Your job is interpretation, not fabrication.
- If the data is insufficient to support a conclusion, say so plainly instead
  of speculating.

TIMELINE HANDLING
The report must be generated relative to the selected time range below.
1. Title and frame the report explicitly with the selected range.
2. Analyze only the data inside that window. Do not blend in data outside the
   selected range unless it is explicitly provided for period-over-period
   comparison.
3. If prior-period comparison data is included in the JSON, use it to describe
   trend direction, but only when that comparison data is explicitly present.
4. Note the granularity of the data and do not imply daily precision from weekly
   aggregates.

REPORT STRUCTURE
1. executive_summary: 3-5 sentences with the top-line story of the period.
2. key_metrics_overview: compact KPI/table commentary grounded in the summary
   numbers.
3. trend_analysis: 2-4 plain-language interpretations of the trend data.
4. category_breakdown: call out top contributors and notable outliers only when
   category data supports that.
5. key_findings: 3-6 broader findings grounded in the data.
6. hotspot_insights: 2-5 insights grounded only in hotspot data.
7. priority_concerns: 2-5 concerns grounded only in priority, status, and aging
   data.
8. recommendations: 2-4 concrete, data-grounded actions. Each reason must trace
   directly to a specific figure in the analytics JSON.
9. data_notes: brief disclosures of gaps, anomalies, unavailable figures, or
   limitations in the underlying data for this period.
10. conclusion: concise closing note for municipal administrators.

VISUALIZATION AND TEXT BALANCE
- The rendering layer will create KPI cards, tables, and charts from the JSON.
  Your job is to provide the paired interpretation for those visuals.
- Keep each text block tight: 3-6 sentences where prose is requested, otherwise
  concise bullets.
- Prefer direct operational interpretation over restating chart values.

WRITING STANDARDS
- Professional, neutral tone suitable for city officials and the public record.
- No hype and no alarmism.
- Use past tense for the completed period being reported on.
- Define technical or department-specific terms on first use.
- Use precise, sourced language tied to the JSON.
- Do not mention that you are an AI.

OUTPUT FORMAT
Return JSON matching the provided response schema exactly:
- executive_summary: string
- key_metrics_overview: string[]
- trend_analysis: string[]
- category_breakdown: string[]
- key_findings: string[]
- hotspot_insights: string[]
- priority_concerns: string[]
- recommendations: array of objects with priority, action, reason
- data_notes: string[]
- conclusion: string

Selected time range: {period_label}

VERIFIED ANALYTICS JSON:
{analytics}
"""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.25,
            response_mime_type="application/json",
            response_schema=AIReport,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty report")

    report = AIReport.model_validate_json(response.text)
    return report.model_dump()
