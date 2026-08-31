"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OnboardingChecklist from "@/components/chef/OnboardingChecklist";
import Toast from "@/components/ui/Toast";

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
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  useEffect(() => {
    fetchChefProfile();
    fetchPendingOrdersCount();
  }, []);

  const fetchChefProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        },
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

  const fetchPendingOrdersCount = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/me`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const events = data.data.events || [];

        const pendingCount = events.reduce((count: number, event: any) => {
          return (
            count +
            (event.eventOrders?.filter(
              (order: any) => order.status === "PENDING",
            ).length || 0)
          );
        }, 0);

        setPendingOrdersCount(pendingCount);
      }
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
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
    <div className="bg-gray-50 py-4 sm:py-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="fc-shell">
        {/* Pending Orders Alert */}
        {pendingOrdersCount > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pending Orders Awaiting Your Confirmation
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  You have <strong>{pendingOrdersCount}</strong> pending order
                  {pendingOrdersCount === 1 ? "" : "s"} that need
                  {pendingOrdersCount === 1 ? "s" : ""} your attention.
                  <Link
                    href="/chef/events"
                    className="ml-1 font-medium underline hover:no-underline"
                  >
                    View Orders →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow sm:mb-8 sm:p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200">
                <Image
                  src={
                    chef.image &&
                    !chef.image.startsWith("http") &&
                    !chef.image.startsWith("data:") &&
                    !chef.image.startsWith("/user.png")
                      ? `${process.env.NEXT_PUBLIC_API_URL}${chef.image}`
                      : chef.image || "/user.png"
                  }
                  alt={chef.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Welcome, {chef.name}!
              </h1>
              <p className="text-gray-600 mt-2">@{chef.username}</p>
              <p className="text-sm text-gray-500 mt-1">{chef.email}</p>
              <div className="mt-3">
                <p className="text-sm text-gray-600">{chef.bio}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {chef.rating.toFixed(1)} ⭐ ({chef.ratingCount} reviews)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Menu Access Secret
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="max-w-full break-all rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-900">
                    {chef.secret}
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(chef.secret);
                        setToast({
                          message: "Secret copied to clipboard!",
                          type: "success",
                        });
                      } catch (error) {
                        setToast({
                          message: "Failed to copy secret",
                          type: "error",
                        });
                      }
                    }}
                    className="fc-touch-target px-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Share this secret with guests to access your menu
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
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow"
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

          <Link
            href="/chef/events"
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🗓️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Events</h3>
                <p className="text-sm text-gray-500">
                  Create events for friends to place orders
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/chef/settings"
            className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
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
              </div>
            </div>
          </Link>
        </div>

        {/* Onboarding Checklist */}
        <OnboardingChecklist chef={{ id: chef.id, secret: chef.secret }} />
      </div>
    </div>
  );
}
