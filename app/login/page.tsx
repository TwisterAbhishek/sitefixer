
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Unable to start Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold">
            S
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              SiteFixer
            </h1>
            <p className="text-sm text-slate-400">
              Website monitoring and maintenance
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Sign in to monitor websites, identify issues, and manage your
          website health.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          By continuing, you agree to use SiteFixer responsibly and only
          audit websites you are authorized to test.
        </p>
      </section>
    </main>
  );
}
