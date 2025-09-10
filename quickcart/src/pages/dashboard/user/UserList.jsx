import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { authFetch } from "../../../utils/AuthFetch";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ConfirmationModal from '../../../components/ConfirmationModal';

const API_URL = "https://localhost:7000/api";

function UserList() {
    const [users, setUsers] = useState([]);
    const { user: loggedInUser } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await authFetch(`${API_URL}/user`);

            if(res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred fetching users');
        }
    };

    const handleDeleteClick = (userId) => {
        setShowModal(true);
        setUserToDelete(userId);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await authFetch(`${API_URL}/user/${userToDelete}`, {
                method: 'DELETE'
            });

            if(res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userToDelete));
            }
        } catch (error) {
            toast.error('Error deleting user');
            console.error(error);
        } finally {
            setShowModal(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="d-flex flex-column">
            <h3 className="h3 mb-4 text-gray-800">Users</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.userName || 'N/A'}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.role}</td>
                            <td>
                                <Link to={`/dashboard/users/${user.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteClick(user.id)}
                                    disabled={user.id === loggedInUser.id}
                                >
                                    Delete
                                </button>
                                {user.id === loggedInUser.id && (
                                    <small className="text-muted d-block">You can't delete your own account</small>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmationModal
                show={showModal}
                title='Confirm deletion'
                message='Are you sure you want to delete this user?'
                onCancel={() => setShowModal(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}

export default UserList;