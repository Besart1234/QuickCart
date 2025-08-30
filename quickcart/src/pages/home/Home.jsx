import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Col, Container, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";
import { toast } from "react-toastify";

const API_URL = 'https://localhost:7000/api';

function Home() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/product`);

            if(res.ok) {
                const data = await res.json();
                setProducts(data);
            }
            else {
                toast.error('Could not fetch products');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching products');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    console.log
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