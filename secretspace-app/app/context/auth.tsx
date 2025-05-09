// app/context/auth.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the shape of our auth context
type AuthContextType = {
    isAuthenticated: boolean;
    username: string | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    username: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Function to fetch user data using the stored token
    const refreshUser = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt');

            if (!token) {
                setIsAuthenticated(false);
                setUsername(null);
                return;
            }

            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsername(response.data.username);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error refreshing user:', error);
            // If there's an error (e.g. invalid token), logout
            await logout();
        }
    };

    // Check authentication status when app loads
    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            await refreshUser();
            setLoading(false);
        };

        initAuth();
    }, []);

    // Login function
    const login = async (token: string) => {
        try {
            await AsyncStorage.setItem('jwt', token);
            await refreshUser();
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('jwt');
            setIsAuthenticated(false);
            setUsername(null);
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    };

    // The context value that will be supplied to any descendants of this provider
    const value = {
        isAuthenticated,
        username,
        loading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};