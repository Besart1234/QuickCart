import { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

function SearchInput({ paramKey = 'search', placeholder = 'Search...', buttonLabel = 'Search' }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(searchParams.get(paramKey) || '');

    useEffect(() => {
        setSearchText(searchParams.get(paramKey) || '');
    }, [searchParams, paramKey]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const params = new URLSearchParams(searchParams);

        if(searchText.trim()) {
            params.set(paramKey, searchText.trim());
        }
        else {
            params.delete(paramKey);
        }

        setSearchParams(params);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <InputGroup>
                <Form.Control 
                    type="search"
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="form-control me-2"
                />
                <Button variant="outline-primary" type="submit">{buttonLabel}</Button>
            </InputGroup>
        </Form>
    );
}

export default SearchInput;