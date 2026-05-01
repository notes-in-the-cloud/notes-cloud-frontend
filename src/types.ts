export type Page = "login" | "register" | "notes" | "detail" | "create" | "public" | "reminders";
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

export interface Reminder {
  id: number;
  title: string;
  description: string;
  datetime: string;
  recurring: "none" | "daily" | "weekly" | "monthly";
  channels: { app: boolean; email: boolean; push: boolean };
  completed: boolean;
  notified: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: "reminder" | "share" | "overdue" | "complete" | "view";
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  reminderId?: number;
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
