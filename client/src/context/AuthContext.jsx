import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('cashflow_current_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Get all users from localStorage
            const users = JSON.parse(localStorage.getItem('cashflow_users') || '[]');

            // Find user with matching email
            const user = users.find(u => u.email === email);

            if (!user) {
                return { success: false, error: 'Invalid email or password' };
            }

            // Check password (in demo, we store plain text - in real app, hash it!)
            if (user.password !== password) {
                return { success: false, error: 'Invalid email or password' };
            }

            // Login successful - save current user
            const userData = { id: user.id, email: user.email, name: user.name };
            localStorage.setItem('cashflow_current_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            // Get existing users
            const users = JSON.parse(localStorage.getItem('cashflow_users') || '[]');

            // Check if email already exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                return { success: false, error: 'This email is already registered.' };
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password, // In demo, plain text. In real app, hash this!
                createdAt: new Date().toISOString()
            };

            // Save new user to users array
            users.push(newUser);
            localStorage.setItem('cashflow_users', JSON.stringify(users));

            // Auto-login the new user
            const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
            localStorage.setItem('cashflow_current_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error("Signup Error:", error);
            return { success: false, error: 'Signup failed. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('cashflow_current_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
