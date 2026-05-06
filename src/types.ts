export type Page = 'login' | 'register' | 'notes';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
  createdAt: string;
}

export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ReminderStatus = 'PENDING' | 'FIRED' | 'COMPLETED';

export interface Reminder {
  id: string;
  userId: string;
  heading: string;
  description: string;
  reminderDate: string;
  reminderTime: string;
  priority: Priority;
  status: ReminderStatus;
  notifyInApp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  reminderId: string;
  heading: string;
  message: string;
  priority: Priority;
  read: boolean;
  readAt: string | null;
  firedAt: string;
}

export interface NotificationPayload {
  notificationId: string;
  reminderId: string;
  heading: string;
  message: string;
  priority: Priority;
  firedAt: string;
  type: string;
}