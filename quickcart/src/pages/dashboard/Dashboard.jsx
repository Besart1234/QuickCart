import { Col, Container, Nav, Row } from "react-bootstrap";
import { FaBox, FaShoppingCart, FaTags, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

function Dashboard() {
    return (
        <>
            <h2 className="mb-4">Dashboard Overview</h2>
            <p>
                Welcome to the QuickCart admin dashboard. Here you can manage products,
                categories, orders, users, and more.
            </p>

            {/* Placeholder content */}
            <div className="p-4 bg-white shadow-sm rounded">
                <h5>Stats & Graphs will go here</h5>
                <p className="text-muted">We'll add charts and tables later.</p>
            </div>
        </>
    );
}

export default Dashboard;