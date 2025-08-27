import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import './Header.css'

function Header(){
    const { user, logout, loading } = useContext(AuthContext);

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
                                {user.roles.includes('Admin') && (
                                    <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        )
                    )}
                </Nav>
            </Navbar.Collapse>
            
        </Navbar>
    );
}

export default Header;