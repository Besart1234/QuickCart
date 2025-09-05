import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/AuthFetch";
import { Alert, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { CartContext } from "../../contexts/CartContext";

const API_URL = "https://localhost:7000/api";

function CheckoutForm({ clientSecret, orderId }){
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { clearCart } = useContext(CartContext);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!stripe || !elements) return; // Stripe.js not ready yet

        setLoading(true);
        setErrorMsg(null);

        try {
            // Confirm payment with card details
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });

            if(error) {
                setErrorMsg(error.message);
                setLoading(false);
                return;
            }

            if(paymentIntent.status === 'succeeded') {
                // Update backend order status
                const patchRes = await authFetch(`${API_URL}/order/${orderId}/mark-paid`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentIntent.payment_method)
                });

                if(!patchRes.ok) {
                    setErrorMsg('Failed to confirm payment with backend');
                    setLoading(false);
                    return;
                }

                const updatedOrder = await patchRes.json(); // <-- This now has PaymentStatus = Paid

                toast.success('Order placed successfully');
                await clearCart();
                // Navigate to order summary
                navigate(`/orders/${orderId}`, { state: { fromCheckout: true, order: updatedOrder } });
            }
            else {
                setErrorMsg('Payment did not succeed. Please try again.');
            }
        } catch (e) {
            console.error(e);
            setErrorMsg('Unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3 p-3 border rounded">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#32325d',
                                '::placeholder': { color: '#a0aec0' }
                            },
                            invalid: { color: '#fa755a' }
                        },
                    }}
                />
            </div>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <Button type="submit" variant="primary" disabled={!stripe || loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Pay Now'}
            </Button>
        </form>
    );
}

export default CheckoutForm;