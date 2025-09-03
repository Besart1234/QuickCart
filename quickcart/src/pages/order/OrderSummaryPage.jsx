import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { authFetch } from "../../utils/AuthFetch";
import { Badge, Card, Col, Container, Row } from "react-bootstrap";

const API_URL = "https://localhost:7000/api";

function OrderSummaryPage() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const location = useLocation();

    const fetchOrder = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/orders/${orderId}`);
            if(res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if(user) fetchOrder();
    }, [user, orderId]);

    if(authLoading) return null;
    if(!user) return <Navigate to='/login' replace />;

    if(!order) return <p>Loading order...</p>;

    if(!location.state?.fromCheckout) return <Navigate to='/' replace />

    return (
        <Container className="py-4">
            {location.state.fromCheckout ? (
                <>
                    <h1 className="h3 mb-4">Thank You!</h1>
                    <p>
                        Your order was placed successfully. You can view your order details below or find this order in your profile's order history.
                    </p>
                </>
            ) : (
                <>
                    <h1 className="h4 mb-3">Order Details</h1>
                    <p>
                        <strong>Status:</strong>{" "}
                        <Badge bg={getStatusStyle(order.status)}>{order.status}</Badge> 
                    </p>
                </>
            )}

            <h5 className="mt-4">Shipping Address:</h5>
            <p>
                {order.shippingStreet}, {order.shippingCity}, <br />
                {order.shippingState}, {order.shippingCountry}, {order.shippingPostalCode}
            </p>

            <h5>Order Items:</h5>
            {order.orderItems.map(item => (
                <Card key={item.id} className="mb-2">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col>
                                <strong>{item.productName}</strong> — Quantity: {item.quantity}, Item Price: ${item.priceAtPurchase.toFixed(2)}
                            </Col>
                            <Col xs="auto" className="text-end">
                                <strong>Subtotal: ${(item.priceAtPurchase * item.quantity).toFixed(2)}</strong>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}

            <hr />
            <p className="h5">Total: ${order.totalPrice.toFixed(2)}</p>

            <div className="d-flex gap-2 mt-4">
                <Link to="/" className="btn btn-primary">
                    Go to Home
                </Link>
                <Link to="/profile/orders" className="btn btn-outline-secondary">
                    View My Orders
                </Link>
            </div>
        </Container>
    );
}

export default OrderSummaryPage;

export function getStatusStyle(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'warning';
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}