import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE_URL } from '../config/env';
import { AuthResponse, AuthError, LoginRequest, RegisterRequest } from '../types/api';
import { User } from '../types/objects';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, phoneNumber: string, isManager: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (refreshToken) {
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      const data: AuthResponse | AuthError = await response.json();

      if (!response.ok) {
        const error = data as AuthError;
        throw new Error(error.detail || 'Login failed');
      }

      const authResponse = data as AuthResponse;
      await AsyncStorage.setItem('accessToken', authResponse.access);
      await AsyncStorage.setItem('refreshToken', authResponse.refresh);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(authResponse.user));
      setUser(authResponse.user);
      
      setIsAuthenticated(true);
      
      // Redirect based on user role
      if (authResponse.user.isManager) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(trucker)');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string, phoneNumber: string, isManager: boolean) => {
    try {
      const registerRequest: RegisterRequest = { 
        email, 
        username, 
        password, 
        password2: password, 
        phoneNumber,
        isManager 
      };
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerRequest),
      });


      const data: AuthResponse | AuthError = await response.json();

      if (!response.ok) {
        const error = data as AuthError;
        throw new Error(error.detail || 'Registration failed');
      }

      const authResponse = data as AuthResponse;
      await AsyncStorage.setItem('accessToken', authResponse.access);
      await AsyncStorage.setItem('refreshToken', authResponse.refresh);
      
      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(authResponse.user));
      setUser(authResponse.user);
      
      setIsAuthenticated(true);
      
      // Redirect based on user role
      if (authResponse.user.isManager) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(trucker)');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 