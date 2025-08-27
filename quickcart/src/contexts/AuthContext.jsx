import { createContext, useState } from "react";

//Create context
export const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState({ id: 1, username: 'Besart', role: 'Admin' });

    const login = function(username, role = "Customer") {
        setUser({ username, role });
    }; 

    const logout = function() {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;