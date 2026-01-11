import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Optional: Verify token with backend /me endpoint here
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const res = await axios.post('/api/auth/signup', { name, email, password }, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            console.error("Signup Error Details:", error);
            let errorMessage = "Signup failed";

            if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
                errorMessage = "Server is taking too long to respond. The backend may be sleeping. Please try again in 30 seconds.";
            } else if (error.response) {
                // Server responded with a status code
                errorMessage = error.response.data?.error || `Server Error (${error.response.status}): ${error.response.statusText}`;
                if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                    errorMessage = "Error: Connected to Frontend instead of Backend. Check VITE_API_URL.";
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = "No response from server. The backend may be sleeping or down.";
            } else {
                errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
