import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useParams } from "react-router-dom";
import './ProductDetails.css'

const product = {
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
    ]
}

function ProductDetails() {
    const { id } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);

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
        </Container>
    );
}

export default ProductDetails;