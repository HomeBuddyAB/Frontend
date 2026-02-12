// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { UserFromToken } from '@/types/api.types';
import { analytics } from '@/lib/analytics';

const PENDING_CLAIM_ORDER_KEY = 'pendingClaimOrderNo';

export type LoginPopupMode = 'login' | 'signup';

interface AuthContextType {
    user: UserFromToken | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    showLoginPopup: boolean;
    loginPopupMode: LoginPopupMode;
    setShowLoginPopup: (show: boolean, mode?: LoginPopupMode) => void;
    login: (email: string, password: string, guestCart?: string) => Promise<{ success: boolean; error?: string; cart?: string }>;
    register: (email: string, password: string, guestCart?: string) => Promise<{ success: boolean; error?: string; cart?: string }>;
    adminLogin: (userName: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserFromToken | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showLoginPopup, setShowLoginPopupState] = useState<boolean>(false);
    const [loginPopupMode, setLoginPopupMode] = useState<LoginPopupMode>('login');
    const router = useRouter();

    const setShowLoginPopup = useCallback((show: boolean, mode?: LoginPopupMode) => {
        setShowLoginPopupState(show);
        if (mode !== undefined) setLoginPopupMode(mode);
    }, []);

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

    const login = async (email: string, password: string, guestCart?: string): Promise<{ success: boolean; error?: string; cart?: string }> => {
        try {
            const response = await authService.login({ email, password, guestCart });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Login failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopupState(false);
            router.push('/profile');

            analytics.login('email');

            return { success: true, cart: response.cart };
        } catch (error: any) {
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (email: string, password: string, guestCart?: string): Promise<{ success: boolean; error?: string; cart?: string }> => {
        try {
            const response = await authService.register({ email, password, confirmPassword: password, guestCart });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Registration failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopupState(false);
            if (typeof window !== 'undefined' && window.location?.pathname !== '/checkout') {
                router.push('/profile');
            }

            analytics.signUp('email');

            if (typeof window !== 'undefined') {
                const pendingOrderNo = sessionStorage.getItem(PENDING_CLAIM_ORDER_KEY);
                if (pendingOrderNo) {
                    sessionStorage.removeItem(PENDING_CLAIM_ORDER_KEY);
                    userService.claimOrder(pendingOrderNo).catch(() => {});
                }
            }

            return { success: true, cart: response.cart };
        } catch (error: any) {
            return { success: false, error: (error as Error).message || 'Registration failed' };
        }
    };

    const adminLogin = async (userName: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await authService.adminLogin({ userName, password });

            if (response.error || !response.data) {
                return { success: false, error: response.error || 'Admin login failed' };
            }

            setUser(response.data as UserFromToken);
            setShowLoginPopupState(false);
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
        loginPopupMode,
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