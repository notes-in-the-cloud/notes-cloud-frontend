import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationPayload } from '../types';
import * as api from '../api/notifications';
import { fetchReminderById, updateReminder } from '../api/reminders';
import { createReminderSocket } from '../api/ws';

export type NotifTab = 'all' | 'unread';

interface GatewaySocketMessage<T = unknown> {
  type: string;
  data: T;
}

export function useNotifications(userId: string | null, isOpen: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [tab, setTab] = useState<NotifTab>('all');

  const displayed = tab === 'all' ? allNotifications : unreadNotifications;
  const allCount = allNotifications.length;

  useEffect(() => {
    if (!userId) {
      return;
    }

    api.fetchUnreadCount()
      .then(setUnreadCount)
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!userId || !isOpen) {
      return;
    }

    if (tab === 'all') {
      api.fetchNotifications()
        .then(setAllNotifications)
        .catch(console.error);
    } else {
      api.fetchUnreadNotifications()
        .then(setUnreadNotifications)
        .catch(console.error);
    }
  }, [userId, isOpen, tab]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let socket: WebSocket | null = null;
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      try {
        socket = createReminderSocket();
      } catch (error) {
        console.error('Failed to create reminder websocket:', error);
        return;
      }

      socket.onopen = () => {
        console.log('Reminder websocket connected through gateway');
      };

      socket.onmessage = event => {
        try {
          const parsedMessage = JSON.parse(event.data) as
            | GatewaySocketMessage<NotificationPayload>
            | NotificationPayload;

          const payload = getNotificationPayload(parsedMessage);

          if (!payload) {
            return;
          }

          const notif: Notification = {
            id: payload.notificationId,
            userId,
            reminderId: payload.reminderId,
            heading: payload.heading,
            message: payload.message,
            priority: payload.priority,
            read: false,
            readAt: null,
            firedAt: payload.firedAt,
          };

          setUnreadCount(prev => prev + 1);
          setAllNotifications(prev => [notif, ...prev]);
          setUnreadNotifications(prev => [notif, ...prev]);
          setToasts(prev => [...prev, notif]);
        } catch (error) {
          console.error('Failed to parse reminder websocket message:', error);
        }
      };

      socket.onerror = error => {
        console.error('Reminder websocket error:', error);
      };

      socket.onclose = event => {
        console.log('Reminder websocket closed', event.code, event.reason);
      };
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);

      if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING)
      ) {
        socket.close();
      }
    };
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) {
      return;
    }

    const updated = await api.markAsRead(id);

    let wasUnread = false;

    setAllNotifications(prev => {
      wasUnread = prev.find(n => n.id === id)?.read === false;
      return prev.map(n => (n.id === id ? updated : n));
    });

    if (wasUnread) {
      setUnreadCount(c => Math.max(0, c - 1));
    }

    setUnreadNotifications(prev => prev.filter(n => n.id !== id));
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) {
      return;
    }

    await api.markAllAsRead();

    const now = new Date().toISOString();

    setAllNotifications(prev => prev.map(n => ({
      ...n,
      read: true,
      readAt: now,
    })));

    setUnreadNotifications([]);
    setUnreadCount(0);
  }, [userId]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const completeFromToast = useCallback(async (reminderId: string, toastId: string) => {
    if (!userId) {
      return;
    }

    try {
      const reminder = await fetchReminderById(reminderId);
      const updated = await updateReminder({
        ...reminder,
        status: 'COMPLETED',
      });

      window.dispatchEvent(new CustomEvent('reminder:updated', {
        detail: updated,
      }));
    } catch (error) {
      console.error('Failed to complete reminder', error);
    } finally {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }
  }, [userId]);

  return {
    displayed,
    unreadCount,
    allCount,
    tab,
    setTab,
    toasts,
    dismissToast,
    completeFromToast,
    markAsRead,
    markAllAsRead,
  };
}

function getNotificationPayload(
  message: GatewaySocketMessage<NotificationPayload> | NotificationPayload,
): NotificationPayload | null {
  if (isGatewaySocketMessage(message)) {
    if (
      message.type !== 'REMINDER_NOTIFICATION' &&
      message.type !== 'REMINDER_FIRED'
    ) {
      return null;
    }

    return message.data;
  }

  if (!message.notificationId) {
    return null;
  }

  return message;
}

function isGatewaySocketMessage(
  message: GatewaySocketMessage<NotificationPayload> | NotificationPayload,
): message is GatewaySocketMessage<NotificationPayload> {
  return 'data' in message;
}