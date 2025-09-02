import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import { AuthContext } from "./AuthContext";

const API_URL = "https://localhost:7000/api";

export const CartContext = createContext(null);

function CartProvider({ children }) {
    const { user } = useContext(AuthContext); //get user from auth
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if(!user) return;

        try {
            setLoading(true); // start loading
            const res = await authFetch(`${API_URL}/cart`);

            if(!res.ok) return;
                
            const data = await res.json();
            setItems(data.items ?? []);
        } catch (error) {
            console.error("Failed to load cart", error);
        } finally {
            setLoading(false);
        }
    };

    //Add to cart -> refresh cart after success
    const addToCart = async (productId, quantity = 1) => {
        const res = await authFetch(`${API_URL}/cart/add`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId, quantity })
        });

        if(!res.ok) throw new Error('Failed to add to cart');
        
        fetchCart();
    };

    // Increase quantity by 1
    const increaseQuantity = async (productId) => {
        const res = await authFetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include',
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if(!res.ok) throw new Error("Failed to increase quantity");
        await fetchCart();
    };

    // Decrease quantity by 1
    const decreaseQuantity = async (productId) => {
        const res = await authFetch(`${API_URL}/cart/decrease`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include',
            body: JSON.stringify({ productId })
        });

        if(!res.ok) throw new Error('Failed to decrease quantity');
        await fetchCart();
    };

    // Remove a product from cart
    const removeItem = async (productId) => {
        const res = await authFetch(`${API_URL}/cart/remove/${productId}`, { method: 'DELETE' });

        if (!res.ok) throw new Error('Failed to remove item');
        await fetchCart();
    };

    const clearCart = async () => {
        const res = await authFetch(`${API_URL}/cart/clear`, { method: 'POST' });

        if(!res.ok) throw new Error('Failed to clear cart');
        setItems([]);
    };

    // React to user changes
    useEffect(() => {
        if(user) fetchCart(); // logged in → fetch cart
        else setItems([]); // logged out → clear cart 
    }, [user]);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);

    return (
        <CartContext.Provider value={{ 
            cartCount, 
            subtotal, 
            items, 
            loading, 
            fetchCart, 
            addToCart, 
            increaseQuantity, 
            decreaseQuantity, 
            removeItem, 
            clearCart 
        }}>
            {children}
        </CartContext.Provider>
    );
}

export default CartProvider;