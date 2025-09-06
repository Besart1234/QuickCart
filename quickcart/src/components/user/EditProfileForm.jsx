import { useState } from "react";
import { authFetch } from "../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";

const API_URL = "https://localhost:7000/api";

function EditProfileForm({ user, fetchUser, onCancel }) {
    const [formData, setFormData] = useState({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await authFetch(`${API_URL}/user/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if(res.ok) {
                toast.success('Profile updated');
                fetchUser();
                onCancel();
            }
            else {
                try {
                    const errData = await res.json();

                    // Handle identity-style error array (e.g. duplicate username)
                    if(Array.isArray(errData)) {
                        const isDuplicateUserName = errData.some(e => e.code === 'DuplicateUserName');
                        if(isDuplicateUserName) {
                            toast.error('Username already taken, try something different');
                            return;
                        }
                    }

                    toast.error('Failed to update profile');
                } catch {
                    toast.error('Unexpected error. Please try again.');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h5 className="mb-3">Edit Profile</h5>
            <Form.Group className="mb-2">
                <Form.Label>Username</Form.Label>
                <Form.Control name="userName" value={formData.userName} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>First Name</Form.Label>
                <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} />
            </Form.Group>
            <Button type="submit" variant="primary" className="me-2">Save</Button>
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </Form>
    );
}

export default EditProfileForm;
