import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import { authFetch } from "../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import WishlistItemCard from "../../components/wishlist/WishlistItemCard.jsx"
import ConfirmationModal from '../../components/ConfirmationModal.jsx'
import {WishlistContext} from "../../contexts/WishlistContext";

const API_URL = "https://localhost:7000/api";

function Wishlist() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { wishlistItems, fetchWishlist, removeFromWishlist, loading: wishlistLoading } = useContext(WishlistContext)
    const [showModal, setShowModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        if(user) fetchWishlist();
    }, [user]);

    const handleRemoveClick = (itemId) => {
        setItemToRemove(itemId);
        setShowModal(true);
    };

    const handleRemoveConfirm = async () => {
        if(!itemToRemove) return;

        await removeFromWishlist(itemToRemove); // context handles API + toast + state
        setShowModal(false);
        setItemToRemove(null);
    };

    if(authLoading) return null;
    if(!user) return <Link to='/login' replace />
    if(wishlistLoading) return <p className="p-4">Loading wishlist...</p>;

    return (
        <div className="container py-4">
            <h1 className="h3 mb-4">My Wishlist</h1>
            {wishlistItems.length === 0 ? (
                <p>You haven't added any products in your wishlist yet.</p>
            ) : (
                wishlistItems.map(item => (
                    <WishlistItemCard 
                        key={item.productId}
                        item={item}
                        onRemoveFromWishlist={handleRemoveClick}
                        onAddToCart={(id) => {
                            addToCart(id);
                            toast.success(`'${item.productName}' added to cart`);
                        }}
                    />
                ))
            )}

            <ConfirmationModal 
                show={showModal}
                title="Confirm removal"
                message="Are you sure you want to remove this item from your wishlist?"
                onConfirm={handleRemoveConfirm}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
}

export default Wishlist;