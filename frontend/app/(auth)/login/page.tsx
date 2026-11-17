"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(returnUrl);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (type: "user" | "admin") => {
    if (type === "user") {
      setEmail("mayurawari50@gmail.com");
      setPassword("123456");
    } else {
      setEmail("admin@ticketbooking.com");
      setPassword("Admin@123");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow-lg mb-2">
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
        <p className="text-sm text-zinc-400">Sign in to book tickets, choose seats, and view history</p>
      </div>

      {/* Demo Credentials Quick Fill */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 text-xs text-zinc-300">
        <div className="flex items-center gap-1.5 font-medium text-rose-400 mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Quick Demo Logins (Pre-seeded):</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials("user")}
            className="flex flex-col items-start rounded-lg bg-zinc-900/90 border border-zinc-700/60 p-2 hover:border-rose-400/50 hover:bg-zinc-800 transition-all text-left"
          >
            <span className="font-semibold text-white">Regular User</span>
            <span className="text-[10px] text-zinc-400">mayurawari50@gmail.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("admin")}
            className="flex flex-col items-start rounded-lg bg-zinc-900/90 border border-zinc-700/60 p-2 hover:border-amber-400/50 hover:bg-zinc-800 transition-all text-left"
          >
            <span className="font-semibold text-amber-300">Admin Account</span>
            <span className="text-[10px] text-zinc-400">admin@ticketbooking.com</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/60 p-3.5 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-rose-400 hover:underline font-medium">
          Create one now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-zinc-400">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

