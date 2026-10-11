import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services import search_listings


app = FastAPI(title="Property Listing Search API")

# Allow the React frontend to call the API during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the provided sample dataset.
DATA_FILE = Path(__file__).parent / "sample_listings.json"

with DATA_FILE.open("r", encoding="utf-8") as file:
    LISTINGS = json.load(file)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/listings")
def get_listings(
    minPrice: float | None = Query(default=None, ge=0),
    maxPrice: float | None = Query(default=None, ge=0),
    minBedrooms: int | None = Query(default=None, ge=0),
    city: str | None = None,
    keyword: str | None = None,
    targetBudget: float | None = Query(default=None, gt=0),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=5, ge=1, le=100),
):
    try:
        return search_listings(
            listings=LISTINGS,
            min_price=minPrice,
            max_price=maxPrice,
            min_bedrooms=minBedrooms,
            city=city,
            keyword=keyword,
            target_budget=targetBudget,
            page=page,
            page_size=pageSize,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error