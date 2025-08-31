import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Col, Container, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductSearch from "../../components/product/ProductSearch";
import CategoryFilter from "../../components/category/CategoryFilter";

const API_URL = 'https://localhost:7000/api';

function Home() {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);

    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    //Fetch categories
    useEffect(() => {
        fetch(`${API_URL}/category`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(e => console.error(e));
    }, []);

    const fetchProducts = async (query = '', categoryId = '') => {
        setLoading(true);

        const url = new URL(`${API_URL}/product`);
        if(query) url.searchParams.append('search', query);
        if(category) url.searchParams.append('categoryId', categoryId);

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
        fetchProducts(searchQuery, categoryId);
        window.scrollTo(0, 0); //scroll to top on new search
    }, [searchQuery, categoryId]);

    const handleCategoryChange = (categoryId) => {
        const params = new URLSearchParams(searchParams);

        if(categoryId) params.set('categoryId', categoryId);
        else params.delete('categoryId'); //This is for when the user chooses "All Categories" in the dropdown, so we don't keep ?category= in the URL

        setSearchParams(params);
    };

    return (
        <Container className="py-4">
            <h2>{searchQuery ? `Search results for '${searchQuery}'` : ''}</h2>
            <Row className="align-items-center mb-3 flex-wrap">
                <Col xs={12} md={6} lg={5} className="mb-2 mb-md-0">
                    <ProductSearch />
                </Col>
                <Col className="ms-auto d-flex justify-content-end gap-2" xs="auto">
                    <CategoryFilter 
                        categories={categories}
                        selectedCategoryId={categoryId}
                        onCategoryChange={handleCategoryChange}
                    />
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