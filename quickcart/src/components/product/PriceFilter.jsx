import { Dropdown } from "react-bootstrap";

const priceOptions = [
    { label: 'All Prices', value: '' },
    { label: 'Under $10', value: 'under10' },
    { label: '$10 - $50', value: '10to50' },
    { label: '$50 - $100', value: '50to100' },
    { label: 'Over $100', value: 'over100' },
];

function PriceFilter({ selectedPrice, onChange }) {
    const selectedLabel = priceOptions.find(p => p.value === selectedPrice)?.label || 'Filter by Price';

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                {selectedLabel}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {priceOptions.map(option => (
                    <Dropdown.Item
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        active={option.value === selectedPrice}
                    >
                        {option.label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default PriceFilter;