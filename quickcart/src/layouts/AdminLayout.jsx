import { Navigate, Outlet, Link } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/footer/Footer";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { FaBox, FaShoppingCart, FaTags, FaUsers } from "react-icons/fa";

function AdminLayout() {
    const { user, loading } = useContext(AuthContext);

    // while checking auth, don’t flash redirects
    if(loading) return null;

    // if not logged in, go to home page
    if(!user) return <Navigate to='/' replace />

    // if logged in but not admin, go to hom page
    if(!user.roles?.includes('Admin')) return <Navigate to='/' replace />

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />

            <main className="flex-grow-1 d-flex" style={{ backgroundColor: "#f7f7f9" }}>
                <Container fluid className="px-0 d-flex flex-grow-1">
                    <Row className="g-0 w-100">
                        {/* Sidebar */}
                        <Col md={3} lg={2} className="bg-light border-end px-3 d-flex flex-column">
                            <h4 className="p-3 border-bottom">
                                <Link to='/dashboard' className="text-decoration-none text-dark">
                                    Admin Panel
                                </Link>
                            </h4>
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
                            <Outlet />
                        </Col>
                    </Row>
                </Container>
            </main>

            <Footer />
        </div>
    );
}

export default AdminLayout;