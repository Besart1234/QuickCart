import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { authFetch } from "../utils/AuthFetch";

const API_URL = "https://localhost:7000/api";

export const WishlistContext = createContext(null);

function WishlistProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Fetch wishlist for the logged-in user
    const fetchWishlist = useCallback(async () => {
        if(!user) {
            setWishlistItems([]);
            setLoading(false);
            setLoaded(false);
            return;
        }

        try {
            setLoading(true);
            const res = await authFetch(`${API_URL}/user/${user.id}/wishlist`);
        
            if (!res.ok) throw new Error("Failed to fetch wishlist");
        
            const data = await res.json();
            setWishlistItems(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred fetching the wishlist items');
            setWishlistItems([]);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, [user]);

    // Add a product to the wishlist
    const addToWishlist =  async (productId) => {
        if(!user) {
            toast.error('Please log in to add to wishlit');
            return;
        }

        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId })
            });

            if(!res.ok) {
                const errText = await res.text();
                toast.error(errText || 'Failed to add product to wishlist');
                return;
            }

            const newItem = await res.json();
            setWishlistItems(prev => [newItem, ...prev]);
            toast.success('Product added to wishlist');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding to wishlist');
        }
    };

    // Remove a product from the wishlist
    const removeFromWishlist = async (productId) => {
        if(!user) return;

        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/wishlist/${productId}`, {
                method: 'DELETE',
            });

            if(!res.ok) throw new Error('Failed to remove from wishlist');

            setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while removing from wishlist');
        }
    };

    // Automatically fetch wishlist when user logs in
    useEffect(() => {
        fetchWishlist();
    }, [user, fetchWishlist]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                loading,
                loaded,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export default WishlistProvider;