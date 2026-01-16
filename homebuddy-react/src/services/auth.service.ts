// services/auth.service.ts
import { apiClient, ApiResponse, UserFromToken } from '@/lib/api-client';
import { LoginDto, AdminLoginDto, RegisterDto, AuthResponseDto } from '@/types/api.types';

// Decode JWT and extract claims
function decodeJwtClaims(token: string): Record<string, any> {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return {};
    }
}

// Extract UserFromToken from JWT claims
function extractUserFromToken(token: string): UserFromToken {
    const claims = decodeJwtClaims(token);

    // Map the long claim names from your .NET JWT to simple properties
    const id = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const email = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const role = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return {
        id: parseInt(id || '0'),
        email: email || '',
        role: role || undefined,
    };
}

export const authService = {
    // Regular user login
    async login(dto: LoginDto): Promise<ApiResponse<UserFromToken>> {
        try {
            const response = await apiClient.post<AuthResponseDto>('/api/auth/login', dto);

            if (response.error) {
                return { error: response.error, status: response.status };
            }

            if (response.data?.token) {
                // Extract user info from JWT
                const user = extractUserFromToken(response.data.token);
                // Store token
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', response.data.token);
                }
                return { data: user, status: response.status };
            }

            return { error: 'No token received', status: response.status };
        } catch (error: any) {
            return { error: error.message || 'Login failed', status: 500 };
        }
    },

    // Admin login
    async adminLogin(dto: AdminLoginDto): Promise<ApiResponse<UserFromToken>> {
        try {
            const response = await apiClient.post<AuthResponseDto>('/api/auth/admin/login', dto);

            if (response.error) {
                return { error: response.error, status: response.status };
            }

            if (response.data?.token) {
                // Extract user info from JWT
                const user = extractUserFromToken(response.data.token);
                // Store token
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', response.data.token);
                }
                return { data: user, status: response.status };
            }

            return { error: 'No token received', status: response.status };
        } catch (error: any) {
            return { error: error.message || 'Admin login failed', status: 500 };
        }
    },

    // Register
    async register(dto: RegisterDto): Promise<ApiResponse<UserFromToken>> {
        try {
            const response = await apiClient.post<AuthResponseDto>('/api/auth/register', dto);

            if (response.error) {
                return { error: response.error, status: response.status };
            }

            if (response.data?.token) {
                const user = extractUserFromToken(response.data.token);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', response.data.token);
                }
                return { data: user, status: response.status };
            }

            return { error: 'No token received', status: response.status };
        } catch (error: any) {
            return { error: error.message || 'Registration failed', status: 500 };
        }
    },

    // Check current auth status and get user with role
    async checkAuth(): Promise<ApiResponse<UserFromToken>> {
        try {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const user = extractUserFromToken(token);
                    return { data: user, status: 200 };
                }
            }
            return { error: 'No token found', status: 401 };
        } catch (error: any) {
            return { error: error.message || 'Auth check failed', status: 500 };
        }
    },

    // Logout
    async logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
        }
    },
};