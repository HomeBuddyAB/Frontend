"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = email.trim();
    if (!e) return toast.error("Email is required");
    setLoading(true);
    try {
      const res = await authService.forgotPassword(e);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("If the email exists, we sent a message with a reset link.");
      if ((res.data as any)?.token) {
        setToken((res.data as any).token);
        toast.info("Dev mode (no SMTP): token returned for testing.");
      } else {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171010] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#362222] bg-[#1a1a1a] p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Forgot password</h1>
        <p className="text-sm text-gray-300">
          Enter your account email. If it exists, you will receive a link to set a new password.
        </p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-lg bg-[#171010] border border-[#362222] px-4 py-2 text-white"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-[#F4A261] hover:bg-[#d86f1a] transition px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {token && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            <div className="font-semibold mb-1">Dev token</div>
            <code className="break-all">{token}</code>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <Link className="text-gray-300 underline underline-offset-2" href="/reset-password">
            Have a token? Reset password
          </Link>
          <Link className="text-gray-300 underline underline-offset-2" href="/">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

