import { apiClient, ApiResponse } from '@/lib/api-client';
import { Admin } from '@/types/api.types';

export const adminService = {
    // Get all admins
    async getAll(): Promise<ApiResponse<Admin[]>> {
        return apiClient.get<Admin[]>('/api/admins');
    },

    // Get admin by ID
    async getById(id: number): Promise<ApiResponse<Admin>> {
        return apiClient.get<Admin>(`/api/admins/${id}`);
    },

    // Create new admin
    async create(username: string, password: string): Promise<ApiResponse<string>> {
        const query = apiClient.buildQueryString({ username, password });
        return apiClient.post<string>(`/api/admins?${query}`);
    },

    // Update admin password
    async updatePassword(
        id: number,
        currentPassword: string,
        newPassword: string
    ): Promise<ApiResponse<string>> {
        const query = apiClient.buildQueryString({ currentPassword, newPassword });
        return apiClient.put<string>(`/api/admins/${id}/password?${query}`);
    },

    // Delete admin
    async delete(id: number, confirmPassword: string): Promise<ApiResponse<string>> {
        const query = apiClient.buildQueryString({ confirmPassword });
        return apiClient.delete<string>(`/api/admins/${id}?${query}`);
    },
};