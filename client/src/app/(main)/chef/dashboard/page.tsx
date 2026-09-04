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

const shortcuts = [
  {
    href: "/chef/menu",
    label: "Menu",
    description: "Add, edit, and organise the dishes guests can order.",
  },
  {
    href: "/chef/events",
    label: "Events",
    description: "Open a night for orders and confirm what comes in.",
  },
  {
    href: "/chef/settings",
    label: "Settings",
    description: "Your profile, your bio, and the secret that unlocks it.",
  },
];

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

  const copySecret = async () => {
    if (!chef) return;
    try {
      await navigator.clipboard.writeText(chef.secret);
      setToast({ message: "Secret copied to clipboard", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to copy secret", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="fc-loading" role="status">
        <span className="fc-spinner" aria-hidden="true" />
        Loading dashboard
      </div>
    );
  }

  if (error) {
    return (
      <div className="fc-shell fc-page">
        <div className="fc-panel fc-empty">
          <h1 className="fc-empty-title">We couldn&rsquo;t load your profile</h1>
          <p className="fc-empty-body">{error}</p>
          <div className="fc-empty-actions">
            <button
              onClick={() => router.push("/chef/signin")}
              className="fc-button fc-button-primary"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chef) {
    return null;
  }

  const avatarSrc =
    chef.image &&
    !chef.image.startsWith("http") &&
    !chef.image.startsWith("data:") &&
    !chef.image.startsWith("/user.png")
      ? `${process.env.NEXT_PUBLIC_API_URL}${chef.image}`
      : chef.image || "/user.png";

  return (
    <div className="fc-shell fc-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="fc-page-header">
        <div className="min-w-0">
          <p className="fc-eyebrow">Host dashboard</p>
          <h1 className="fc-page-title">
            Welcome back, <em>{chef.name}</em>
          </h1>
          <p className="fc-page-lead">
            Everything guests see starts here &mdash; your menu, your open
            nights, and the secret that lets them in.
          </p>
        </div>
        <div className="fc-page-actions">
          <Link href="/chef/events" className="fc-button fc-button-primary">
            Go to events
          </Link>
        </div>
      </header>

      {pendingOrdersCount > 0 && (
        <div className="fc-feedback fc-feedback-warning mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm">
            <strong>{pendingOrdersCount}</strong> order
            {pendingOrdersCount === 1 ? "" : "s"} still need
            {pendingOrdersCount === 1 ? "s" : ""} your confirmation.
          </p>
          <Link
            href="/chef/events"
            className="fc-button fc-button-warning self-start text-sm sm:self-auto"
          >
            Review orders
          </Link>
        </div>
      )}

      <section className="fc-panel">
        <div className="fc-panel-body">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
            <span className="fc-avatar h-20 w-20">
              <Image src={avatarSrc} alt="" width={80} height={80} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-xl font-semibold tracking-[-0.03em] text-ink">
                {chef.name}
              </h2>
              <p className="fc-meta mt-1.5">
                <span className="fc-mono">@{chef.username}</span>
                <span>{chef.email}</span>
              </p>
              {chef.bio && (
                <p className="mt-3 mb-0 max-w-[60ch] text-sm leading-relaxed text-text-muted">
                  {chef.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="fc-panel-footer">
          <dl className="fc-stat-grid">
            <div>
              <dt className="fc-stat-label">Rating</dt>
              <dd className="fc-stat-value">
                {chef.rating.toFixed(1)}{" "}
                <span className="text-text-subtle">
                  from {chef.ratingCount}{" "}
                  {chef.ratingCount === 1 ? "review" : "reviews"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="fc-stat-label">Hosting since</dt>
              <dd className="fc-stat-value">
                {new Date(chef.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="fc-stat-label">Menu access secret</dt>
              <dd className="fc-stat-value">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="fc-token">{chef.secret}</span>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="fc-button fc-button-secondary px-3 text-xs"
                  >
                    Copy
                  </button>
                </span>
                <span className="fc-hint block">
                  Guests need this to open your menu.
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut, index) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="fc-card fc-card-link"
          >
            <span className="fc-stat-label">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="block text-lg font-semibold tracking-[-0.025em] text-ink">
              {shortcut.label}
            </span>
            <span className="mt-1.5 block text-sm leading-relaxed text-text-muted">
              {shortcut.description}
            </span>
          </Link>
        ))}
      </div>

      <OnboardingChecklist chef={{ id: chef.id, secret: chef.secret }} />
    </div>
  );
}
