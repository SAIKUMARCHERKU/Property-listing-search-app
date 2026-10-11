# Property Listing Search

My Application searching property listings here I used FastAPI for the backend and React with TypeScript for the frontend.

The application uses the provided sample listing data and allows users to search, filter, rank, and move through the results.

## Features

- Filter by minimum and maximum price
- Filter by minimum bedrooms
- Filter by city
- Search by keyword in the property description
- Rank results using a target budget
- Pagination with Previous and Next
- Loading, no-results, and error handling

## Relevance Score

For the relevance score, I used the target budget and the listing date.

I gave more weight to how close the property price is to the target budget because I think that is more useful when a user provides a budget. I also use the listing date so newer properties get some additional weight.

The score is:

`70% budget match + 30% recency`

I kept the scoring simple so it is easy to understand and works well for the provided dataset. If two results have the same score, the ordering is kept consistent.

## Validation

I added validation for invalid input instead of returning incorrect results.

For example:

- Minimum price cannot be greater than maximum price
- Price values cannot be negative
- Bedrooms cannot be negative
- Page and page size must be valid

If a search is valid but there are no matching properties, the API returns an empty result.

## Pagination

The API accepts `page` and `pageSize`.

The response includes the current page, page size, total number of matching properties, total pages, and the results for the current page.

## Run the Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The API runs at:

`http://localhost:8000`

API documentation:

`http://localhost:8000/docs`

## Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

`http://localhost:5173`

## Tests

Run the tests from the project root:

```bash
pytest
```

The tests cover the main search logic and edge cases such as no matches, invalid filter values, tied scores, and pagination boundaries.

## Trade-offs

Since the provided dataset is small, I load the JSON data into memory and perform the filtering and ranking in the application. This keeps the implementation simple for this exercise.

For a larger production dataset, I would move the data into a database or search service and perform filtering and pagination there.

I kept the frontend simple and focused mainly on making the search work correctly end to end and handling the required states.