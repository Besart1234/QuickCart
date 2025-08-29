import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_URL = 'https://localhost:7000/api';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await authFetch(`${API_URL}/product`, { credentials: 'include' });

            if(res.ok) {
                const data = await res.json();
                setProducts(data);
            }
            else {
                console.error('Failed to load products');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching products');
        }
    };

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDeleteProduct = async () => {
        try {
            const res = await authFetch(`${API_URL}/product/${selectedProduct.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) {
                setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                setShowModal(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured trying to delete the product');
        }
    };

    if(products.length === 0) return <p className="text-muted">No products yet</p>

    return (
        <div className="d-flex flex-column">
            <div>
                <h3 className="h3 mb-4 text-gray-800">Products</h3>
                <Link to='/dashboard/products/new' className="btn btn-success mb-3">Add Product</Link>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.price.toFixed(2)}</td>
                                <td>{product.stock}</td>
                                <td>{product.categoryName}</td>
                                <td>
                                    <Link to={`/dashboard/products/${product.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(product)} >Delete</button>
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
                    message={`Are you sure you want to delete product "${selectedProduct?.name}"?`}
                    onCancel={() => setShowModal(false)}
                    onConfirm={handleDeleteProduct}
                />
            )}
        </div>
    );
}

export default ProductList;