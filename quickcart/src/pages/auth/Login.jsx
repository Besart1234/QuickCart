import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const API_URL = "https://localhost:7000/api";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { fetchUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            if(res.ok) {
                await fetchUser();
                toast.success('Welcome back');
                navigate('/');
            } 
            else {
                const errorText = await res.text();
                toast.error(errorText || 'Login failed');
            }
        } catch (error) {   
            console.error(error);
            toast.error('An error occured during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100" style={{ maxWidth: '400px' }}>
                <Col>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h3 className="mb-4 text-center">Login</h3>
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control 
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                        <div
                                            onClick={() => setShowPassword(prev => !prev)}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                right: '12px',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                color: '#6c757d'
                                            }}
                                        >
                                            { showPassword ? <FaEyeSlash /> : <FaEye /> }
                                        </div>
                                    </div>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                                    { loading ? 'Logging in...' : 'Login' }
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                <small>
                                    Don't have an account? <Link to="/signup">Signup</Link>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;