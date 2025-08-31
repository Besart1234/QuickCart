import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Col, Container, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductSearch from "../../components/product/ProductSearch";

const API_URL = 'https://localhost:7000/api';

function Home() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('search') || '';

    const fetchProducts = async (query = '') => {
        setLoading(true);

        const url = new URL(`${API_URL}/product`);
        if(query) url.searchParams.append('search', query);

        try {
            const res = await fetch(url);

            if(res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setLoading(false);
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
        fetchProducts(searchQuery);
        window.scrollTo(0, 0); //scroll to top on new search
    }, [searchQuery]);

    console.log
    return (
        <Container className="py-4">
            <h2>{searchQuery ? `Search results for '${searchQuery}'` : ''}</h2>
            <Row className="align-items-center mb-3 flex-wrap">
                <Col xs={12} md={6} lg={5} className="mb-2 mb-md-0">
                    <ProductSearch />
                </Col>
            </Row>
            {loading ? <p>Loading products...</p> : (
                <Row>
                    {products.map(product => (
                        <Col key={product.id} md={4} className="mb-4">
                            <ProductCard product={product} user={user} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}

export default Home;