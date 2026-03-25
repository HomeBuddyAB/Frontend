"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = email.trim();
    const t = token.trim();
    if (!e) return toast.error("Email is required");
    if (!t) return toast.error("Token is required");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await authService.resetPassword(e, t, newPassword);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Password reset successful. You can now log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171010] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#362222] bg-[#1a1a1a] p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="text-sm text-gray-300">
          Paste the reset token and choose a new password.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-lg bg-[#171010] border border-[#362222] px-4 py-2 text-white"
        />
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          type="text"
          placeholder="Reset token"
          className="w-full rounded-lg bg-[#171010] border border-[#362222] px-4 py-2 text-white"
        />
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="New password"
          className="w-full rounded-lg bg-[#171010] border border-[#362222] px-4 py-2 text-white"
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-[#F4A261] hover:bg-[#d86f1a] transition px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>

        <div className="flex justify-between text-sm">
          <Link className="text-gray-300 underline underline-offset-2" href="/forgot-password">
            Need a token?
          </Link>
          <Link className="text-gray-300 underline underline-offset-2" href="/">
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}

