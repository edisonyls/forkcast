"use client";

import { useState, useEffect } from "react";
import ChefCard from "@/components/ChefCard";
import { apiService, type Chef } from "@/lib/api";

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChefs = async () => {
      try {
        setLoading(true);
        setError(null);
        const { chefs } = await apiService.getChefs();
        setChefs(chefs || []);
      } catch (err) {
        console.error("Failed to fetch chefs:", err);
        setError(
          "Failed to load chefs. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadChefs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Hosts
        </h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hosts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chefs || chefs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
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
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Our Hosts
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chefs.map((chef) => (
          <ChefCard key={chef.id} chef={chef} />
        ))}
      </div>
    </div>
  );
}
