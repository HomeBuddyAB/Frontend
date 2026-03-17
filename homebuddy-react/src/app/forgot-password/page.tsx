"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await authService.forgotPassword(email);
    if (res.error) {
      toast.error(res.error);
      setIsLoading(false);
      return;
    }

    toast.success(res.data?.message || "If the email exists, a reset link has been sent.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#171010" }}>
      <div className="w-full max-w-md px-8 py-10 rounded-lg border" style={{ backgroundColor: "#1a1a1a", borderColor: "#362222" }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">RESET PASSWORD</h1>
          <p className="text-gray-400 text-sm">We’ll email you a reset link.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-white text-sm font-medium mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors"
              style={{ borderColor: "#423F3E" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B4545")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-bold text-sm tracking-wider rounded transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: isLoading ? "#2B2B2B" : "#362222" }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#8B4545";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#362222";
            }}
          >
            {isLoading ? "SENDING..." : "SEND RESET LINK"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-xs hover:underline"
            style={{ color: "#8B4545" }}
            onClick={() => router.push("/")}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

