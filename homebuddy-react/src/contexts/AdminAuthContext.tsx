"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { AdminLoginDto } from '@/types/api.types';
import { UserFromToken } from '@/lib/api-client';

interface AdminAuthContextType {
    admin: boolean;
    isAdminAuthenticated: boolean;
    isAdminLoading: boolean;
    adminLogin: (dto: AdminLoginDto) => Promise<{ success: boolean; error?: string }>;
    adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<boolean>(false);
    const [isAdminLoading, setIsAdminLoading] = useState(false);

    const adminLogin = async (dto: AdminLoginDto): Promise<{ success: boolean; error?: string }> => {
        setIsAdminLoading(true);
        try {
            const response = await authService.adminLogin(dto);

            if (response.error) {
                return { success: false, error: response.error };
            }

            // Get admin user from token
            const userResponse = await authService.checkAuth();
            if (userResponse.data) {
                setAdmin(true);
                return { success: true };
            }

            return { success: false, error: 'Failed to retrieve admin info' };
        } catch (error: any) {
            return { success: false, error: error.message || 'Admin login failed' };
        } finally {
            setIsAdminLoading(false);
        }
    };

    const adminLogout = async (): Promise<void> => {
        setAdmin(false);
        await authService.logout();
    };

    const value: AdminAuthContextType = {
        admin,
        isAdminAuthenticated: !!admin,
        isAdminLoading,
        adminLogin,
        adminLogout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = (): AdminAuthContextType => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};