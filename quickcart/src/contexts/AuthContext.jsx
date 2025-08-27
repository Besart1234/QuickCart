import { createContext, useEffect, useState } from "react";

const API_URL = "https://localhost:7000/api";
//Create context
export const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });

            if(res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error('Not logged in');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout failed', error);
        }

        setUser(null);
        window.location.href = '/';
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;