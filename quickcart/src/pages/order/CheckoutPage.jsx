import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { authFetch } from "../../utils/AuthFetch";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import CheckoutForm from "./CheckoutForm";

const API_URL = "https://localhost:7000/api";

function CheckoutPage() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { fetchCart, items: cartItems, clearCart, loading: cartLoading, total, loaded: cartLoaded } = useContext(CartContext);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useCustom, setUseCustom] = useState(false);
    const [customAddress, setCustomAddress] = useState({
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
    });
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        if(user) fetchCart();

        authFetch(`${API_URL}/user/${user.id}/addresses`)
            .then(res => res.json())
            .then(data => setSavedAddresses(data))
            .catch(e => console.error(e));
    }, [user, fetchCart]);

    const handleAddressChange = (e) => {
        setSelectedAddressId(parseInt(e.target.value));
        setUseCustom(false);
    };

    const handleCustomAddressChange = (e) => {
        const { name, value } = e.target;
        setCustomAddress(prev => ({
            ...prev,
            [name]: value
        }));
        setUseCustom(true);
        setSelectedAddressId(null);
    };

    const handlePlaceOrder = async () => {
        if(placingOrder) return;
        setPlacingOrder(true);

        const shipping = useCustom ? customAddress : savedAddresses.find(a => a.id === selectedAddressId);
        if(!shipping.street || !shipping.city || !shipping.state || !shipping.country || !shipping.postalCode) {
            toast.error('Please enter a valid address and ensure your cart is not empty');
            setPlacingOrder(false);
            return;
        }

        const payload = {
            shippingStreet: shipping.street,
            shippingCity: shipping.city,
            shippingState: shipping.state,
            shippingCountry: shipping.country,
            shippingPostalCode: shipping.postalCode,
            orderItems: cartItems.map(ci => ({
                productId: ci.productId,
                quantity: ci.quantity
            }))
        };

        try {
            const res = await authFetch(`${API_URL}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if(res.ok) {
                const created = await res.json();
                //toast.success('Order placed successfully');
                setOrderPlaced(true);
                

                // Call backend to create PaymentIntent
                const paymentRes = await authFetch(`${API_URL}/order/${created.id}/create-payment-intent`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if(paymentRes.ok) {
                    const { clientSecret } = await paymentRes.json();
                    setPaymentData({ clientSecret, orderId: created.id });
                }
                else {
                    toast.error('Failed to initialize payment');
                }

                //navigate(`/orders/${created.id}`, { state: { fromCheckout: true } });
            }
            else {
                const err = await res.text();
                toast.error(err || 'Failed to place order');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setPlacingOrder(false);
        }
    };

    if(authLoading) return null;
    if(!user) return <Navigate to='/login' replace />;

    // wait while cart is being fetched — prevents premature redirect
    if(!cartLoaded || cartLoading) return <p className="p-4">Loading cart...</p>;

    // now it's safe to check contents
    //After you place an order, the orderPlaced flag suppresses the "empty cart → go to /cart" redirect.
    if(!orderPlaced && cartItems.length === 0) return <Navigate to='/cart' replace />;//Only redirect to /cart if we’re sure the cart is empty after it's been loaded

    return (
        <Container className="py-4">
            <h1 className="h3 mb-4">Checkout</h1>

            <h5>Shipping Address</h5>
            {savedAddresses.map(address => (
                <Card key={address.id} className="mb-2">
                    <Card.Body>
                        <Form.Check 
                            type="radio"
                            label={`${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.postalCode}`}
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={handleAddressChange}
                        />
                    </Card.Body>
                </Card>
            ))}

            <Card className="mb-3">
                <Card.Body>
                    <Form.Label>
                        <strong>{savedAddresses.length > 0 ? 'Or enter a custom address:' : 'Enter the shipping address:'}</strong>
                    </Form.Label>
                    <Row className="g-2">
                        {['street', 'city', 'state', 'country', 'postalCode'].map(field => (
                            <Col md key={field}>
                                <Form.Control 
                                    name={field}
                                    value={customAddress[field]}
                                    onChange={handleCustomAddressChange}
                                    required
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                />
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            <h5 className="mt-4">Items</h5>
            {cartItems.map(ci => (
                <Card key={ci.productId} className="mb-2">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col>
                                <strong>{ci.productName}</strong> — Quantity: {ci.quantity}, Item Price: ${ci.currentPrice.toFixed(2)}
                            </Col>
                            <Col xs="auto" className="text-end">
                                <strong>Subtotal: ${ (ci.quantity * ci.currentPrice).toFixed(2) }</strong>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
            <hr />
            <p className="h5">Total: ${total.toFixed(2)}</p>
            <div className="d-flex gap-2 mt-3">
                {!paymentData && (
                    <>
                        <Button variant="secondary" onClick={() => navigate('/cart')}>Back to Cart</Button>
                        <Button variant="success" onClick={handlePlaceOrder} disabled={placingOrder}>
                            {placingOrder ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </>
                )}     
            </div>

            {paymentData && (
                <Card className="mt-4 p-3">
                    <h5>Payment</h5>
                    <CheckoutForm 
                        clientSecret={paymentData.clientSecret}
                        orderId={paymentData.orderId}
                    />
                </Card>
            )}
        </Container>
    );
}

export default CheckoutPage;