"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const { configured, signInWithGoogle, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = configured || isSupabaseConfigured();

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signInWithEmail(email);
    if (result.error) setError(result.error);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-12 text-center">
      <h1 className="font-display text-3xl font-bold">Sign in</h1>
      <p className="text-gray-500">Save predictions to the cloud and join private leagues</p>

      <div className="glass-card space-y-4 p-6 text-left">
        {supabaseReady ? (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => signInWithGoogle()}
              className="btn-primary w-full py-3"
            >
              Continue with Google
            </button>

            <div className="relative py-2 text-center text-xs text-gray-400">
              <span className="bg-white px-2 dark:bg-gray-900">or</span>
              <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-black/10 dark:border-white/10" />
            </div>

            {sent ? (
              <p className="text-center text-sm text-wc-green">
                Check your email for a magic link to sign in.
              </p>
            ) : (
              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-gray-900"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" className="btn-ghost w-full py-3">
                  Email me a magic link
                </button>
              </form>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Add <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="text-xs">.env.local</code> to enable sign-in. Predictions still save locally.
          </p>
        )}
      </div>

      <Link href="/" className="text-sm text-wc-green hover:underline">
        ← Back to bracket
      </Link>
    </div>
  );
}
