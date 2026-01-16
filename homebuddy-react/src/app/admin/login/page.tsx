"use client";

import { AdminLoginForm } from "@/components/AdminLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to /admin if already logged in as admin
        if (!isLoading && isAdmin) {
            router.push("/admin");
        }
    }, [isAdmin, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#171010" }}>
                <div className="animate-spin h-12 w-12 border-4 rounded-full"
                    style={{ borderColor: "#362222", borderTopColor: "transparent" }} />
            </div>
        );
    }

    // Don't render login form if already admin (will redirect)
    if (isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full h-full flex flex-col justify-center items-center gap-6">
                <AdminLoginForm />
            </div>
        </div>
    );
}