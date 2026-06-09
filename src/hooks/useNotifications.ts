import { useState, useEffect, useCallback, useRef } from 'react';
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
  const resolvedUserId = userId ?? getUserIdFromToken();

  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [tab, setTab] = useState<NotifTab>('all');
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const hasLoadedNotifications = useRef(false);

  const displayed = tab === 'all' ? allNotifications : unreadNotifications;
  const allCount = allNotifications.length;
  const latestNotification = unreadNotifications[0] ?? allNotifications[0] ?? null;

  const refreshNotifications = useCallback(async () => {
    if (!resolvedUserId) {
      return;
    }

    try {
      const notifications = await api.fetchNotifications();
      const sorted = sortNotifications(notifications);
      const unread = sorted.filter(n => !n.read);
      const newUnread = hasLoadedNotifications.current
        ? unread.filter(n => !knownNotificationIds.current.has(n.id))
        : [];

      setAllNotifications(sorted);
      setUnreadNotifications(unread);
      setUnreadCount(unread.length);

      if (newUnread.length > 0) {
        setToasts(prev => mergeNotifications(prev, newUnread));
      }

      knownNotificationIds.current = new Set(sorted.map(n => n.id));
      hasLoadedNotifications.current = true;
    } catch (error) {
      console.error('Failed to load notifications:', error);

      try {
        const count = await api.fetchUnreadCount();
        setUnreadCount(count);
      } catch (countError) {
        console.error('Failed to load unread notification count:', countError);
      }
    }
  }, [resolvedUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshNotifications]);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(() => {
        void refreshNotifications();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, refreshNotifications]);

  useEffect(() => {
    if (!resolvedUserId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 3000);

    function refreshWhenVisible() {
      if (!document.hidden) {
        void refreshNotifications();
      }
    }

    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshNotifications, resolvedUserId]);

  useEffect(() => {
    if (!resolvedUserId) {
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
            userId: resolvedUserId,
            reminderId: payload.reminderId,
            heading: payload.heading,
            message: payload.message,
            priority: payload.priority,
            read: false,
            readAt: null,
            firedAt: payload.firedAt,
          };

          knownNotificationIds.current.add(notif.id);
          hasLoadedNotifications.current = true;

          setAllNotifications(prev => upsertNotification(prev, notif));
          setUnreadNotifications(prev => {
            const next = upsertNotification(prev, notif).filter(n => !n.read);
            setUnreadCount(next.length);
            return next;
          });
          setToasts(prev => upsertNotification(prev, notif));

          window.setTimeout(() => {
            void refreshNotifications();
          }, 300);
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
  }, [refreshNotifications, resolvedUserId]);

  const markAsRead = useCallback(async (id: string) => {
    if (!resolvedUserId) {
      return;
    }

    const updated = await api.markAsRead(id);

    setAllNotifications(prev => prev.map(n => (n.id === id ? updated : n)));

    setUnreadNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      setUnreadCount(next.length);
      return next;
    });

    void refreshNotifications();
  }, [refreshNotifications, resolvedUserId]);

  const markAllAsRead = useCallback(async () => {
    if (!resolvedUserId) {
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
  }, [resolvedUserId]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const completeFromToast = useCallback(async (reminderId: string, toastId: string) => {
    if (!resolvedUserId) {
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
  }, [resolvedUserId]);

  return {
    displayed,
    unreadCount,
    allCount,
    latestNotification,
    tab,
    setTab,
    toasts,
    dismissToast,
    completeFromToast,
    markAsRead,
    markAllAsRead,
  };
}

function sortNotifications(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime()
  );
}

function upsertNotification(
  notifications: Notification[],
  notification: Notification,
): Notification[] {
  const withoutCurrent = notifications.filter(n => n.id !== notification.id);
  return sortNotifications([notification, ...withoutCurrent]);
}

function mergeNotifications(
  notifications: Notification[],
  incoming: Notification[],
): Notification[] {
  return incoming.reduce(
    (next, notification) => upsertNotification(next, notification),
    notifications,
  );
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

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as {
      userId?: string;
      sub?: string;
    };

    return payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}
