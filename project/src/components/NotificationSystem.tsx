import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback(
        (type: NotificationType, message: string, duration: number = 4000) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newNotification: Notification = { id, type, message, duration };

            setNotifications((prev) => [...prev, newNotification]);

            if (duration > 0) {
                setTimeout(() => {
                    setNotifications((prev) => prev.filter((n) => n.id !== id));
                }, duration);
            }
        },
        []
    );

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getNotificationStyles = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                    border: 'border-emerald-400',
                    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                    iconBg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    progress: 'bg-emerald-500',
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
                    border: 'border-red-400',
                    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                    iconBg: 'bg-red-100',
                    text: 'text-red-800',
                    progress: 'bg-red-500',
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                    border: 'border-amber-400',
                    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                    iconBg: 'bg-amber-100',
                    text: 'text-amber-800',
                    progress: 'bg-amber-500',
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
                    border: 'border-blue-400',
                    icon: <Info className="w-5 h-5 text-blue-600" />,
                    iconBg: 'bg-blue-100',
                    text: 'text-blue-800',
                    progress: 'bg-blue-500',
                };
            default:
                return {
                    bg: 'bg-white',
                    border: 'border-gray-300',
                    icon: <Info className="w-5 h-5 text-gray-600" />,
                    iconBg: 'bg-gray-100',
                    text: 'text-gray-800',
                    progress: 'bg-gray-500',
                };
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((notification) => {
                    const styles = getNotificationStyles(notification.type);
                    return (
                        <div
                            key={notification.id}
                            className={`${styles.bg} ${styles.border} border-2 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-auto transform transition-all duration-300 ease-out animate-slideIn max-w-md`}
                            style={{
                                animation: 'slideIn 0.3s ease-out',
                            }}
                        >
                            <div className="flex items-start gap-3 p-4">
                                <div className={`${styles.iconBg} rounded-lg p-2 flex-shrink-0`}>
                                    {styles.icon}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className={`${styles.text} font-semibold text-sm leading-relaxed break-words`}>
                                        {notification.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
                                    aria-label="Close notification"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            {notification.duration && notification.duration > 0 && (
                                <div className="h-1 bg-white/30 rounded-b-xl overflow-hidden">
                                    <div
                                        className={`h-full ${styles.progress} rounded-b-xl`}
                                        style={{
                                            animation: `shrink ${notification.duration}ms linear`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </NotificationContext.Provider>
    );
};