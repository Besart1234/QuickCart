import { useContext } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import CartItemCard from "../../components/cart/CartItemCard";

function Cart() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);
    const { items, loading, total, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useContext(CartContext);

    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (loading) return <p className="p-4">Loading cart...</p>;

    const handleIncrease = async (id) => {
        try {
            await increaseQuantity(id);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to increase the quantity');
        }
    };

    const handleDecrease = async (id) => {
        try {
            await decreaseQuantity(id);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to decrease the quantity');
        }
    };

    const handleRemoveItem = async (id) => {
        try {
            await removeItem(id);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to remove the item');
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to clear the cart');
        }
    };

    return (
        <div className="container py-4">
            <h1 className="h3 mb-4">Shopping Cart</h1>

            {items.length === 0 ? (
                <p>
                    Your cart is empty.{" "}
                    <span onClick={() => navigate("/")} className="btn btn-link p-0 m-0 align-baseline" > 
                        Go shopping
                    </span>
                </p>
            ) : (
                <>
                    {items.map(item => (
                        <CartItemCard 
                            key={item.productId}
                            item={item}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                    <hr className="my-4"/>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <p className="h5">Total: ${total.toFixed(2)}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" onClick={handleClearCart} className="btn btn-danger">Clear Cart</button>
                            <Link className="btn btn-success" to='/checkout'>Proceed to Checkout</Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;