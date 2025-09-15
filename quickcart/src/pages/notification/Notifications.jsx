import { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Button, Card, Col, Container, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FaCheck, FaTrash } from "react-icons/fa";

function Notifications() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useContext(NotificationContext);

    return (
        <>
            <Row className="align-items-center mb-3 mt-4 flex-wrap">
                <Col className="mb-2 mb-md-0">
                    <h2>Notifications</h2>
                </Col>
                {notifications.length > 0 && (
                    <Col xs='auto' className="ms-auto d-flex justify-content-end gap-2">
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={deleteAllNotifications}
                        >
                            <FaTrash className="me-2" /> Clear All
                        </Button>
                    </Col>
                )}
            </Row>

            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                notifications.map(notification => (
                    <Card 
                        key={notification.id}
                        className="mb-3 shadow-sm w-100"
                        bg={notification.isRead ? 'light' : 'white'}
                    >
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <Card.Text className={notification.isRead ? '' : 'fw-bold'}>
                                    {notification.message}
                                </Card.Text>
                                <small className="text-muted">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </small>
                                {notification.link && (
                                    <div>
                                        <a 
                                            href={notification.link} 
                                            className="small"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            View details
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                {!notification.isRead && (
                                    <OverlayTrigger placement="top" overlay={<Tooltip>Mark as read</Tooltip>}>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <FaCheck />
                                        </Button>
                                    </OverlayTrigger>
                                )}
                                <OverlayTrigger placement="top" overlay={<Tooltip>Delete notification</Tooltip>}>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            )}
        </>
    );
}

export default Notifications;