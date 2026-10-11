from datetime import date, datetime
from typing import Any


def calculate_relevance(
    listing: dict[str, Any],
    target_budget: float | None,
) -> float:
    """
    Calculate relevance using price closeness to the user's target budget
    and listing recency.
    """
    # Budget score: closer to the target budget gets a higher score.
    if target_budget is not None and target_budget > 0:
        price = float(listing["price"])
        difference = abs(price - target_budget)
        budget_score = max(0.0, 1.0 - (difference / target_budget))
    else:
        budget_score = 1.0

    # Recency score: newer listings get a higher score.
    listed_date = datetime.strptime(
        listing["listedDate"], "%Y-%m-%d"
    ).date()

    days_old = max(0, (date.today() - listed_date).days)
    recency_score = 1.0 / (1.0 + (days_old / 30.0))

    # Budget is weighted slightly more heavily than recency.
    relevance_score = (0.7 * budget_score) + (0.3 * recency_score)

    return round(relevance_score, 4)


def search_listings(
    listings: list[dict[str, Any]],
    min_price: float | None = None,
    max_price: float | None = None,
    min_bedrooms: int | None = None,
    city: str | None = None,
    keyword: str | None = None,
    target_budget: float | None = None,
    page: int = 1,
    page_size: int = 5,
) -> dict[str, Any]:

    # Validate input instead of silently returning incorrect results.
    if min_price is not None and min_price < 0:
        raise ValueError("minPrice cannot be negative.")

    if max_price is not None and max_price < 0:
        raise ValueError("maxPrice cannot be negative.")

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise ValueError("minPrice cannot be greater than maxPrice.")

    if min_bedrooms is not None and min_bedrooms < 0:
        raise ValueError("minBedrooms cannot be negative.")

    if target_budget is not None and target_budget <= 0:
        raise ValueError("targetBudget must be greater than zero.")

    if page < 1:
        raise ValueError("page must be at least 1.")

    if page_size <= 0:
        raise ValueError("pageSize must be greater than zero.")

    results = []

    for listing in listings:
        # Apply optional filters.
        if min_price is not None and listing["price"] < min_price:
            continue

        if max_price is not None and listing["price"] > max_price:
            continue

        if (
            min_bedrooms is not None
            and listing["bedrooms"] < min_bedrooms
        ):
            continue

        if city and listing["city"].lower() != city.strip().lower():
            continue

        if (
            keyword
            and keyword.strip().lower()
            not in listing.get("description", "").lower()
        ):
            continue

        result = listing.copy()
        result["relevanceScore"] = calculate_relevance(
            listing, target_budget
        )
        results.append(result)

    # Highest relevance first. The secondary keys make ties deterministic.
    results.sort(
        key=lambda item: (
            -item["relevanceScore"],
            -item["price"],
            item["source"],
            item["id"],
        )
    )

    total = len(results)
    start = (page - 1) * page_size
    end = start + page_size

    return {
        "results": results[start:end],
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": (total + page_size - 1) // page_size,
    }