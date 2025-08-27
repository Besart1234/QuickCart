import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import './ProductDetails.css'
import Comments from "../../components/comments/Comments";

function ProductDetails() {
    const { id } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [product, setProduct] = useState({
        id: 1, 
        name: "Laptop", 
        price: 999, 
        stock: 5,
        category: 'Electronics',
        description: 'Some descritption for this product', 
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop", 
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop", 
            "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&h=400&fit=crop", 
        ],
        comments: [
            {
                id: "64f8a0a9c7d2e8b29e9c1234",
                userId: 3,
                username: "Alice",
                text: "Great product, really fast performance!",
                createdAt: "2025-08-20T10:30:00Z",
                rating: 5,
            },
            {
                id: "64f8a0a9c7d2e8b29e9c5678",
                userId: 4,
                username: "Bob",
                text: "Battery life could be better, but overall solid.",
                createdAt: "2025-08-21T14:45:00Z",
                rating: 3,
            },
        ]
    });

    const avgRating = 
        product.comments.length > 0 
        ? product.comments.reduce((sum, c) => sum + c.rating, 0) / product.comments.length
        : 0;
        
    const handleAddComment = (newComment) => {
        setProduct(prev => ({
            ...prev,
            comments: [newComment, ...prev.comments]
        }));
    }

    const handleUpdateComment = (updatedComment) => {
        setProduct(prev => ({
            ...prev, 
            comments: prev.comments.map(c => 
                c.id === updatedComment.id ? updatedComment : c
            )
        }));
    };

    const handleDeleteCommet = (id) => {
        setProduct(prev => ({
            ...prev,
            comments: prev.comments.filter(c => c.id !== id)
        }));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    console.log(id);
    return (
        <Container className="my-5">
            <Row>
                <Col md={6}>
                    {/* <div className="image-slider text-center"> */}
                        <div className="image-wrapper">
                            <img 
                                src={product.images[currentIndex]}
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
                            <Button size="sm" variant="link" onClick={handleNext} className="text-dark p-0 me-2 border-0 shadow-none">
                                <FaChevronRight size={20} />
                            </Button>
                        </div>
                    {/* </div> */}
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
                                {avgRating.toFixed(1)} / 5 · {product.comments.length} reviews
                            </span>
                        </div>
                    )}

                    <p className="text-muted mb-1">
                        <strong>Category: </strong>{product.category}
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
                            disabled={product.stock === 0}
                            variant="success" 
                            className="me-3"
                        >
                            Add to Cart
                        </Button>
                        <Button variant="outline-secondary">Add to Wishlist</Button>
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
                        onDelete={handleDeleteCommet} 
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default ProductDetails;