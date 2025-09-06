import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import AddressForm from "./AddressForm";

function AddressItem({ address, onUpdate, onDeleteClick }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = async (updatedData) => {
        await onUpdate(address.id, updatedData);
        setIsEditing(false);
    };

    return (
        <Card className="mb-2">
            <Card.Body>
                {isEditing ? (
                    <AddressForm 
                        initialValues={address}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                        submitLabel="Update"
                    />
                ) : (
                    <>
                        <Card.Text>
                            {address.street}, {address.city}, {address.state}, {address.country}, {address.postalCode}
                        </Card.Text>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDeleteClick(address.id)}>Delete</Button>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default AddressItem;