import { User } from './user';

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
    phoneNumber: string;
} 