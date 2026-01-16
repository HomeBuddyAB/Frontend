"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLoginForm() {
    const router = useRouter();
    const { adminLogin } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await adminLogin(userName, password);
            if (!result.success) {
                setError(result.error || "Login failed");
            } else {
                // Redirect handled inside adminLogin; no need to push here.
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full max-w-md px-8 py-10 rounded-lg border"
            style={{
                backgroundColor: "#1a1a1a",
                borderColor: "#362222",
            }}
        >
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">ADMIN LOGIN</h2>
                <p className="text-gray-400 text-sm">Access the control center</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Input */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">
                        USERNAME
                    </label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="admin"
                        className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors"
                        style={{
                            borderColor: "#423F3E",
                        }}
                        onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "#8B4545")
                        }
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-white text-sm font-medium mb-2">
                        PASSWORD
                    </label>
                    <div className="relative">
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-black/40 border rounded text-white placeholder-gray-600 outline-none transition-colors"
                            style={{
                                borderColor: "#423F3E",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "#8B4545")
                            }
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#423F3E")}
                            required
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                        />
                        {showPassword ? (
                            <EyeOff
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                size={16}
                                onClick={() => setShowPassword(false)}
                            />
                        ) : (
                            <Eye
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                size={16}
                                onClick={() => setShowPassword(true)}
                            />
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded text-sm text-red-400 bg-red-950/20 border border-red-900/30">
                        {error}
                    </div>
                )}

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
                    {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: "#362222" }}></div>
                <span className="text-gray-500 text-xs">SECURE ACCESS</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#362222" }}></div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-500 text-xs">
                Authorized personnel only
            </p>
        </div>
    );
}

export default AdminLoginForm;