import logging
from typing import Dict, Any
from priority import calculate_priority

logger = logging.getLogger(__name__)

def calculate_priority_score(category: str, age_days: int, similar_count: int = 0) -> Dict[str, Any]:
    """
    Rule-based prioritization based on:
    1. Issue Category weight
    2. Age of the complaint (days)
    3. Volume of similar complaints in the same location/category
    """
    result = calculate_priority(
        category=category,
        age_in_days=age_days,
        similar_count=similar_count,
    )

    return {
        "score": result["score"],
        "priority": result["priority"],
        "breakdown": {
            "age_days": age_days,
            "similar_count": similar_count
        }
    }
