import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import { AuthContext } from "./AuthContext";

const API_URL = "https://localhost:7000/api";

export const CartContext = createContext(null);

function CartProvider({ children }) {
    const { user } = useContext(AuthContext); //get user from auth
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const res = await authFetch(`${API_URL}/cart`);

            if(!res.ok) return;

            const data = await res.json();
            setCartCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
        } catch (error) {
            console.error(error);
        }
    };

    // React to user changes
    useEffect(() => {
        if(user) fetchCartCount(); // logged in → fetch cart
        else setCartCount(0); // logged out → clear cart 
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export default CartProvider;