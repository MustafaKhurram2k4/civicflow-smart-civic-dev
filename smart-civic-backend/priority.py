def calculate_priority(category, age_in_days, similar_count):
    category_scores = {
        "pothole": 90,
        "road_damage": 80,
        "garbage": 70,
        "other": 50
    }

    # Maximum age score is reached after 10 days
    age_score = min((age_in_days / 10) * 100, 100)

    # Maximum similarity score is reached at 10 complaints
    similar_score = min((similar_count / 10) * 100, 100)

    normalized_category = category.lower().replace(" ", "_").replace("-", "_")
    category_score = category_scores.get(normalized_category, 50)

    priority_score = (
        (0.45 * age_score)
        + (0.35 * category_score)
        + (0.20 * similar_score)
    )

    if priority_score >= 80:
        priority = "Critical"
    elif priority_score >= 60:
        priority = "High"
    elif priority_score >= 40:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "score": round(priority_score, 2),
        "priority": priority
    }
