"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPopup({ onLoginClick }: { onLoginClick?: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!agreeToTerms) {
            setError("Please agree to the terms and conditions");
            return;
        }

        setIsLoading(true);

        const result = await register(email, password);

        if (!result.success) {
            setError(result.error || 'Signup failed');
        }

        setIsLoading(false);
    };

    return (
        <div
            className="w-full not-sm:max-w-11/12 sm:max-w-md px-8 py-10 rounded-lg border pointer-events-auto"
            style={{
                backgroundColor: "#1a1a1a",
                borderColor: "#362222",
            }}
        >
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">JOIN US</h2>
                <p className="text-gray-400 text-sm">Become part of the rebellion</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">
                        EMAIL
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors focus:border-opacity-100"
                        style={{
                            borderColor: "#423F3E",
                        }}
                        onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#8B4545")
                        }
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                        required
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">
                        PASSWORD
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors pr-10"
                            style={{
                                borderColor: "#423F3E",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "#8B4545")
                            }
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">
                        CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors pr-10"
                            style={{
                                borderColor: "#423F3E",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "#8B4545")
                            }
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded text-sm text-red-400 bg-red-950/20 border border-red-900/30">
                        {error}
                    </div>
                )}

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded accent-red-700"
                    />
                    <label htmlFor="terms" className="text-gray-400 text-xs">
                        I agree to the{" "}
                        <button
                            type="button"
                            className="text-white hover:underline transition-colors cursor-pointer"
                            style={{ color: "#8B4545" }}
                        >
                            terms and conditions
                        </button>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 text-white font-bold text-sm tracking-wider rounded transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                        backgroundColor: isLoading ? "#2B2B2B" : "#362222",
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) e.currentTarget.style.backgroundColor = "#8B4545";
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) e.currentTarget.style.backgroundColor = "#362222";
                    }}
                >
                    {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
                </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "#362222" }}></div>
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#362222" }}></div>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm">
                Already have an account?{" "}
                <button
                    type="button"
                    className="text-white font-medium hover:underline transition-all cursor-pointer"
                    style={{ color: "#8B4545" }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLoginClick?.();
                    }}
                >
                    LOGIN
                </button>
            </p>
        </div>
    );
}