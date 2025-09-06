import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

function AddressForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, 
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form onSubmit={handleSubmit} className="mt-3">
            <Row className="g-2">
                <Col md>
                    <Form.Control required name='street' value={formData.street} placeholder='Street' onChange={handleChange} />
                </Col>
                <Col md>
                    <Form.Control required name='city' value={formData.city} placeholder='City' onChange={handleChange} />
                </Col>
                <Col md>
                    <Form.Control required name='state' value={formData.state} placeholder='State' onChange={handleChange} />
                </Col>
                <Col md>
                    <Form.Control required name='country' value={formData.country} placeholder='Country' onChange={handleChange} />
                </Col>
                <Col md>
                    <Form.Control required name='postalCode' value={formData.postalCode} placeholder='Postal Code' onChange={handleChange} />
                </Col>
                <Col md='auto' className="d-flex align-items-center">
                    <Button type="submit" variant="success" className="me-2">{submitLabel}</Button>
                    {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
                </Col>
            </Row>
        </Form>
    );
}

export default AddressForm;