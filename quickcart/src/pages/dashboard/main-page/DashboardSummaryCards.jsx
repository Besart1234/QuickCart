import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { FaBox, FaCalendarDay, FaClock, FaMoneyBillWave, FaShoppingCart, FaUsers } from "react-icons/fa";

const API_URL = "https://localhost:7000/api";

function DashboardSummaryCards() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSummaryData = async () => {
        try {
            const res = await authFetch(`${API_URL}/dashboard/summary`);

            if(!res.ok) {
                toast.error('Failed to fetch summary');
                return;
            }

            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during fetch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummaryData();
    }, []);

    if(loading) return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" />
        </div>
    );

    if(!stats) return <p className="text-danger text-center">Failed to load dashboard data</p>;

    const cards = [
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: <FaShoppingCart size={24} />,
            color: 'primary'
        },

        {
            title: 'Awaiting Shipment',
            value: stats.awaitingShipmentOrders,
            icon: <FaClock size={24} />,
            color: 'warning'
        },

        {
            title: 'Orders Today',
            value: stats.ordersToday,
            icon: <FaCalendarDay size={24} />,
            color: 'secondary'
        },

        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: <FaMoneyBillWave size={24} />,
            color: 'success'
        },

        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: <FaBox size={24} />,
            color: 'info'
        }, 

        {
            title: 'Total Users',
            value: stats.totalCustomers,
            icon: <FaUsers size={24} />,
            color: 'dark'
        }
    ];

    return (
        <Row>
            {cards.map((card, index) => (
                <Col key={index} md={6} xl={4} className="mb-4">
                    <Card className="shadow h-100">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-xs text-uppercase mb-1 text-muted fw-bold">
                                    {card.title}
                                </div>
                                <div className="h5 fw-bold">
                                    {card.value === 0 ? '-' : card.value}
                                </div>
                            </div>
                            <div className={`text-${card.color}`}>{card.icon}</div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}

export default DashboardSummaryCards;