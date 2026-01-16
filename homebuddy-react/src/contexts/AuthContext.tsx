// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { UserFromToken } from '@/types/api.types';
import { analytics } from '@/lib/analytics';

interface AuthContextType {
    user: UserFromToken | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    showLoginPopup: boolean;
    setShowLoginPopup: (show: boolean) => void;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    adminLogin: (userName: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserFromToken | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
    const router = useRouter();

    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await authService.checkAuth();
            if (response.data) {
                setUser(response.data as UserFromToken);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await authService.login({ email, password });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Login failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopup(false);
            router.push('/profile');

            // After successful login:
            analytics.login('email');

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await authService.register({ email, password, confirmPassword: password });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Registration failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopup(false);
            router.push('/profile');

            // After successful registration:
            analytics.signUp('email');

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const adminLogin = async (userName: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await authService.adminLogin({ userName, password });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Admin login failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopup(false);
            // Navigate to the admin dashboard root (existing route)
            router.push('/admin');
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Admin login failed' };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            router.push('/');
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await authService.checkAuth();
            if (response.data) {
                setUser(response.data as UserFromToken);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
        }
    };

    const isAdmin = user?.role === 'Admin';

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        showLoginPopup,
        setShowLoginPopup,
        login,
        register,
        adminLogin,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    requireAdmin = false
) {
    return function AuthenticatedComponent(props: P) {
        const { isAuthenticated, isAdmin, isLoading, setShowLoginPopup } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading) {
                if (!isAuthenticated) {
                    // For admin-protected routes, redirect to dedicated admin login
                    if (requireAdmin) {
                        router.push('/admin/login');
                    } else {
                        setShowLoginPopup(true);
                    }
                } else if (requireAdmin && !isAdmin) {
                    router.push('/');
                }
            }
        }, [isAuthenticated, isAdmin, isLoading, router, setShowLoginPopup]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#171010" }}>
                    <div className="animate-spin h-12 w-12 border-4 rounded-full"
                        style={{ borderColor: "#362222", borderTopColor: "transparent" }} />
                </div>
            );
        }

        if (!isAuthenticated || (requireAdmin && !isAdmin)) {
            return null;
        }

        return <Component {...props} />;
    };
}