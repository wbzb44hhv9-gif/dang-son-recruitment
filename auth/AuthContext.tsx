
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/mockApiService';
import { User } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: () => {},
    isLoading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserSession = () => {
            try {
                const storedUser = sessionStorage.getItem('dangson-ats-user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user from session storage", error);
                sessionStorage.removeItem('dangson-ats-user');
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const login = async (email: string, pass: string) => {
        const response = await api.login(email, pass);
        setUser(response.user);
        sessionStorage.setItem('dangson-ats-user', JSON.stringify(response.user));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('dangson-ats-user');
    };
    
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
