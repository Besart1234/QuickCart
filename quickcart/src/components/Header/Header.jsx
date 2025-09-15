import { Navbar, Nav, NavDropdown, Container, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import './Header.css'
import { CartContext } from "../../contexts/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import NotificationsDropdown from "../notifications/NotificationsDropdown";

function Header(){
    const { user, logout, loading } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container>
                {/*Brand*/}
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    QuickCart
                </Navbar.Brand>
            </Container>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end" >
                <Nav>
                    {!loading && (
                        !user ? (
                        <>
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                            <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                        </>
                        ) : (
                            <>
                                <NotificationsDropdown />

                                {/* Cart link */}
                                <Nav.Link as={Link} to='/cart'>
                                    <div className="position-relative d-inline-block">
                                        <FaShoppingCart size={20} className="text-dark" />
                                        {cartCount > 0 && (
                                            <Badge
                                                bg="primary"
                                                pill
                                                className="position-absolute top-0 start-100 translate-middle"
                                                style={{ fontSize: '0.6rem' }}
                                            >
                                                {cartCount}
                                            </Badge>
                                        )}
                                    </div>
                                </Nav.Link>

                                {/* User dropdown */}
                                <NavDropdown 
                                    title={
                                        <span className="user-dropdown">
                                            {user.userName}
                                        </span>
                                    }
                                    id="user-menu" 
                                    align="end"
                                    className="custom-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/cart">Cart</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/wishlist">Wishlist</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                    {user.roles.includes('Admin') && (
                                        <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                                    )}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        )
                    )}
                </Nav>
            </Navbar.Collapse>
            
        </Navbar>
    );
}

export default Header;