from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from routes.analytics import build_analytics_report

router = APIRouter(prefix="/reports", tags=["AI Reports"])


@router.post("/generate")
async def generate_report(
    period: str = Query("monthly", pattern="^(daily|weekly|half-monthly|monthly)$")
):
    try:
        from services.gemini_service import generate_ai_report
        from services.pdf_service import build_pdf

        analytics = await build_analytics_report(period)
        ai_report = await generate_ai_report(analytics)
        pdf_bytes = build_pdf(analytics, ai_report)
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="AI report dependencies are not installed. Run pip install -r smart-civic-backend/requirements.txt.",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not generate report: {exc}") from exc

    filename = f"CivicFlow_{period}_Municipal_Intelligence_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
