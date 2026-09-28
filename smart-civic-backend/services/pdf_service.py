from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Dict, Iterable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, HRFlowable, PageBreak
)


NAVY = colors.HexColor("#17324D")
BLUE = colors.HexColor("#315F8C")
PURPLE = colors.HexColor("#6D5DFC")
LIGHT = colors.HexColor("#F4F7FB")
MUTED = colors.HexColor("#607080")
GREEN = colors.HexColor("#168A5B")
AMBER = colors.HexColor("#B7791F")
RED = colors.HexColor("#C0392B")


def _fmt_percent(value: Any) -> str:
    try:
        return f"{float(value):.1f}%"
    except Exception:
        return "-"


def _safe(value: Any) -> str:
    return "-" if value in (None, "") else str(value)


def _page_header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 9 * mm, width, 9 * mm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(18 * mm, height - 6 * mm, "CIVICFLOW  |  MUNICIPAL INTELLIGENCE")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm, "CivicFlow AI Report")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def _bar_chart(title: str, items: Iterable[dict], width=165 * mm, height=72 * mm):
    from reportlab.graphics.shapes import Drawing, Rect, String

    items = list(items)[:8]
    d = Drawing(width, height)
    d.add(String(0, height - 10, title, fontName="Helvetica-Bold", fontSize=10, fillColor=NAVY))
    if not items:
        d.add(String(0, height - 28, "No data available for this period.", fontSize=8, fillColor=MUTED))
        return d

    max_value = max(float(x.get("count", 0)) for x in items) or 1
    bar_h = 7 * mm
    gap = 2.5 * mm
    start_y = height - 22 * mm
    for i, item in enumerate(items):
        y = start_y - i * (bar_h + gap)
        label = str(item.get("label", "Unknown"))[:28]
        value = float(item.get("count", 0))
        d.add(String(0, y + 2, label, fontSize=7, fillColor=MUTED))
        x = 48 * mm
        usable = width - x - 15 * mm
        d.add(Rect(x, y, usable, bar_h, fillColor=LIGHT, strokeColor=colors.white))
        d.add(Rect(x, y, usable * value / max_value, bar_h, fillColor=PURPLE, strokeColor=None))
        d.add(String(x + usable + 2 * mm, y + 2, str(int(value)), fontSize=7, fillColor=NAVY))
    return d


def _line_chart(title: str, items: Iterable[dict], width=165 * mm, height=70 * mm):
    from reportlab.graphics.shapes import Drawing, Line, Circle, String

    items = list(items)
    d = Drawing(width, height)
    d.add(String(0, height - 10, title, fontName="Helvetica-Bold", fontSize=10, fillColor=NAVY))
    if len(items) < 2:
        d.add(String(0, height - 28, "Not enough trend points for a chart.", fontSize=8, fillColor=MUTED))
        return d
    left, right, bottom, top = 12 * mm, width - 8 * mm, 12 * mm, height - 20 * mm
    values = [float(x.get("count", 0)) for x in items]
    max_v = max(values) or 1
    d.add(Line(left, bottom, right, bottom, strokeColor=colors.HexColor("#CBD5E1")))
    d.add(Line(left, bottom, left, top, strokeColor=colors.HexColor("#CBD5E1")))
    points = []
    for i, value in enumerate(values):
        x = left + (right - left) * i / (len(values) - 1)
        y = bottom + (top - bottom) * value / max_v
        points.append((x, y))
    for a, b in zip(points, points[1:]):
        d.add(Line(a[0], a[1], b[0], b[1], strokeColor=BLUE, strokeWidth=2))
    for i, (x, y) in enumerate(points):
        d.add(Circle(x, y, 1.7, fillColor=PURPLE, strokeColor=colors.white, strokeWidth=0.6))
        if i in (0, len(points) - 1):
            d.add(String(x, bottom - 8, str(items[i].get("label", ""))[:10], fontSize=6, fillColor=MUTED))
    return d


def build_pdf(analytics: Dict[str, Any], ai_report: Dict[str, Any]) -> bytes:
    buffer = BytesIO()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=NAVY, alignment=TA_LEFT, spaceAfter=8))
    styles.add(ParagraphStyle(name="SubTitle", parent=styles["Normal"], fontSize=11, leading=16, textColor=MUTED, spaceAfter=4))
    styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=NAVY, spaceBefore=8, spaceAfter=7))
    styles.add(ParagraphStyle(name="BodyCivic", parent=styles["BodyText"], fontSize=9.3, leading=14, textColor=colors.HexColor("#253746"), spaceAfter=6))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=7.8, leading=11, textColor=MUTED))
    styles.add(ParagraphStyle(name="Kpi", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=NAVY, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="KpiLabel", parent=styles["BodyText"], fontSize=7.5, leading=9, textColor=MUTED, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="BulletCivic", parent=styles["BodyText"], fontSize=9, leading=13, leftIndent=12, firstLineIndent=-7, textColor=colors.HexColor("#253746"), spaceAfter=5))

    doc = BaseDocTemplate(
        buffer, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=16 * mm,
        title="CivicFlow Municipal Intelligence Report",
        author="CivicFlow"
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="civic", frames=[frame], onPage=_page_header_footer)])

    story = []
    period_label = analytics.get("period_label", analytics.get("period", "Selected period")).title()
    generated = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")

    story += [Spacer(1, 12 * mm), Paragraph("CivicFlow", styles["CoverTitle"]), Paragraph("Municipal Intelligence Report", styles["CoverTitle"])]
    story.append(Paragraph(f"<b>Reporting period:</b> {_safe(period_label)}", styles["SubTitle"]))
    story.append(Paragraph(f"<b>Generated:</b> {generated}", styles["SubTitle"]))
    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D8E0E8")))
    story.append(Spacer(1, 6 * mm))

    summary = analytics.get("summary", {})
    kpis = [
        ("Total complaints", summary.get("total", 0)),
        ("Resolved", summary.get("resolved", 0)),
        ("Pending", summary.get("pending", 0)),
        ("Resolution rate", _fmt_percent(summary.get("resolution_rate", 0))),
    ]
    data = [[Paragraph(str(v), styles["Kpi"]) for _, v in kpis], [Paragraph(k, styles["KpiLabel"]) for k, _ in kpis]]
    table = Table(data, colWidths=[doc.width / 4] * 4, rowHeights=[13 * mm, 8 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT), ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D8E0E8")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D8E0E8")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(table)

    story.append(Paragraph("Executive Summary", styles["Section"]))
    story.append(Paragraph(_safe(ai_report.get("executive_summary")), styles["BodyCivic"]))

    story.append(Paragraph("Key Metrics Overview", styles["Section"]))
    for item in ai_report.get("key_metrics_overview", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    story.append(Paragraph("Key Findings", styles["Section"]))
    for item in ai_report.get("key_findings", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    categories = [{"label": x.get("category", "Unknown"), "count": x.get("count", 0)} for x in analytics.get("categories", [])]
    trend = [{"label": x.get("date", ""), "count": x.get("count", 0)} for x in analytics.get("trend", [])]
    story.append(Spacer(1, 3 * mm))
    story.append(_bar_chart("Complaint categories", categories))
    story.append(Spacer(1, 4 * mm))
    story.append(_line_chart("Complaint trend", trend))

    story.append(PageBreak())
    story.append(Paragraph("Trend Analysis", styles["Section"]))
    for item in ai_report.get("trend_analysis", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    story.append(Paragraph("Category / Departmental Breakdown", styles["Section"]))
    for item in ai_report.get("category_breakdown", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    story.append(Paragraph("Operational Risk & Hotspots", styles["Section"]))
    for item in ai_report.get("hotspot_insights", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    hotspots = analytics.get("hotspots", [])[:8]
    hotspot_rows = [["Rank", "Location", "Complaints"]]
    for i, item in enumerate(hotspots, 1):
        hotspot_rows.append([str(i), _safe(item.get("location")), str(item.get("count", 0))])
    if len(hotspot_rows) > 1:
        t = Table(hotspot_rows, colWidths=[16 * mm, 118 * mm, 30 * mm], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D8E0E8")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"), ("ALIGN", (2, 0), (2, -1), "CENTER"),
        ]))
        story.append(t)

    story.append(Paragraph("Priority Concerns", styles["Section"]))
    for item in ai_report.get("priority_concerns", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))

    story.append(Paragraph("Recommended Actions", styles["Section"]))
    rec_rows = [["Priority", "Recommended action", "Rationale"]]
    for rec in ai_report.get("recommendations", []):
        rec_rows.append([_safe(rec.get("priority")), _safe(rec.get("action")), _safe(rec.get("reason"))])
    if len(rec_rows) > 1:
        t = Table(rec_rows, colWidths=[27 * mm, 72 * mm, 65 * mm], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 7.5),
            ("LEADING", (0, 0), (-1, -1), 10), ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D8E0E8")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(t)

    story.append(Paragraph("Verified Analytics", styles["Section"]))
    priority_rows = [["Priority", "Count"]] + [[_safe(x.get("priority")), str(x.get("count", 0))] for x in analytics.get("priorities", [])]
    status_rows = [["Status", "Count"]] + [[_safe(x.get("status")), str(x.get("count", 0))] for x in analytics.get("statuses", [])]
    mini = Table([
        [Table(priority_rows, colWidths=[50 * mm, 25 * mm]), Table(status_rows, colWidths=[50 * mm, 25 * mm])]
    ], colWidths=[80 * mm, 80 * mm])
    for inner in [mini._cellvalues[0][0], mini._cellvalues[0][1]]:
        pass
    mini.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(mini)

    story.append(Paragraph("Conclusion", styles["Section"]))
    story.append(Paragraph(_safe(ai_report.get("conclusion")), styles["BodyCivic"]))
    story.append(Paragraph("Data Notes", styles["Section"]))
    for item in ai_report.get("data_notes", []):
        story.append(Paragraph(f"- {item}", styles["BulletCivic"]))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("Note: Numerical values in this report are sourced from CivicFlow's analytics layer. AI-generated sections are interpretive and should be reviewed by municipal staff before formal action.", styles["Small"]))

    doc.build(story)
    return buffer.getvalue()
