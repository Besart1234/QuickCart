import { Form } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

function StatusFilter() {
    const [searchParams, setSearchParams] = useSearchParams();
    const current = searchParams.get('status') || ''; 

    const handelChange = (e) => {
        const params = new URLSearchParams(searchParams);
        if(e.target.value) {
            params.set('status', e.target.value);
        }
        else {
            params.delete('status');
        }

        params.set('page', 1); // reset to first page
        setSearchParams(params);
    };

    return (
        <Form.Select
            value={current}
            onChange={handelChange}
            style={{ width: '200px' }}
        >
            <option value=''>All Statuses</option>
            <option value='Shipped'>Shipped</option>
            <option value='Confirmed'>Confirmed</option>
            <option value='Pending'>Pending</option>
            <option value='Cancelled'>Cancelled</option>
        </Form.Select>
    );
}

export default StatusFilter;