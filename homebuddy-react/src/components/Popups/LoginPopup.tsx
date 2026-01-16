import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

function LoginPopup({ onSignupClick }: { onSignupClick: () => void }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Login failed');
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
                <h2 className="text-3xl font-bold text-white mb-2">LOGIN</h2>
                <p className="text-gray-400 text-sm">Enter the rebellion</p>
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
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#362222" }}></div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 text-sm">
                Don't have an account?{" "}
                <button
                    type="button"
                    className="text-white font-medium hover:underline transition-all cursor-pointer"
                    style={{ color: "#8B4545" }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSignupClick();
                    }}
                >
                    SIGN UP
                </button>
            </p>

            {/* Forgot Password */}
            <p className="text-center text-gray-500 text-xs mt-4">
                <button
                    type="button"
                    className="hover:text-gray-400 transition-colors cursor-pointer"
                >
                    Forgot password?
                </button>
            </p>
        </div>
    );
}

export default LoginPopup;