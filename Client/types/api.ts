import { User } from './objects';

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface AuthError {
    detail: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    password2: string;
    phoneNumber: string;
    isManager: boolean;
    company_id?: string;
} 