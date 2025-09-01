import { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

function ProductSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(searchParams.get('search') || '');

    useEffect(() => {
        setSearchText(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const params = new URLSearchParams(searchParams);

        if(searchText.trim()) {
            params.set('search', searchText.trim());
        }
        else {
            params.delete('search');
        }

        setSearchParams(params);
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