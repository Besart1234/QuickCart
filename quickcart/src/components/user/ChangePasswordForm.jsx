import { useState } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../../utils/AuthFetch";
import { Button, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "https://localhost:7000/api";

function ChangePasswordForm({ user, onCancel }) {
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordValid = newPassword.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!isPasswordValid) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/change-password`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({newPassword})
            });

            if(res.ok) {
                toast.success('Password has been updated');
                setNewPassword('');
                onCancel();
            }
            else {
                toast.error('Failed to update password');
            }
        } catch (error) {
            console.log(error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <h5 className="mb-3">Change Password</h5>
            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="position-relative">
                    <Form.Control 
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        isInvalid={newPassword.length > 0 && !isPasswordValid}
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
                    <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters
                    </Form.Control.Feedback>
                </div>
            </Form.Group>
            <Button type="submit" variant="primary" className="me-2" disabled={isSubmitting || !isPasswordValid}>Save</Button>
            <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </Form>
    );
}

export default ChangePasswordForm;