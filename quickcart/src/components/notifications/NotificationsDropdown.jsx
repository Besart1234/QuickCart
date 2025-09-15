import { useContext } from "react";
import { getNotificationPreview, NotificationContext } from "../../contexts/NotificationContext";
import { Badge, Dropdown, DropdownDivider } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import '../notifications/NotificationsDropdown.css'

function NotificationsDropdown() {
    const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);

    const lastFive = [...notifications].slice(0, 5);

    return (
        <Dropdown align='end'>
            <Dropdown.Toggle variant="light" id="dropdown-notifications" className="position-relative">
                <div className="position-relative d-inline-block">
                    <FaBell size={20} className="text-dark" />
                    {unreadCount > 0 && (
                        <Badge 
                            bg="danger" 
                            pill 
                            className="position-absolute top-0 start-100 translate-middle"
                            style={{ fontSize: '0.6rem' }}
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-dropdown">
                {lastFive.length === 0 && (
                    <Dropdown.ItemText>No notifications</Dropdown.ItemText>
                )}

                {lastFive.map(notification => (
                    <Dropdown.Item 
                        key={notification.id}
                        as={Link}
                        to={notification.link || '#'}
                        onClick={() => markAsRead(notification.id)}
                        className={notification.isRead ? '' : 'fw-bold'}
                    >
                        {getNotificationPreview(notification)}
                    </Dropdown.Item>
                ))}

                {notifications.length > 5 && <Dropdown.Divider />}

                <Dropdown.Item as={Link} to='/notifications' className="text-center text-muted">
                    View all notifications
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default NotificationsDropdown;