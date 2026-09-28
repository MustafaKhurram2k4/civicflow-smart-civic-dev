from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from database import get_database
from models.complaint import (
    AnalyticsReport, AnalyticsStats, DistributionItem, HotspotItem, SLAItem,
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

PERIOD_LABELS = {
    "daily": "Daily",
    "weekly": "Weekly",
    "half-monthly": "Half Monthly",
    "monthly": "Monthly",
}

def _period_start(period: str, now: datetime) -> datetime:
    if period == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "weekly":
        return now - timedelta(days=7)
    if period == "half-monthly":
        return now - timedelta(days=15)
    return now - timedelta(days=30)


def _empty_report(period: str, now: datetime | None = None) -> Dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    start = _period_start(period, now)
    return {
        "period": period,
        "period_label": PERIOD_LABELS[period],
        "start": start.isoformat(),
        "end": now.isoformat(),
        "summary": {
            "total": 0,
            "resolved": 0,
            "pending": 0,
            "urgent": 0,
            "resolution_rate": 0.0,
        },
        "categories": [],
        "statuses": [],
        "priorities": [],
        "trend": [],
        "hotspots": [],
        "aging": {
            "0-2 days": 0,
            "3-7 days": 0,
            "8-14 days": 0,
            ">14 days": 0,
        },
    }


async def build_analytics_report(period: str = "weekly") -> Dict[str, Any]:
    if period not in PERIOD_LABELS:
        raise HTTPException(status_code=400, detail="Invalid analytics period")

    db = get_database()
    now = datetime.now(timezone.utc)
    if db is None:
        return _empty_report(period, now)

    start = _period_start(period, now)
    collection = db["complaints"]

    # Some existing documents may have naive UTC datetimes. MongoDB stores these as BSON dates,
    # so comparing against aware UTC datetimes is safe at the driver level.
    match = {"created_at": {"$gte": start, "$lte": now}}

    pipeline = [
        {"$match": match},
        {"$facet": {
            "summary": [
                {"$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "Resolved"]}, 1, 0]}},
                    "pending": {"$sum": {"$cond": [{"$ne": ["$status", "Resolved"]}, 1, 0]}},
                    "urgent": {"$sum": {"$cond": [{"$in": ["$priority", ["Critical", "High"]]}, 1, 0]}},
                }}
            ],
            "categories": [
                {"$group": {"_id": {"$ifNull": ["$category", "Other"]}, "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ],
            "statuses": [
                {"$group": {"_id": {"$ifNull": ["$status", "Unknown"]}, "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ],
            "priorities": [
                {"$group": {"_id": {"$ifNull": ["$priority", "Unknown"]}, "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ],
            "trend": [
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "count": {"$sum": 1},
                }},
                {"$sort": {"_id": 1}},
            ],
            "hotspots": [
                {"$group": {"_id": {"$ifNull": ["$location", "Unknown" ]}, "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 8},
            ],
        }},
    ]

    result = (await collection.aggregate(pipeline).to_list(length=1))
    facet = result[0] if result else {}
    summary_raw = (facet.get("summary") or [{}])[0]

    total = int(summary_raw.get("total", 0))
    if total == 0:
        return _empty_report(period, now)

    resolved = int(summary_raw.get("resolved", 0))
    pending = int(summary_raw.get("pending", 0))
    urgent = int(summary_raw.get("urgent", 0))

    # Aging is calculated from the same period's complaints and their created_at timestamps.
    aging_pipeline = [
        {"$match": {**match, "status": {"$ne": "Resolved"}}},
        {"$project": {
            "age_days": {"$floor": {"$divide": [{"$subtract": [now, "$created_at"]}, 86400000]}},
        }},
        {"$group": {
            "_id": None,
            "d0_2": {"$sum": {"$cond": [{"$lte": ["$age_days", 2]}, 1, 0]}},
            "d3_7": {"$sum": {"$cond": [{"$and": [{"$gte": ["$age_days", 3]}, {"$lte": ["$age_days", 7]}]}, 1, 0]}},
            "d8_14": {"$sum": {"$cond": [{"$and": [{"$gte": ["$age_days", 8]}, {"$lte": ["$age_days", 14]}]}, 1, 0]}},
            "d15_plus": {"$sum": {"$cond": [{"$gte": ["$age_days", 15]}, 1, 0]}},
        }},
    ]
    aging_raw = (await collection.aggregate(aging_pipeline).to_list(length=1))
    aging = aging_raw[0] if aging_raw else {"d0_2": 0, "d3_7": 0, "d8_14": 0, "d15_plus": 0}

    resolution_rate = round((resolved / total) * 100, 1) if total else 0.0

    return {
        "period": period,
        "period_label": PERIOD_LABELS[period],
        "start": start.isoformat(),
        "end": now.isoformat(),
        "summary": {
            "total": total,
            "resolved": resolved,
            "pending": pending,
            "urgent": urgent,
            "resolution_rate": resolution_rate,
        },
        "categories": [{"category": x["_id"], "count": x["count"]} for x in facet.get("categories", [])],
        "statuses": [{"status": x["_id"], "count": x["count"]} for x in facet.get("statuses", [])],
        "priorities": [{"priority": x["_id"], "count": x["count"]} for x in facet.get("priorities", [])],
        "trend": [{"date": x["_id"], "count": x["count"]} for x in facet.get("trend", [])],
        "hotspots": [{"location": x["_id"], "count": x["count"]} for x in facet.get("hotspots", [])],
        "aging": {
            "0-2 days": int(aging.get("d0_2", 0)),
            "3-7 days": int(aging.get("d3_7", 0)),
            "8-14 days": int(aging.get("d8_14", 0)),
            ">14 days": int(aging.get("d15_plus", 0)),
        },
    }


@router.get("/report", response_model=AnalyticsReport)
async def get_analytics_report(
    period: str = Query("weekly", pattern="^(daily|weekly|half-monthly|monthly)$")
):
    return await build_analytics_report(period)


@router.get("/stats", response_model=AnalyticsStats)
async def get_stats():
    report = await build_analytics_report("monthly")
    s = report["summary"]
    return AnalyticsStats(
        active=s["pending"],
        resolved=s["resolved"],
        urgent=s["urgent"],
        response="-",
    )


@router.get("/distribution", response_model=List[DistributionItem])
async def get_distribution():
    report = await build_analytics_report("monthly")
    return [DistributionItem(category=x["category"], count=x["count"]) for x in report["categories"]]


@router.get("/sla", response_model=List[SLAItem])
async def get_sla():
    return []


@router.get("/hotspots", response_model=List[HotspotItem])
async def get_hotspots():
    report = await build_analytics_report("monthly")
    return [HotspotItem(location=x["location"], count=x["count"]) for x in report["hotspots"]]
