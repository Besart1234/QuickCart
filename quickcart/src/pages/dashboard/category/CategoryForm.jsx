import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import { data, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";

const API_URL = 'https://localhost:7000/api';

function CategoryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id //Double negation → turns any truthy/falsy value into a strict true/false. So: "123" becomes true, null becomes false.
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });


    useEffect(() => {
        if(isEdit) {
            authFetch(`${API_URL}/category/${id}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => setFormData(data))
                .catch(e => console.error(e));
        }
    }, [id]);

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
            const method = isEdit ? 'PUT' : 'POST';
            const endpoint = isEdit ? `/category/${id}` : `/category`;

            const res = await authFetch(`${API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if(res.ok) {
                toast.success(`Category ${isEdit ? 'updated' : 'created'} successfully`);
                navigate('/dashboard/categories', { replace: true });
            }
            else {
                toast.error(`Failed to ${isEdit ? 'update' : 'create'} the category`);
            }
        } catch (error) {
            toast.error(`An error occured trying to ${isEdit ? 'update' : 'create'} the category`);
            console.error(error);
        }
    };

    return (
        <>
            <h1 className="h3 mb-4 text-gray-800">{isEdit ? 'Edit' : 'Add'} Category</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="form-control" 
                        required
                        placeholder="Enter category name" 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea" 
                        rows={4}
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                        placeholder="Enter a short description (max 1000 characters)" 
                        maxLength={1000}
                    />
                    <Form.Text muted>
                        {formData.description.length}/1000 characters
                    </Form.Text>
                </Form.Group>
                
                <Button type="submit" variant="primary" className="mt-2">Save</Button>
            </Form>
        </>
    );
}

export default CategoryForm;