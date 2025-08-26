import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Col, Container, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";

function Home() {
    const { user } = useContext(AuthContext);

    //Temporary mock data
    const products = [
        { 
            id: 1, 
            name: "Laptop", 
            price: 999, 
            stock: 5, 
            mainImageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop" 
        },
        { 
            id: 2, 
            name: "Smartphone", 
            price: 499, 
            stock: 0, 
            mainImageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop" 
        },
        { 
            id: 3, 
            name: "Smartwatch", 
            price: 199, 
            stock: 10, 
            mainImageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=600&h=400&fit=crop" 
        },
        { 
            id: 4, 
            name: "Tablet", 
            price: 299, 
            stock: 6, 
            mainImageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop" 
        },
    ];

    return (
        <Container className="py-4">
            <Row>
                {products.map(product => (
                    <Col key={product.id} md={4} className="mb-4">
                        <ProductCard product={product} user={user} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Home;