"use client";

import { useState, useEffect, useCallback } from "react";
import ChefCard from "@/components/guest/ChefCard";
import { apiService, type Chef } from "@/lib/api";

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const loadChefs = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getChefs({
        search: searchQuery || undefined,
        limit: 50,
      });
      setChefs(result.chefs || []);
      setTotalCount(result.pagination?.totalCount || 0);
      setActiveSearch(searchQuery || "");
    } catch (err) {
      console.error("Failed to fetch chefs:", err);
      setError(
        "Failed to load hosts. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all chefs on initial page load
  useEffect(() => {
    loadChefs();
  }, [loadChefs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadChefs(searchTerm.trim() || undefined);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    loadChefs();
  };

  return (
    <div className="fc-shell fc-page">
      <header className="fc-page-header">
        <div className="min-w-0">
          <p className="fc-eyebrow">Browse</p>
          <h1 className="fc-page-title">
            Hosts who are <em>cooking</em>
          </h1>
          <p className="fc-page-lead">
            Every host keeps their menu behind a secret. Find the one who
            invited you, then enter their code to see the night&rsquo;s dishes.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full md:max-w-sm">
          <label className="fc-label" htmlFor="chef-search">
            Search hosts
          </label>
          <div className="flex gap-2">
            <input
              id="chef-search"
              type="search"
              placeholder="Name, username, or bio"
              className="fc-control min-w-0 flex-1 px-4 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="fc-button fc-button-primary shrink-0 px-5">
              Search
            </button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="fc-loading" role="status">
          <span className="fc-spinner" aria-hidden="true" />
          Loading hosts
        </div>
      ) : error ? (
        <div className="fc-panel fc-empty">
          <h2 className="fc-empty-title">We couldn&rsquo;t load the hosts</h2>
          <p className="fc-empty-body">{error}</p>
          <div className="fc-empty-actions">
            <button
              onClick={() => loadChefs(activeSearch || undefined)}
              className="fc-button fc-button-primary"
            >
              Try again
            </button>
          </div>
        </div>
      ) : chefs.length === 0 ? (
        <div className="fc-panel fc-empty">
          <h2 className="fc-empty-title">
            {activeSearch ? "No hosts match that search" : "No hosts yet"}
          </h2>
          <p className="fc-empty-body">
            {activeSearch
              ? `Nothing came back for "${activeSearch}". Try a shorter search, or clear it to see everyone.`
              : "Nobody is hosting on ForkCast yet. Check back soon."}
          </p>
          {activeSearch && (
            <div className="fc-empty-actions">
              <button
                onClick={handleClearSearch}
                className="fc-button fc-button-secondary"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="fc-stat-label m-0">
              {activeSearch
                ? `${chefs.length} of ${totalCount} matching "${activeSearch}"`
                : `${chefs.length} of ${totalCount} hosts`}
            </p>
            {activeSearch && (
              <button
                onClick={handleClearSearch}
                className="fc-button fc-button-ghost px-3 text-sm"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
