import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
    id: string;
    name: string;
    role: 'Technician' | 'Manager' | 'Admin';
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data
const MOCK_USER: User = {
    id: 'u-123',
    name: 'John Technician',
    role: 'Technician',
    email: 'john@gearguard.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on initial load
        const stored = localStorage.getItem('gearguard_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (email && password) { // Any mock logic for now
                    const activeUser = { ...MOCK_USER, email };
                    setUser(activeUser);
                    localStorage.setItem('gearguard_user', JSON.stringify(activeUser));
                    resolve();
                    router.push('/');
                } else {
                    setIsLoading(false);
                    reject(new Error("Invalid credentials"));
                }
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gearguard_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
