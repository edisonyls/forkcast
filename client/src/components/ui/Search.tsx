"use client";

import { useState } from "react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter chefs based on search term
    console.log("Searching for:", searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="mx-auto max-w-md">
      <label className="fc-label" htmlFor="host-search">
        Search hosts
      </label>
      <div className="flex gap-2">
        <input
          id="host-search"
          type="search"
          placeholder="Cuisine or host name"
          className="fc-control min-w-0 flex-1 px-4 py-2.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="fc-button fc-button-primary shrink-0 px-5">
          Search
        </button>
      </div>
    </form>
  );
}
