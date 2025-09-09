import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Row, Col, Card } from "react-bootstrap";

const API_URL = 'https://localhost:7000/api';

function OrderForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await authFetch(`${API_URL}/order/${id}`);

            if(res.ok) {
                const data = await res.json();
                setOrder(data);
            }
            else {
                toast.error('Failed to load order');
                navigate('/dashboard/orders');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading order');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrder(prev => ({
            ...prev, 
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            status: order.status,
            shippingStreet: order.shippingStreet,
            shippingCity: order.shippingCity,
            shippingState: order.shippingState,
            shippingCountry: order.shippingCountry,
            shippingPostalCode: order.shippingPostalCode
        };

        try {
            const res = await authFetch(`${API_URL}/order/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if(res.ok) {
                if(res.status === 204) {
                    navigate('/dashboard/orders');
                    return;
                }
                toast.success('Order updated successfully');
                navigate('/dashboard/orders');
            }
            else {
                const msg = await res.text();
                toast.error(msg || 'Failed to update order');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred updating the order');
        }
    };

    if(loading) return <p>Loading order...</p>
    if(!order) return null;

    return (
        <>
            <h1 className="h3 mb-4 text-gray-800">Edit Order</h1>
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col>
                            <strong>Order ID: </strong>{order.id}
                        </Col>
                        <Col>
                            <strong>Placed At: </strong>{new Date(order.createdAt).toLocaleString()}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <strong>User: </strong>{order.userFirstName + ' ' + order.userLastName}
                        </Col>
                        <Col>
                            <strong>Payment Status: </strong>{order.paymentStatus ?? ''}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Status</label>
                    <select 
                        name="status"
                        className="form-control"
                        value={order.status}
                        onChange={handleChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed" disabled={order.paymentStatus !== 'Paid'}>
                            Confirmed
                        </option>
                        <option value="Shipped" disabled={order.status != 'Confirmed'}>
                            Shipped
                        </option>
                        <option value="Cancelled" disabled={order.paymentStatus === 'Paid'}>
                            Cancelled
                        </option>
                    </select>
                </div>

                <div className="form-group">
                    <h5 className="mt-4 mb-3 fw-bold border-bottom pb-2">Shipping Address</h5>
                    <Row>
                        <Col>
                            <label>Street</label>
                            <input 
                                type="text" 
                                value={order.shippingStreet || ''}
                                name="shippingStreet"
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={order.status === 'Cancelled' || order.status === 'Shipped'}
                            />
                        </Col>
                        <Col>
                            <label>City</label>
                            <input 
                                type="text" 
                                value={order.shippingCity || ''}
                                name="shippingCity"
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={order.status === 'Cancelled' || order.status === 'Shipped'}
                            />
                        </Col>
                        <Col>
                            <label>State</label>
                            <input 
                                type="text" 
                                value={order.shippingState || ''}
                                name="shippingState"
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={order.status === 'Cancelled' || order.status === 'Shipped'}
                            />
                        </Col>
                        <Col>
                            <label>Country</label>
                            <input 
                                type="text" 
                                value={order.shippingCountry || ''}
                                name="shippingCountry"
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={order.status === 'Cancelled' || order.status === 'Shipped'}
                            />
                        </Col>
                        <Col>
                            <label>Postal Code</label>
                            <input 
                                type="text" 
                                value={order.shippingPostalCode || ''}
                                name="shippingPostalCode"
                                onChange={handleChange}
                                className="form-control"
                                required
                                disabled={order.status === 'Cancelled' || order.status === 'Shipped'}
                            />
                        </Col>
                    </Row>
                </div>

                <h5 className="mt-4 mb-3 fw-bold border-bottom pb-2">Order Items</h5>
                {order.orderItem?.map((item, i) => (
                    <Card key={item.id} className="mb-2">
                        <Card.Body>
                            <Row>
                                <Col>
                                    <strong>Product: </strong>{item.productName}
                                </Col>
                                <Col>
                                    <strong>Pirce: </strong>${item.priceAtPurchase.toFixed(2)}
                                </Col>
                                <Col>
                                    <strong>Quantity: </strong>${item.quantity}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}

                <button type="submit" className="btn btn-primary mt-3 mb-5">Save</button>
            </form>
        </>
    );
}

export default OrderForm;