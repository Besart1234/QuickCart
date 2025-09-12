import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";
import { Badge, Card, Table } from "react-bootstrap";

const API_URL = "https://localhost:7000/api";

function LowStockWarning() {
    const [lowStock, setLowStock] = useState([]);

    const fetchLowStockInfo = async () => {
        try {
            const res = await authFetch(`${API_URL}/dashboard/low-stock`);

            if(!res.ok) {
                toast.error('Failed to fetch low-stock data');
                return;
            }

            const data = await res.json();
            setLowStock(data);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to fetch low stock data');
        }
    };

    useEffect(() => {
        fetchLowStockInfo();
    }, []);

    const getBadgeClass = (stock) => {
        if(stock === 0) return 'danger';
        if(stock <= 5) return 'warning';
        else return 'info';
    };

    if(lowStock.length === 0) return null;

    return (
        <Card className="shadow mb-4 border-4">
            <Card.Body className="card-body">
                <div className="d-flex align-items-center mb-3">
                    <FaExclamationTriangle size={20} className="text-danger me-2" />
                    <h5 className="mb-0 text-danger">Low Stock Warning</h5>
                </div>
                    <Table hover responsive size="sm" className="mb-0">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.map(product => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>
                                        <Badge bg={getBadgeClass(product.stock)}>{product.stock}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
            </Card.Body>
        </Card>
    );
}

export default LowStockWarning;