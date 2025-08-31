import { Dropdown } from "react-bootstrap";

function CategoryFilter({ categories, selectedCategoryId, onCategoryChange }) {
    const selectedCategory = categories.find(c => String(c.id) === String(selectedCategoryId));
    const selectedLabel = selectedCategoryId === '' ? 'All Categories' : (selectedCategory?.name ?? 'Select Category'); 

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                {selectedLabel}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item
                    onClick={() => onCategoryChange('')}
                    active={selectedCategoryId === ''}
                >
                    All Categories
                </Dropdown.Item>
                {categories.map(category => (
                    <Dropdown.Item
                        key={category.id}
                        onClick={() => onCategoryChange(String(category.id))}
                        active={String(category.id) === String(selectedCategoryId)}
                    >
                        {category.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default CategoryFilter;