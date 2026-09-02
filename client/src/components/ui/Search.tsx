"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter chefs based on search term
    console.log("Searching for:", searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by cuisine or host name..."
          className="fc-control px-4 py-3 pr-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="fc-icon-button fc-icon-button-ghost absolute right-1 top-1/2 -translate-y-1/2"
          aria-label="Search hosts"
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
  );
}
