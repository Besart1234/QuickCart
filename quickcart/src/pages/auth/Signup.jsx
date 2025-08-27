import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "https://localhost:7000/api";

function Signup() {
    const { fetchUser } = useContext(AuthContext);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        repeatPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(form.password !== form.repeatPassword){
            toast.error(`Passwords don't match`);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            if(res.ok) {
                toast.success('Welcome to QuickCart');
                fetchUser(); // this will set the user in context
                navigate('/');
            }
            else {
                try {
                    const errorData = await res.json();

                    // Handle password validation error (model state)
                    if(errorData.errors?.Password) {
                        toast.error('Password must be at least 6 characters');
                        return;
                    }

                    // Handle identity-style error array (e.g. duplicate email)
                    if(Array.isArray(errorData)) {
                        const isEmailTaken = errorData.some(e => e.code === 'DuplicateEmail');
                        if(isEmailTaken) {
                            toast.error('Email already taken, try something different');
                            return;
                        }

                        const isUserNameTaken = errorData.some(e => e.code === 'DuplicateUserName');
                        if(isUserNameTaken) {
                            toast.error('Username already taken, try something different');
                            return;
                        }
                    }

                    toast.error('Registration failed. Please check your input');
                } catch {
                    toast.error('Unexpected error. Please try again.');
                }
            }
        } catch (error) {
            toast.error('An error occured during signup');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-3" style={{ minHeight: '100vh' }}>
            <Row className="w-100" style={{ maxWidth: '500px' }}>
                <Col>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h3 className="mb-4 text-center">Signup</h3>
                            <Form onSubmit={handleSignup}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={form.firstName}
                                        name="firstName"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={form.lastName}
                                        name="lastName"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control 
                                        type="email"
                                        value={form.email}
                                        name="email"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={form.userName}
                                        name="userName"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control 
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            name="password"
                                            onChange={handleChange}
                                            required
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
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>    
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Repeat Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control 
                                            type={showRepeatPassword ? 'text' : 'password'}
                                            value={form.repeatPassword}
                                            name="repeatPassword"
                                            onChange={handleChange}
                                            required
                                        />
                                        <div 
                                            onClick={() => setShowRepeatPassword(prev => !prev)}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                right: '12px',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                color: '#6c757d'
                                            }}
                                        >
                                            {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>    
                                    </div>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                                    { loading ? 'Signing you up...' : 'Signup' }
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                Already have an account? <Link to='/login'>Login</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Signup;