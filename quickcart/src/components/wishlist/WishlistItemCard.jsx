import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const IMG_URL = 'https://localhost:7000';

function WishlistItemCard({ item, onRemoveFromWishlist, onAddToCart }) {
    const imageUrl = `${IMG_URL}/${item.images[0].url}`;

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            margin: '5px',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid lightgrey",
                            borderRadius: "0.5rem",
                            flexShrink: 0 
                        }}
                    >
                        <img 
                            src={imageUrl} 
                            alt={item.productName}
                            style={{
                                maxHeight: "100%", 
                                objectFit: "cover",
                                display: "block"
                            }}
                        />
                    </div>
                    <div>
                        <h5>{item.productName}</h5>
                        <p className="text-muted mb-1">${item.price}</p>
                        <Button variant="link" size="sm" as={Link} to={`/products/${item.productId}`}>
                            View Details
                        </Button>
                    </div>
                </div>
                <div className="d-flex flex-column gap-2">
                    <Button variant="success" onClick={() => onAddToCart(item.productId)}>Add to Cart</Button>
                    <Button variant="outline-danger" onClick={() => onRemoveFromWishlist(item.productId)}>Remove from Wishlist</Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default WishlistItemCard;