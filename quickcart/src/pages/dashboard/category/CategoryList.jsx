import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { authFetch } from "../../../utils/AuthFetch";

const API_URL = 'https://localhost:7000/api';

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await authFetch(`${API_URL}/category`, { credentials: 'include' });
            
            if(res.ok) {
                const data = await res.json();
                setCategories(data);
            }
            else {
                console.error('Failed to load categories');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching categories');
        }
    };

    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    const handleDeleteCategory = async () => {
        try {
            const res = await authFetch(`${API_URL}/category/${selectedCategory.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) {
                setCategories(prev => prev.filter(category => category.id !== selectedCategory.id));
                setShowModal(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured trying to delete the category');
        }
    };

    if(categories.length === 0) return <p className="text-muted">No categories yet</p>

    return (
        <div className="d-flex flex-column">
            <div>
                <h3 className="h3 mb-4 text-gray-800">Categories</h3>
                <Link to='/dashboard/categories/new' className="btn btn-success mb-3">Add Category</Link>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td>
                                    <Link to={`/dashboard/categories/${category.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(category)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <ConfirmationModal 
                    show={showModal}
                    title='Confirm deletion'
                    message={`Are you sure you want to delete category "${selectedCategory?.name}"?`}
                    onCancel={() => setShowModal(false)}
                    onConfirm={handleDeleteCategory}
                />
            )}
        </div>
    );
}

export default CategoryList;