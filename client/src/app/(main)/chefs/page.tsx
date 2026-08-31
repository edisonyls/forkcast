"use client";

import { useState, useEffect, useCallback } from "react";
import ChefCard from "@/components/guest/ChefCard";
import { apiService, type Chef } from "@/lib/api";

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  if (loading) {
    return (
      <div className="fc-shell py-6 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Hosts
        </h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hosts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fc-shell py-6 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Hosts
        </h1>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Unable to Load Hosts
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chefs || chefs.length === 0) {
    return (
      <div className="fc-shell py-6 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Hosts
        </h1>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            No Hosts Available
          </h2>
          <p className="text-gray-600 mb-6">
            No hosts have been added to the platform yet. Please check back
            later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadChefs(searchTerm.trim() || undefined);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    loadChefs();
  };

  return (
    <div className="fc-shell py-6 sm:py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 sm:mb-8 sm:text-3xl">
        Our Hosts
      </h1>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, username, or bio..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="fc-touch-target absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 hover:text-green-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Results Summary */}
        <div className="text-center text-sm text-gray-600">
          {loading ? (
            "Searching..."
          ) : (
            <>
              {totalCount === 0 && searchTerm
                ? `No hosts found for "${searchTerm}"`
                : `Showing ${chefs.length} of ${totalCount} host${
                    totalCount !== 1 ? "s" : ""
                  }`}
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="ml-2 text-green-600 hover:text-green-700 underline"
                >
                  Clear search
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chefs.map((chef) => (
          <ChefCard key={chef.id} chef={chef} />
        ))}
      </div>

      {/* No Results Message */}
      {!loading && chefs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm ? "No hosts found" : "No hosts available"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `Try adjusting your search terms`
              : "No hosts have been added to the platform yet"}
          </p>
        </div>
      )}
    </div>
  );
}
