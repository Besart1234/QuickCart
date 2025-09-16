import { Dropdown } from "react-bootstrap";

const sortOptions = [
    { label: 'Default Order', value: '' },
    { label: 'Price: Low to High', value: 'priceAsc' },
    { label: 'Price: High to Low', value: 'priceDesc' },
];

function PriceSort({ selectedSort, onChange }) {
    const selectedLabel = sortOptions.find(s => s.value === selectedSort)?.label;

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort">
                {selectedLabel}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {sortOptions.map(option => (
                    <Dropdown.Item 
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        active={selectedSort === option.value}
                    >
                        {option.label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default PriceSort;