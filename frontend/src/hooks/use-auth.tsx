import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
    id: string;
    full_name: string;
    role: 'viewer' | 'technician' | 'admin';
    email: string;
    department: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, full_name: string, role: string, department: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for token on initial load
        const token = localStorage.getItem('gearguard_token');
        if (token) {
            fetchCurrentUser(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchCurrentUser = async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('gearguard_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });
            const { access_token, user: userData } = response.data;
            localStorage.setItem('gearguard_token', access_token);
            setUser(userData);
            router.push('/');
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, full_name: string, role: string, department: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                email,
                password,
                full_name,
                role,
                department,
            });
            const { access_token, user: userData } = response.data;
            localStorage.setItem('gearguard_token', access_token);
            setUser(userData);
            router.push('/');
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gearguard_token');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
