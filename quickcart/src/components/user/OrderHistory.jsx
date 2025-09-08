import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/AuthFetch";
import { Badge, Button, Card } from "react-bootstrap";
import { getStatusStyle } from "../../pages/order/OrderSummaryPage";

const API_URL = "https://localhost:7000/api";

function OrderHistory({ user }) {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchOrders = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/orders`);

            if(res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('An error occurred fetching the orders', error);
        }
    };

    useEffect(() => {
        if(user) fetchOrders();
    }, [user]);

    // Run scroll once orders are fetched
    useEffect(() => {
        if (location.hash && orders.length > 0) {
            const element = document.querySelector(location.hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [location, orders]);

    return (
        <div className="mt-5">
            <h5 className="mb-3" id="order-history">Order History</h5>
            {orders.length === 0 ? (
                <p>No orders yet.</p>
            ) : (
                orders.map((order, index) => (
                    <Card 
                        key={order.id} 
                        className="mb-3"
                    >
                        <Card.Body>
                            <Card.Title>Order placed on {new Date(order.createdAt).toLocaleString()}</Card.Title>
                            <Card.Text>
                                <strong>Status: </strong>
                                <Badge bg={getStatusStyle(order.status)}>{order.status}</Badge><br />
                                <strong>Payment: </strong>
                                <Badge bg={
                                    order.paymentStatus === 'Paid'
                                    ? 'success' 
                                    : order.paymentStatus === 'Failed'
                                    ? 'danger'
                                    : 'secondary'
                                }>
                                    {order.paymentStatus}
                                </Badge><br />
                                <strong>Total: </strong>{order.totalPrice.toFixed(2)}
                            </Card.Text>

                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/orders/${order.id}`, { state: { fromProfile: true } })}
                            >
                                View Details
                            </Button>
                        </Card.Body>
                    </Card>
                ))
            )}
        </div>
    );
}

export default OrderHistory;