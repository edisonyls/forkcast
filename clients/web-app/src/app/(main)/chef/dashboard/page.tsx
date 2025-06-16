"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Chef {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  secret: string;
  rating: number;
  ratingCount: number;
  image?: string;
  createdAt: string;
}

export default function ChefDashboard() {
  const router = useRouter();
  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChefProfile();
  }, []);

  const fetchChefProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChef(data.data.chef);
      } else if (response.status === 401) {
        // Unauthorized - redirect to signin
        router.push("/chef/signin");
      } else {
        setError("Failed to load profile. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching chef profile:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/signout`,
        {
          method: "POST",
          credentials: "include", // Include cookies in the request
        }
      );

      if (response.ok) {
        // Redirect to home page after successful signout
        router.push("/");
      } else {
        console.error("Failed to sign out");
        // Still redirect even if signout fails
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if signout fails
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/chef/signin")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {chef.name}!
              </h1>
              <p className="text-gray-600 mt-2">@{chef.username}</p>
              <p className="text-sm text-gray-500 mt-1">{chef.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-medium text-gray-900">Chef Details</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="mt-1 text-sm text-gray-900">{chef.bio}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Menu Access Secret
                </h3>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                  {chef.secret}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Share this secret with guests to access your menu
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {chef.rating.toFixed(1)} ⭐ ({chef.ratingCount} reviews)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Member Since
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(chef.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/chef/menu"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Menu
                </h3>
                <p className="text-sm text-gray-500">
                  Add, edit, and organize your menu items
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                <p className="text-sm text-gray-500">
                  View and manage incoming orders
                </p>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⚙️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">
                  Update your profile and preferences
                </p>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
