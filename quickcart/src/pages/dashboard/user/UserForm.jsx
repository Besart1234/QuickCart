import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AddressItem from "../../../components/user/AddressItem";
import AddressForm from "../../../components/user/AddressForm";
import ConfirmationModal from "../../../components/ConfirmationModal";

const API_URL = "https://localhost:7000/api";

function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [changePassword, setChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${id}`);

            if(res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred fetching the user');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Update profile info
            const res = await authFetch(`${API_URL}/user/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if(!res.ok) {
                try {
                    const errData = await res.json();

                    //Check for identity-style error array
                    if(Array.isArray(errData)) {
                        const isDuplicateUsername = errData.some(e => e.code === 'DuplicateUserName');
                        if(isDuplicateUsername) {
                            toast.error('Username already taken, try something different');
                            return;
                        }
                    }
                    
                    toast.error('Failed to update user');
                } catch (error) {
                    toast.error('Unexpected error. Please try again.');
                    console.error(error);
                }

                return;
            }

            let message = 'Updated user profile info';

            // Update password if requested
            if(changePassword && newPassword.trim()) {
                const passwordRes = await authFetch(`${API_URL}/user/${id}/change-password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword })
                });

                if(!passwordRes.ok) console.error('Failed to update password');
                else message += ' and password';
            }

            toast.success(message);
            navigate('/dashboard/users', { replace: true });
        } catch (error) {
            toast.error('Failed to update user');
            console.error(error);
        }
    };

    const handleDeleteAddressClick = (addressId) => {
        setAddressToDelete(addressId);
        setShowModal(true);
    };

    const handleDeleteAddressConfirm = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${id}/addresses/${addressToDelete}`, {
                method: 'DELETE'
            });

            if(res.ok) {
                setUser(prev => ({
                    ...prev,
                    addresses: prev.addresses.filter(a => a.id !== addressToDelete)
                }))
            }
            else {
                toast.error('Failed to delete address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to delete the address');
        } finally {
            setAddressToDelete(null);
            setShowModal(false);
        }
    };

    const handleAddAddress = async (newAddress) => {
        try {
            const res = await authFetch(`${API_URL}/user/${id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress)
            });

            if(res.ok) {
                const addedAddress = await res.json();
                setUser(prev => ({
                    ...prev,
                    addresses: [addedAddress, ...prev.addresses]
                }));
            }
            else {
                toast.error('Failed to add address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred adding the address');
        }
    };

    const handleUpdateAddress = async (addressId, updatedAddress) => {
        try {
            const res = await authFetch(`${API_URL}/user/${id}/addresses/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedAddress)
            });

            if(res.ok) {
                setUser(prev => ({
                    ...prev,
                    addresses: prev.addresses.map(a => a.id === addressId ? updatedAddress : a)
                }));
                toast.success('Address updated');
            }
            else {
                toast.error('Failed to update address');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred updating the address');
        }
    };

    if(!user) return <p>Loading user...</p>;

    return (
        <>
            <h1 className="h3 mb-4 text-gray-800">Edit User</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label>First Name</label>
                    <input type="text" className="form-control" name="firstName" value={user.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group mb-3">
                    <label>Last Name</label>
                    <input type="text" className="form-control" name="lastName" value={user.lastName} onChange={handleChange} required />
                </div>
                <div className="form-group mb-3">
                    <label>Username</label>
                    <input type="text" className="form-control" name="userName" value={user.userName} onChange={handleChange} required />
                </div>
                <div className="form-group mb-3">
                    <strong className="me-2">Email: </strong>
                    <span>{user.email}</span>
                </div>
                <div className="form-group mb-4">
                    <strong className="me-2">Role: </strong>
                    <span>{user.role}</span>
                </div>

                <div className="mb-4">
                    <button
                        className={`mb-3 ${changePassword ? 'btn btn-outline-danger' : 'btn btn-outline-secondary'}`}
                        type="button"
                        onClick={() => {
                            setChangePassword(prev => {
                                const newState = !prev;
                                if(!newState) setNewPassword('');
                                return newState;
                            });
                        }}
                    >
                        {changePassword ? 'Cancel password change' : 'Change password'}
                    </button>
                    {changePassword && (
                        <div className="form-group mb-4">
                            <label>New password</label>
                            <div className="position-relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                        </div>
                    )}
                    <button className="btn btn-primary d-block" type="submit">Save</button>
                </div>
            </form>
            <hr className="my-4" />
            <h5>User Addresses</h5>
            {user.addresses?.map(address => (
                <AddressItem 
                    key={address.id}
                    address={address}
                    onUpdate={handleUpdateAddress}
                    onDeleteClick={handleDeleteAddressClick}
                />
            ))}
            <div className="pb-5">
                <AddressForm 
                    initialValues={{ street: '', city: '', state: '', country: '', postalCode: '' }}
                    onSubmit={handleAddAddress}
                />
            </div>

            <ConfirmationModal 
                show={showModal}
                title='Confirm deletion'
                message='Are you sure you want to delete this address?'
                onCancel={() => setShowModal(false)}
                onConfirm={handleDeleteAddressConfirm}
            />
        </>
    );
}

export default UserForm;