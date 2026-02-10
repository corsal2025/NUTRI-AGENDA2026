'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: Date;
    read: boolean;
    type: 'info' | 'success' | 'warning';
}

export function NotificationPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Bienvenido',
            message: 'Bienvenido a tu panel de salud NutriAgenda.',
            time: new Date(),
            read: false,
            type: 'success'
        }
    ]);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-fuchsia-600 transition-colors focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 transform transition-all">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-fuchsia-50/50">
                        <h3 className="font-bold text-gray-800 text-sm">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium flex items-center gap-1"
                            >
                                <Check size={12} /> Marcar todo leído
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-fuchsia-50/30' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400">
                                            {format(notification.time, 'HH:mm', { locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No tienes notificaciones</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
