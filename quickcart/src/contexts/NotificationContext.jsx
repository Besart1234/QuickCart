import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authFetch } from "../utils/AuthFetch";
import { toast } from "react-toastify";
import * as signalR from "@microsoft/signalr";

const API_URL = "https://localhost:7000/api";

export const NotificationContext = createContext(null);

function NotificationProvider({ children }) {
    const { user, loading } = useContext(AuthContext);

    const [notifications, setNotifications] = useState([]);
    const [connection, setConnection] = useState(null);

    // Fetch notifications + unread count when user logs in
    useEffect(() => {
        if(!loading && user) {
            fetchInitialNotifications();
            startConnection();
        }

        if(!loading && !user) {
            stopConnection();
            setNotifications([]);
        }
    }, [user, loading]);

    const fetchInitialNotifications = async () => {
        try {
            const res = await authFetch(`${API_URL}/notifications`);

            if(res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch notifications');
        }
    };

    // SignalR connection
    const startConnection = async () => {
        if(connection) return; // already connected

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7000/hubs/notifications', {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .build();

        newConnection.on('ReceiveNotification', (notification) => {
            toast.success(getNotificationPreview(notification))
            setNotifications(prev => [notification, ...prev]);
        });

        newConnection.on('NotificationRead', (notificationId) => {
            setNotifications(prev => (
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            ));
        });

        try {
            await newConnection.start();
            setConnection(newConnection);
            console.log('Connected to SignalR hub');
        } catch (error) {
            console.error('Connection to SignalR hub failed: ', error);
        }
    };

    const stopConnection = async () => {
        if(connection) {
            await connection.stop();
            setConnection(null);
            console.log('Disconnected from SignalR hub');
        }
    };

    // API actions
    const markAsRead = async (notificationId) => {
        try {
            const res = await authFetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH'
            });

            if(res.ok) {
                setNotifications(prev => (
                    prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                ));
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to mark this notification as "read"');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const res = await authFetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setNotifications(prev => (
                    prev.filter(n => n.id !== notificationId)
                ));
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to delete this notification');
        }
    };

    const deleteAllNotifications = async () => {
        try {
            const res = await authFetch(`${API_URL}/notifications/`, {
                method: 'DELETE'
            });

            if (res.ok) setNotifications([]);
        } catch (error) {
            console.error(error);
            toast.error('An error occurred trying to delete the notifications');
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount: notifications.filter(n => !n.isRead).length,
                markAsRead,
                deleteNotification,
                deleteAllNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationProvider;

export const getNotificationPreview =function(notification) {
    if(notification.message.startsWith('New comment by')) {
        const [prefix] = notification.message.split(':');
        return prefix;
    }
    return notification.message;
}