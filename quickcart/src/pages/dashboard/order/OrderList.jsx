import { use, useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import { Badge } from "react-bootstrap";
import { getStatusStyle } from '../../order/OrderSummaryPage.jsx'
import { Link, useSearchParams } from "react-router-dom";
import ConfirmationModal from "../../../components/ConfirmationModal.jsx";

const API_URL = "https://localhost:7000/api";
const PAGE_SIZE = 20;

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = parseInt(searchParams.get('page')) || 1;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders(pageParam);
    }, [pageParam]);

    const fetchOrders = async (currentPage = 1) => {
        try {
            const res = await authFetch(`${API_URL}/order?page=${currentPage}&pageSize=${PAGE_SIZE}`);

            if(res.ok) {
                const data = await res.json();

                // Validate page number after we know totalPages
                const totalPagesFromAPI = data.totalPages;

                let validPage = currentPage;

                if(currentPage > totalPagesFromAPI) validPage = totalPagesFromAPI;
                if(currentPage < 1) validPage = 1;

                if(validPage !== currentPage) {
                    setSearchParams(prev => {
                        const params = new URLSearchParams(prev);
                        params.set('page', validPage);
                        return params;
                    }, { replace: true });
                }
                else {
                    setOrders(data.orders);
                    setTotalPages(data.totalPages);

                    // Scroll to top after new data loads
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const handleDeleteClick = (orderId) => {
        setShowModal(true);
        setSelectedOrder(orderId);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await authFetch(`${API_URL}/order/${selectedOrder}`, {
                method: 'DELETE'
            });

            if(res.ok) {
                setOrders(prev => prev.filter(o => o.id !== selectedOrder));
                setShowModal(false);
            }
        } catch (error) {
            toast.error('Error deleting order');
            console.error(error);
        }
    };

    const goToPage = (newPage) => {
        if(newPage >=1 && newPage <= totalPages) setSearchParams({ page: newPage });
    };

    if(orders.length === 0) return <p className="text-muted">No orders yet</p>

    return (
        <div className="d-flex flex-column" style={{ minHeight: '85vh' }}>
            <div>
                <h3 className="h3 mb-4 text-gray-800">Orders</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.firstName + ' ' + order.lastName}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>{order.totalPrice.toFixed(2)}</td>
                                <td>
                                    <Badge bg={getStatusStyle(order.status)}>{order.status}</Badge>
                                </td>
                                <td>
                                    <Badge
                                        bg={
                                            order.paymentStatus === 'Paid'
                                            ? 'success' 
                                            : order.paymentStatus === 'Failed'
                                            ? 'danger'
                                            : 'secondary'
                                        }
                                    >
                                        {order.paymentStatus}
                                    </Badge>
                                </td>
                                <td>
                                    <Link to={`/dashboard/orders/${order.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(order.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <ConfirmationModal 
                    show={showModal}
                    title="Confirm deletion"
                    message="Are you sure you want to delete this order?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowModal(false)}
                />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                <button className="btn btn-secondary" onClick={() => goToPage(pageParam - 1)} disabled={pageParam === 1}>
                    Previous
                </button>
                <span>Page {pageParam} of {totalPages}</span>
                <button className="btn btn-secondary" onClick={() => goToPage(pageParam + 1)} disabled={pageParam === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default OrderList;