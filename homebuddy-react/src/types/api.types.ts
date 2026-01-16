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
}

export interface AdminLoginDto {
    userName: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponseDto {
    email: string;
    token: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status?: number;
}