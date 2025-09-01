import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { ShoppingCart, Heart } from "lucide-react";
import './ProductCard.css'
import { Link } from "react-router-dom";

const IMG_URL = 'https://localhost:7000';

function ProductCard({ product, user }) {
    return (
        <Card className="product-card shadow-sm h-100">
            <Card.Img 
                variant="top"
                src={`${IMG_URL}${product.mainImageUrl}`}
                alt={product.name}
                className="product-image"
            />
            <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text className="card-price highlight">
                        ${product.price}
                    </Card.Text>
                </div>
                <div className='card-bottom d-flex justify-content-between align-items-center mt-3'>
                    <Button as={Link} to={`/products/${product.id}`} variant='primary'>View Details</Button>
                    
                    <span className={`stock-message ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>

                    <div className='action-buttons d-flex gap-2'>
                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Add to Wishlist</Tooltip>}
                        >
                            <Button 
                                disabled={!user}
                                variant='light' 
                                className='icon-button'
                            >
                                <Heart size={18} />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement='top'
                            overlay={<Tooltip>Add to Cart</Tooltip>}
                        >
                            <Button 
                                disabled={product.stock < 1 || !user} 
                                variant='light' 
                                className='icon-button'
                            >
                                <ShoppingCart size={18} />
                            </Button>
                        </OverlayTrigger>
                    </div>
                </div>             
            </Card.Body>
        </Card>
    );
}

export default ProductCard;