import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import './ProductDetails.css'
import Comments from "../../components/comments/Comments";
import { authFetch } from "../../utils/AuthFetch";
import ConfirmationModal from "../../components/ConfirmationModal";
import { CartContext } from "../../contexts/CartContext";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { WishlistContext } from "../../contexts/WishlistContext";

const API_URL = 'https://localhost:7000/api';
const IMG_URL = "https://localhost:7000";

function ProductDetails() {
    const { id } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [product, setProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { addToWishlist } = useContext(WishlistContext);

    useEffect(() => {
        fetch(`${API_URL}/product/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data))
            .catch(e => console.error(e));
    }, [id]);

    if(!product) return <p className="text-center mt-5">Loading...</p>

    const avgRating = 
        product.comments.length > 0 
        ? product.comments.reduce((sum, c) => sum + c.rating, 0) / product.comments.length
        : 0;
        
    const handleAddComment = async (newComment) => {
        try {
            const res = await authFetch(`${API_URL}/product/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newComment)
            });

            if(res.ok) {
                const createdComment = await res.json();
                setProduct(prev => ({
                    ...prev,
                    comments: [createdComment, ...prev.comments]
                }));
            }
            else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateComment = async (updatedComment) => {
        try {
            const res = await authFetch(`${API_URL}/product/${id}/comments/${updatedComment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedComment)
            });

            if(res.ok) {
                setProduct(prev => ({
                    ...prev,
                    comments: prev.comments.map(c => c.id === updatedComment.id ? updatedComment : c)
                }));
            }
            else {
                console.error("Failed to update comment");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCommentClick = (comment) => {
        setCommentToDelete(comment);
        setShowModal(true);
    };

    const confirmDeleteComment = async () => {
        if(!commentToDelete) return;

        try {
            const res = await authFetch(`${API_URL}/product/${id}/comments/${commentToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if(res.ok) {
                setProduct(prev => ({
                    ...prev,
                    comments: prev.comments.filter(c => c.id !== commentToDelete.id)
                }));
            }
            else {
                console.error("Failed to delete comment");
            }
        } catch (error) {
            console.error(error);
        }

        setShowModal(false);
        setCommentToDelete(null);
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    const handleAddToCart = async () => {
        if(!user) return;

        try {
            await addToCart(id, 1); //context handles API + cart count
            toast.success(`Product added to cart`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add product to cart');
        }
    };

    return (
        <Container className="my-5">
            <Row>
                <Col md={6}>
                    <div className="image-slider text-center">
                        <div className="image-wrapper">
                            <img 
                                src={`${IMG_URL}${product.images[currentIndex].url}`}
                                alt={product.name} 
                                className="main-image mb-3"
                            />
                        </div>

                        <div className="image-nav text-center mt-2">
                            <Button size="sm" variant="link" onClick={handlePrev} className="text-dark p-0 me-2 border-0 shadow-none">
                                <FaChevronLeft size={20}/>
                            </Button>
                            {product.images.map((_, index) => (
                                <span key={index} className={`dot ${currentIndex === index ? 'active' : ''}`}></span>
                            ))}
                            <Button size="sm" variant="link" onClick={handleNext} className="text-dark p-0 ms-2 border-0 shadow-none">
                                <FaChevronRight size={20} />
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <h2>{product.name}</h2>
                    <p className="text-muted">${product.price}</p>

                    {/* Average Rating */}
                    {avgRating > 0 && (
                        <div className="mb-2 d-flex align-items-center">
                            <div className="d-flex">
                                {[...Array(5)].map((_, i) => {
                                    const starValue = i + 1;
                                    const fillPercent = Math.min(Math.max(avgRating - i, 0), 1) * 100; //0-100%

                                    return (
                                        <span
                                            key={i}
                                            style={{
                                                position: 'relative',
                                                width: 20,
                                                height: 20,
                                                marginRight: 2,
                                                display: 'inline-block',
                                                lineHeight: 0
                                            }}
                                        >
                                            {/* gray background star */}
                                            <FaStar 
                                                size={20} 
                                                color="#e4e5e9"
                                                style={{ position: 'absolute', inset: 0 }} 
                                            />
                                            {/* gold foreground star; use a wrapper to clip gold star */}
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: `${fillPercent}%`,
                                                    height: '100%',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <FaStar 
                                                    size={20} 
                                                    color="#ffc107"
                                                    style={{ position: 'absolute', inset: 0 }}  
                                                />
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                            <span className="ms-2 text-muted">
                                {avgRating.toFixed(1)} / 5 · {product.comments.length} {product.comments.length === 1 ? 'review' : 'reviews'}
                            </span>
                        </div>
                    )}

                    <p className="text-muted mb-1">
                        <strong>Category: </strong>{product.categoryName}
                    </p>
                    <p>{product.description}</p>
                    <p>
                        {product.stock === 0 ? (
                            <span className="text-danger"><strong>Out of stock</strong></span>
                        ) : (
                            <span className="text-success"><strong>Stock: </strong>{product.stock}</span>
                        )}
                    </p>
                    <div className="mt-4">
                        <Button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || !user}
                            variant="success" 
                            className="me-3"
                        >
                            Add to Cart
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            disabled={!user}
                            onClick={() => addToWishlist(product.id)}
                        >
                            Add to Wishlist
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Comments section */}
            <Row className="mt-5">
                <Col md={6}>
                    <Comments 
                        comments={product.comments} 
                        onAdd={handleAddComment}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteCommentClick} 
                    />
                </Col>
            </Row>

            {showModal && (
                <ConfirmationModal 
                    show={showModal}
                    title='Delete comment'
                    message='Are you sure you want to delete this comment?'
                    onCancel={() => setShowModal(false)}
                    onConfirm={confirmDeleteComment} 
                />
            )}
        </Container>
    );
}

export default ProductDetails;