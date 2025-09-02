import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductSearch from "../../components/product/ProductSearch";
import CategoryFilter from "../../components/category/CategoryFilter";
import PriceFilter from "../../components/product/PriceFilter";

const API_URL = 'https://localhost:7000/api';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const priceParam = searchParams.get('price') || '';
    const pageParam = parseInt(searchParams.get('page')) || 1;

    //Fetch categories
    useEffect(() => {
        fetch(`${API_URL}/category`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(e => console.error(e));
    }, []);

    const fetchProducts = async (query = '', categoryId = '', price = '', page = 1) => {
        setLoading(true);

        const url = new URL(`${API_URL}/product`);
        if(query) url.searchParams.append('search', query);
        if(categoryId) url.searchParams.append('categoryId', categoryId);
        if(price) url.searchParams.append('price', price);
        url.searchParams.append('page', page);
        url.searchParams.append('pageSize', 12);

        try {
            const res = await fetch(url);

            if(res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.totalPages);
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
        fetchProducts(searchQuery, categoryId, priceParam, pageParam);
        window.scrollTo(0, 0); //scroll to top on new search
    }, [searchQuery, categoryId, priceParam, pageParam]);

    useEffect(() => {
        // once products are loaded and we know totalPages, validate page
        if(totalPages > 0 && pageParam > totalPages) {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', totalPages);
                return params;
            }, { replace: true }); // replace so user’s history isn’t spammed
        }
        if(pageParam < 1) {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', 1);
                return params;
            }, { replace: true });
        }
    }, [totalPages, pageParam]);

    const handleNextPage = () => {
        if(pageParam < totalPages) {
            const nextPage = pageParam + 1;
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', nextPage);
                return params;
            });
        }
    };

    const handlePreviousPage = () => {
        if(pageParam > 1) {
            const previousPage = pageParam - 1;
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', previousPage);
                return params;
            });
        }
    };

    const handleCategoryChange = (categoryId) => {
        const params = new URLSearchParams(searchParams);

        if(categoryId) params.set('categoryId', categoryId);
        else params.delete('categoryId'); //This is for when the user chooses "All Categories" in the dropdown, so we don't keep ?category= in the URL

        setSearchParams(params);
    };

    const handlePriceFilterChange = (price) => {
        const params = new URLSearchParams(searchParams);

        if(price) params.set('price', price);
        else params.delete('price');

        setSearchParams(params);
    };

    return (
        <>
            <h2>{searchQuery ? `Search results for '${searchQuery}'` : ''}</h2>
            <Row className="align-items-center mb-3 flex-wrap">
                <Col xs={12} md={6} lg={5} className="mb-2 mb-md-0">
                    <ProductSearch />
                </Col>

                <Col xs='auto' className="ms-auto d-flex justify-content-end gap-2">
                    <CategoryFilter 
                        categories={categories}
                        selectedCategoryId={categoryId}
                        onCategoryChange={handleCategoryChange}
                    />

                    <PriceFilter 
                        selectedPrice={priceParam}
                        onChange={handlePriceFilterChange}
                    />
                </Col>
            </Row>
            {loading ? <p>Loading products...</p> : (
                <Row>
                    {products.map(product => (
                        <Col key={product.id} md={4} className="mb-4">
                            <ProductCard product={product}/>
                        </Col>
                    ))}
                </Row>
            )}

            <div className="d-flex justify-content-between my-4">
                <button variant='secondary' onClick={handlePreviousPage} disabled={pageParam === 1}>Previous</button>
                <span className='mx-3'>Page {pageParam} of {totalPages}</span>
                <button variant='secondary' onClick={handleNextPage} disabled={pageParam === totalPages}>Next</button>
            </div>
        </>
    );
}

export default Home;