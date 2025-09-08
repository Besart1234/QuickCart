import { useEffect, useState } from "react";
import { authFetch } from "../../../utils/AuthFetch";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = 'https://localhost:7000/api';
const PAGE_SIZE = 20;

function ProductList() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = parseInt(searchParams.get('page')) || 1;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts(pageParam);
    }, [pageParam]);

    const fetchProducts = async (currentPage = 1) => {
        try {
            const res = await authFetch(`${API_URL}/product/?page=${currentPage}&pageSize=${PAGE_SIZE}`);

            if(res.ok) {
                const data = await res.json();

                // Validate page number after we know totalPages
                const totalPagesFromAPI = data.totalPages;

                let validPage = currentPage;

                if(currentPage > totalPagesFromAPI) validPage = totalPagesFromAPI;
                if(currentPage < 1) validPage = 1;

                if(validPage !== currentPage) {
                    setSearchParams(prev => {
                        const params = new URLSearchParams(prev);
                        params.set('page', validPage);
                        return params;
                    }, { replace: true });
                }
                else {
                    setProducts(data.products);
                    setTotalPages(data.totalPages);

                    // Scroll to top after new data loads
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }    
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

    const goToPage = (newPage) => {
        if(newPage >=1 && newPage <= totalPages) setSearchParams({ page: newPage });
    };

    if(products.length === 0) return <p className="text-muted">No products yet</p>

    return (
        <div className="d-flex flex-column" style={{ minHeight: '85vh' }}>
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

            <ConfirmationModal 
                show={showModal}
                title='Confirm deletion'
                message={`Are you sure you want to delete product "${selectedProduct?.name}"?`}
                onCancel={() => setShowModal(false)}
                onConfirm={handleDeleteProduct}
            />

            <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                <button className="btn btn-secondary" onClick={() => goToPage(pageParam - 1)} disabled={pageParam === 1}>
                    Previous
                </button>
                <span>Page {pageParam} of {totalPages}</span>
                <button className="btn btn-secondary" onClick={() => goToPage(pageParam + 1)} disabled={pageParam === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ProductList;