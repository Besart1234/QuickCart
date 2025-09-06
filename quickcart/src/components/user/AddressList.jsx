import { useEffect, useState } from "react";
import { authFetch } from "../../utils/AuthFetch";
import { toast } from "react-toastify";
import AddressItem from "./AddressItem";
import AddressForm from "./AddressForm";
import ConfirmationModal from "../ConfirmationModal";

const API_URL = "https://localhost:7000/api";

function AddressList({ user }) {
    const [addresses, setAddresses] = useState([]);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchAddresses = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/addresses`);

            if(res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Error fetching addresses', error);
        }
    };

    const handleAdd = async (newAddress) => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newAddress)
            });

            if(res.ok) {
                toast.success('Address added');
                fetchAddresses();
            }
            else {
                toast.error('Failed to add the address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to add the address');
        }
    };

    const handleUpdate = async (addressId, updatedAddress) => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/addresses/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedAddress)
            });

            if(res.ok) {
                toast.success('Address updated');
                fetchAddresses();
            }
            else {
                toast.error('Failed to update the address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to update the address');
        }
    };

    const handleDeleteClick = (addressId) => {
        setAddressToDelete(addressId);
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${user.id}/addresses/${addressToDelete}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) {
                toast.success('Address deleted');
                fetchAddresses();
            }
            else {
                toast.error('Failed to delete the address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to delete the address');
        } finally {
            setAddressToDelete(null);
            setShowModal(false);
        }
    };

    useEffect(() => {
        if(user) fetchAddresses();
    }, [user]);

    return (
        <>
            <h5 className="mb-3">Addresses</h5>
            {addresses.length === 0 ? (
                <p>You have no saved addresses</p>
            ) : (
                addresses.map(address => (
                    <AddressItem 
                        key={address.id}
                        address={address}
                        onUpdate={handleUpdate}
                        onDeleteClick={handleDeleteClick}
                    />
                ))
            )}

            <AddressForm 
                initialValues={{ street: '', city: '', state: '', country: '', postalCode: '' }}
                onSubmit={handleAdd}
                submitLabel="Add"
            />

            <ConfirmationModal 
                show={showModal}
                title='Confirm deletion'
                message='Are you sure you want to delete this address?'
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
}

export default AddressList;