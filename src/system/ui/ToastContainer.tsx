import React, { useState, useEffect } from 'react';
import { ToastNotification, useNotifications, type Notification } from './NotificationCenter';

export const ToastContainer: React.FC = () => {
  const { notifications } = useNotifications();
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Show only the latest 3 notifications as toasts
    const recentNotifications = notifications
      .filter(n => !n.read)
      .slice(0, 3);
    
    setToastNotifications(recentNotifications);
  }, [notifications]);

  const removeToast = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastNotifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onRemove={() => removeToast(notification.id)}
        />
      ))}
    </div>
  );
};
