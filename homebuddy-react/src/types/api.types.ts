// types/api.types.ts

export interface User {
    id: number;
    email: string;
    cart?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface Admin {
    id: number;
    userName: string;
}

export interface UserFromToken {
    id: number;
    email: string;
    role?: string;
}

export interface LoginDto {
    email: string;
    password: string;
    /** JSON cart from guest session, e.g. {"items":[{"sku":"ABC-123","quantity":2}]}. Merged with user cart on login. */
    guestCart?: string;
}

export interface AdminLoginDto {
    userName: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    confirmPassword: string;
    /** JSON cart from guest session. Becomes user cart on registration. */
    guestCart?: string;
}

export interface AuthResponseDto {
    email: string;
    token: string;
    /** Merged cart JSON after login/register. Use to replace guest cart in frontend. */
    cart?: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status?: number;
    /** Auth responses include merged cart for cart merge on login/register */
    cart?: string;
}