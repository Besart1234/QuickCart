import { Button, Modal } from "react-bootstrap";

function ConfirmationModal({ show, title, message, onConfirm, onCancel }) {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;