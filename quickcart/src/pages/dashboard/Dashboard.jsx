import { Col, Container, Nav, Row } from "react-bootstrap";
import { FaBox, FaShoppingCart, FaTags, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

function Dashboard() {
    return (
        <Container fluid className="px-0">
            <Row className="g-0">
                {/* Sidebar */}
                <Col md={3} lg={2} className="bg-light border-end vh-100 px-3">
                    <h4 className="p-3 border-bottom">Admin Panel</h4>
                    <Nav className="flex-column">
                        <Nav.Link as={Link} to='/dashboard/categories' className="d-flex align-items-center px-3 py-2">
                            <FaTags className="me-2" /> Categories
                        </Nav.Link>
                        <Nav.Link as={Link} to='/dashboard/products' className="d-flex align-items-center px-3 py-2">
                            <FaBox className="me-2" /> Products
                        </Nav.Link>
                        <Nav.Link as={Link} to='/dashboard/orders' className="d-flex align-items-center px-3 py-2">
                            <FaShoppingCart className="me-2" /> Orders
                        </Nav.Link>
                        <Nav.Link as={Link} to='/dashboard/users' className="d-flex align-items-center px-3 py-2">
                            <FaUsers className="me-2" /> Users
                        </Nav.Link>
                    </Nav>
                </Col>

                {/* Main content */}
                <Col md={9} lg={10} className="p-4">
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
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;