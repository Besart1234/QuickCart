import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import ProductCard from "../../components/product/ProductCard";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import SearchInput from "../../components/SearchInput";
import CategoryFilter from "../../components/category/CategoryFilter";
import PriceFilter from "../../components/product/PriceFilter";
import PriceSort from "../../components/product/PriceSort";

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
    const sortParam = searchParams.get('sort') || '';

    //Fetch categories
    useEffect(() => {
        fetch(`${API_URL}/category`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(e => console.error(e));
    }, []);

    const fetchProducts = async (query = '', categoryId = '', price = '', page = 1, sort = '') => {
        setLoading(true);

        const url = new URL(`${API_URL}/product`);
        if(query) url.searchParams.append('search', query);
        if(categoryId) url.searchParams.append('categoryId', categoryId);
        if(price) url.searchParams.append('price', price);
        if(sort) url.searchParams.append('sort', sort);
        url.searchParams.append('page', page);
        url.searchParams.append('pageSize', 12);

        try {
            const res = await fetch(url);
            if(!res.ok) throw new Error('Failed to fetch products');

            const data = await res.json();
            // Validate page number after we know totalPages
            const totalPagesFromAPI = data.totalPages;

            let validPage = page;
            if(validPage > totalPagesFromAPI) validPage = totalPagesFromAPI;
            if(validPage < 1) validPage = 1;

            if(validPage !== page) {
                setSearchParams(prev => {
                    const params = new URLSearchParams(prev);
                    params.set('page', validPage);
                    return params;
                }, { replace: true });
            }
            else {
                setProducts(data.products);
                setTotalPages(data.totalPages);
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching products');
        }
    };

    useEffect(() => {
        fetchProducts(searchQuery, categoryId, priceParam, pageParam, sortParam);
        window.scrollTo(0, 0); //scroll to top on new search
    }, [searchQuery, categoryId, priceParam, pageParam, sortParam]);

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

    const handleSortChange = (sort) => {
        const params = new URLSearchParams(searchParams);

        if(sort) params.set('sort', sort);
        else params.delete('sort');

        setSearchParams(params);
    };

    return (
        <>
            <h2>{searchQuery ? `Search results for '${searchQuery}'` : ''}</h2>
            <Row className="align-items-center mb-3 flex-wrap">
                <Col xs={12} md={6} lg={5} className="mb-2 mb-md-0">
                    <SearchInput 
                        paramKey="search"
                        placeholder="Search products..."
                    />
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

                    <PriceSort 
                        selectedSort={sortParam}
                        onChange={handleSortChange}
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