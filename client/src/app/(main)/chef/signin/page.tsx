"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

export default function ChefSignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  // Check for existing authentication on component mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/profile/me`,
        {
          method: "GET",
          credentials: "include", // Include cookies in the request
        },
      );

      if (response.ok) {
        // User is already authenticated, show toast and redirect
        setToast({
          message: "Welcome back! You're already signed in.",
          type: "success",
        });

        // Small delay to show the toast before redirecting
        setTimeout(() => {
          router.push("/chef/dashboard");
        }, 1500);
      } else {
        // User is not authenticated, show sign-in form
        setCheckingAuth(false);
      }
    } catch (error) {
      // Error checking auth, show sign-in form
      console.error("Error checking authentication:", error);
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chef/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies in the request
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        // Authentication successful - cookie is automatically set by the server
        // No need to store anything in localStorage
        router.push("/chef/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || "Sign in failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="fc-auth-page flex min-h-[calc(100svh-var(--fc-header-height))] items-center justify-center px-[var(--fc-page-gutter)]">
        <div className="fc-loading" role="status">
          <span className="fc-spinner" aria-hidden="true" />
          Checking your session
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fc-auth-page flex min-h-[calc(100svh-var(--fc-header-height))] items-center justify-center px-[var(--fc-page-gutter)] py-8 sm:py-12">
      <div className="fc-auth-card w-full max-w-md">
        <p className="fc-eyebrow">Host sign in</p>
        <h1 className="fc-page-title text-[2rem] sm:text-[2.25rem]">
          Back to the <em>pass</em>
        </h1>
        <p className="fc-page-lead">
          Sign in to update your menu and confirm the orders waiting on you.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          {error && (
            <p className="fc-feedback fc-feedback-danger mb-6 text-sm">
              {error}
            </p>
          )}

          <div className="fc-field">
            <label htmlFor="email" className="fc-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="fc-control px-3 py-2.5 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="fc-field">
            <label htmlFor="password" className="fc-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="fc-control px-3 py-2.5 text-sm"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="fc-button fc-button-primary mt-7 w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 mb-0 text-center text-sm text-text-muted">
            Don&rsquo;t have an account?{" "}
            <Link
              href="/chef/signup"
              className="font-semibold text-brand-ink underline underline-offset-4 hover:text-ink"
            >
              Become a host
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
