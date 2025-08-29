import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../../utils/AuthFetch";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";

const API_URL = 'https://localhost:7000/api';
const IMG_URL = "https://localhost:7000";

function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        imageFiles: [],
        existingImages: []
    });

    const [imageToDelete, setImageToDelete] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        if(isEdit) {
            authFetch(`${API_URL}/product/${id}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => setFormData(prev => ({
                    ...prev,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    categoryId: data.categoryId,
                    existingImages: data.images || []
                })))
                .catch(e => console.error(e));
        }
    }, [id]);

    useEffect(() => {
        authFetch(`${API_URL}/category`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(e => console.error('Failed to load categories:', e))
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if(name === 'imageFiles') {
            setFormData(prev => ({
                ...prev,
                imageFiles: Array.from(files) // Store all selected files
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }    
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            const method = isEdit ? 'PUT' : 'POST';
            const endpoint = isEdit ? `/product/${id}` : `/product`;

            //Build the payload without the images first
            const payload = {
                name: formData.name,
                description: formData.description,
                stock: formData.stock,
                price: formData.price,
                categoryId: Number(formData.categoryId)
            };

            const res = await authFetch(`${API_URL}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("Failed to save product");
            }

            let productId;

            if(isEdit) {
                productId = id;
                toast.success('Product updated successfully');
            }
            else {
                const savedProduct = await res.json();
                productId = savedProduct.id;
                toast.success('Product added successfully');
            }

            //Upload each image one by one, if any
            if(formData.imageFiles.length > 0) {
                for(const file of formData.imageFiles) {
                    const imageForm = new FormData();
                    imageForm.append('file', file);

                    const uploadResult = await authFetch(`${API_URL}/product/${productId}/upload-image`, {
                        method: 'POST',
                        credentials: 'include',
                        body: imageForm
                    });

                    if(!uploadResult.ok) {
                        throw new Error(`Failed to upload image: ${file.name}`);
                    }
                    
                    //Update the state immediately, so the images are shown right after they're added, w/o having to refresh the page
                    const uploadedImage = await uploadResult.json();
                    setFormData(prev => ({
                        ...prev,
                        existingImages: [...prev.existingImages, uploadedImage]
                    }));
                }
            }

            navigate('/dashboard/products', { replace: true });
        } catch (error) {
            console.error(error);
            toast.error('An error occured saving the product');
        }
    };

    const handleDeleteImageClick = (imageId) => {
        setImageToDelete(imageId);
        setShowImageModal(true);
    };

    const handleDeleteImageConfirm = async () => {
        try {
            const res = await authFetch(`${API_URL}/product/${id}/images/${imageToDelete}`, {
                method: 'DELETE', 
                credentials: 'include'
            });

            if(!res.ok) throw new Error('Deletion failed');

            setFormData(prev => ({
                ...prev,
                existingImages: prev.existingImages.filter(img => img.id !== imageToDelete)
            }));
        } catch (error) {
            console.error(error);
            toast.error('An error occurred deleting the image');
        } finally {
            setShowImageModal(false);
            setImageToDelete(null);
        }
    };

    return (
        <>
            <h1 className="h3 mb-4 text-gray-800">{ isEdit ? 'Edit' : 'Add' } Product</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        type="text"
                        name="name"
                        value={formData.name}
                        required
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter product name"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control 
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        required
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter a short description (max 1000 characters)"
                        maxLength={1000}
                    />
                    <Form.Text muted>
                        {formData.description.length}/1000 characters
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrice">
                    <Form.Label>Price</Form.Label>
                    <Form.Control 
                        type="number"
                        name="price"
                        value={formData.price}
                        required
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter product price"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStock">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control 
                        type="number"
                        name="stock"
                        value={formData.stock}
                        required
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter product stock"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCategory">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                        name="categoryId"
                        value={formData.categoryId}
                        className="form-control"
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImages">
                    <Form.Label>{isEdit ? 'Add new images' : 'Upload product images'}</Form.Label>
                    <Form.Control 
                        type="file"
                        name="imageFiles"
                        multiple
                        onChange={handleChange}
                    />
                </Form.Group>

                {isEdit && formData.existingImages.length > 0 && (
                    <div className="mb-3">
                        <label>Current Images:</label>
                        <div className="d-flex flex-wrap align-items-start" style={{ backgroundColor: 'white', maxWidth: 'max-content' }}>
                            {formData.existingImages.map(img => (
                                <div key={img.id} className="m-2 text-center">
                                    <img 
                                        src={`${IMG_URL}${img.url}`}
                                        alt={formData.name}
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            objectFit: 'contain',
                                            display: 'block',
                                            margin: '0 auto'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger mt-1"
                                        onClick={() => handleDeleteImageClick(img.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button type="submit" variant="primary" className="mt-2">Save</Button>
            </Form>

            <ConfirmationModal 
                show={showImageModal}
                title='Delete image'
                message="Are you sure you want to delete this image?"
                onCancel={() => setShowImageModal(false)}
                onConfirm={handleDeleteImageConfirm}
            />
        </>
    );
}

export default ProductForm;