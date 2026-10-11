import { useEffect, useState } from "react";
import "./App.css";

type Listing = {
  id: string;
  source: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  relevanceScore: number;
};

type SearchResponse = {
  results: Listing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function App() {
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [keyword, setKeyword] = useState("");
  const [targetBudget, setTargetBudget] = useState("");

  const [results, setResults] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 2;

  const searchListings = async (requestedPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (city.trim()) params.append("city", city.trim());
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (minBedrooms) params.append("minBedrooms", minBedrooms);
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (targetBudget) params.append("targetBudget", targetBudget);

      params.append("page", String(requestedPage));
      params.append("pageSize", String(pageSize));

      const response = await fetch(
        `http://localhost:8000/listings?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to search listings.");
      }

      const searchData = data as SearchResponse;

      setResults(searchData.results);
      setPage(searchData.page);
      setTotal(searchData.total);
      setTotalPages(searchData.totalPages);
    } catch (err) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while searching.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial results.
  useEffect(() => {
    searchListings(1);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic client-side validation for a clearer user experience.
    if (
      minPrice &&
      maxPrice &&
      Number(minPrice) > Number(maxPrice)
    ) {
      setError("Minimum price cannot be greater than maximum price.");
      return;
    }

    searchListings(1);
  };

  return (
    <main className="container">
      <h1>Property Listing Search</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Min Bedrooms"
          value={minBedrooms}
          onChange={(e) => setMinBedrooms(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Target Budget"
          value={targetBudget}
          onChange={(e) => setTargetBudget(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && <p className="status">Loading properties...</p>}

      {!loading && !error && (
        <>
          <p className="status">
            Found {total} {total === 1 ? "property" : "properties"}
          </p>

          {results.length === 0 ? (
            <p className="no-results">
              No properties matched your search.
            </p>
          ) : (
            <div className="results">
              {results.map((listing) => (
                <article
                  className="listing-card"
                  key={`${listing.source}-${listing.id}`}
                >
                  <h2>{listing.address}</h2>

                  <p>
                    {listing.city}, {listing.state} {listing.zip}
                  </p>

                  <p className="price">
                    ${listing.price.toLocaleString()}
                  </p>

                  <p>
                    {listing.bedrooms} beds · {listing.bathrooms} baths ·{" "}
                    {listing.sqft.toLocaleString()} sqft
                  </p>

                  <p>{listing.description}</p>

                  <p className="score">
                    Relevance Score:{" "}
                    {Number(listing.relevanceScore).toFixed(3)}
                  </p>
                </article>
              ))}
            </div>
          )}

          {totalPages > 0 && (
            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => searchListings(page - 1)}
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => searchListings(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default App;