import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { Notification, NotificationPayload } from '../types';
import * as api from '../api/notifications';
import { fetchReminderById, updateReminder } from '../api/reminders';

export type NotifTab = 'all' | 'unread';

export function useNotifications(userId: string | null, isOpen: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [tab, setTab] = useState<NotifTab>('all');

  const displayed = tab === 'all' ? allNotifications : unreadNotifications;
  const allCount = allNotifications.length;

  // On login: fetch only the badge count
  useEffect(() => {
    if (!userId) return;
    api.fetchUnreadCount(userId).then(setUnreadCount).catch(console.error);
  }, [userId]);

  // When panel opens or tab changes: fetch the right list
  useEffect(() => {
    if (!userId || !isOpen) return;
    if (tab === 'all') {
      api.fetchNotifications(userId).then(setAllNotifications).catch(console.error);
    } else {
      api.fetchUnreadNotifications(userId).then(setUnreadNotifications).catch(console.error);
    }
  }, [userId, isOpen, tab]);

  // WebSocket — always active while logged in
  useEffect(() => {
    if (!userId) return;
    const client = new Client({
      brokerURL: 'ws://localhost:8084/ws',
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          const payload: NotificationPayload = JSON.parse(message.body);
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
        });
      },
      onStompError: frame => console.error('STOMP error', frame),
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    const updated = await api.markAsRead(userId, id);
    setAllNotifications(prev => {
      const wasUnread = prev.find(n => n.id === id)?.read === false;
      if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
      return prev.map(n => n.id === id ? updated : n);
    });
    setUnreadNotifications(prev => prev.filter(n => n.id !== id));
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await api.markAllAsRead(userId);
    const now = new Date().toISOString();
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: now })));
    setUnreadNotifications([]);
    setUnreadCount(0);
  }, [userId]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const completeFromToast = useCallback(async (reminderId: string, toastId: string) => {
    if (!userId) return;
    try {
      const reminder = await fetchReminderById(reminderId);
      await updateReminder({ ...reminder, status: 'COMPLETED' });
    } catch (e) {
      console.error('Failed to complete reminder', e);
    } finally {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }
  }, [userId]);

  return { displayed, unreadCount, allCount, tab, setTab, toasts, dismissToast, completeFromToast, markAsRead, markAllAsRead };
}
