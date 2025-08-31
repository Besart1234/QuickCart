import { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

function ProductSearch() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState(searchParams.get('search') || '');

    useEffect(() => {
        setSearchText(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(searchText.trim() ? `/?search=${searchText.trim()}` : `/`);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <InputGroup>
                <Form.Control 
                    type="search"
                    placeholder="Search products..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="form-control me-2"
                />
                <Button variant="outline-primary" type="submit">Search</Button>
            </InputGroup>
        </Form>
    );
}

export default ProductSearch;