export type Page = "login" | "register" | "notes" | "detail" | "create" | "public";
export type AlertSource = "auto" | "bell" | "list";
export type IconName =
  | "plus" | "search" | "pin" | "share" | "bell" | "edit" | "trash" | "back"
  | "check" | "link" | "logout" | "eye" | "cloud" | "todo" | "calendar"
  | "flag" | "x" | "clock" | "alert" | "mail" | "device";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  shared: boolean;
  todos: Todo[];
  updatedAt: string;
  token: string;
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
  notifyEmail: boolean;
  notifyPush: boolean;
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

export interface SignUpData{
    name: string;
    email: string;
    password: string;
};

export interface LoginData {
    email: string;
    password: string;
};
