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

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TodoTask {
  id: string;
  listId: string | null;
  userId: string;
  title: string;
  done: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoListWithTasks {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tasks: TodoTask[];
}

export interface CreateTodoTaskData {
  listId?: string | null;
  title: string;
  priority?: TodoPriority | null;
  dueDate?: string | null;
}

export interface UpdateTodoTaskData {
  title?: string | null;
  priority?: TodoPriority | null;
  dueDate?: string | null;
  done?: boolean | null;
}

export interface CreateTodoListData {
  title: string;
}

export interface UpdateTodoListData {
  title: string;
}