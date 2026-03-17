"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Missing reset token");
    }
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const res = await authService.resetPassword(token, password);

    if (res.error) {
      toast.error(res.error);
      setIsLoading(false);
      return;
    }

    toast.success(res.data?.message || "Password has been reset.");
    setIsLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#171010" }}>
      <div className="w-full max-w-md px-8 py-10 rounded-lg border" style={{ backgroundColor: "#1a1a1a", borderColor: "#362222" }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CHOOSE NEW PASSWORD</h1>
          <p className="text-gray-400 text-sm">Set a new password for your account.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-white text-sm font-medium mb-2">NEW PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors pr-10"
                style={{ borderColor: "#423F3E" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#8B4545")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">CONFIRM PASSWORD</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors pr-10"
                style={{ borderColor: "#423F3E" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#8B4545")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3 text-white font-bold text-sm tracking-wider rounded transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: isLoading ? "#2B2B2B" : "#362222" }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#8B4545";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#362222";
            }}
          >
            {isLoading ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}

