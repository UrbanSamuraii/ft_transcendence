import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth as useAuthHook } from './utils/hooks/useAuthHook'; // Update the path accordingly
import { useLocation } from 'react-router-dom';

interface User {
    username: string;
    // Add other user properties you might need
}

interface AuthContextType {
    user: any;  // Replace 'any' with a more specific type if possible
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const location = useLocation();
    const { user, loading, checkAuthStatus } = useAuthHook(); // Assume checkAuthStatus is a method to check auth

    useEffect(() => {
        checkAuthStatus(); // Re-check auth status on location change
    }, [location]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
