import { Form } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

function OrderSort() {
    const [searchParams, setSearchParams] = useSearchParams();
    const current = searchParams.get('sort') || '';

    const handelChange = (e) => {
        const params = new URLSearchParams(searchParams);
        if(e.target.value) {
            params.set('sort', e.target.value);
        }
        else {
            params.delete('sort');
        }

        params.set('page', 1);
        setSearchParams(params);
    };

    return (
        <Form.Select
            value={current}
            onChange={handelChange}
            style={{ width: '200px' }}
        >
            <option value="">Sort by...</option>
            <option value="dateDesc">Newest First</option>
            <option value="dateAsc">Oldest First</option>
            <option value="totalDesc">Highest Total</option>
            <option value="totalAsc">Lowest Total</option>
        </Form.Select>
    );
}

export default OrderSort;