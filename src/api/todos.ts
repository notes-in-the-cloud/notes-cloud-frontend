import type {
  CreateTodoListData,
  CreateTodoTaskData,
  TodoListWithTasks,
  TodoTask,
  UpdateTodoListData,
  UpdateTodoTaskData,
} from '../types';
import { getCurrentUserId } from '../Auth/Session';

const BASE = import.meta.env.VITE_TODO_SERVICE_URL ?? 'http://localhost:8085';

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

function getUserId(): string {
  return getCurrentUserId() ?? '';
}

function requireUserId(): string {
  const userId = getUserId();

  if (!userId) {
    throw new Error('Missing current user id');
  }

  return userId;
}

// --- Todo tasks ---

export async function fetchStandaloneTasks(): Promise<TodoTask[]> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-tasks`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch todo tasks');
  }

  return res.json();
}

export async function fetchTodoTask(taskId: string): Promise<TodoTask> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-tasks/${taskId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch todo task');
  }

  return res.json();
}

export async function createTodoTask(data: CreateTodoTaskData): Promise<TodoTask> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create todo task');
  }

  return res.json();
}

export async function updateTodoTask(taskId: string, data: UpdateTodoTaskData): Promise<TodoTask> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-tasks/${taskId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update todo task');
  }

  return res.json();
}

export async function deleteTodoTask(taskId: string): Promise<void> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-tasks/${taskId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete todo task');
  }
}

// --- Todo lists ---

export async function fetchTodoListsWithTasks(): Promise<TodoListWithTasks[]> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-lists`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch todo lists');
  }

  return res.json();
}

export async function createTodoList(data: CreateTodoListData): Promise<TodoListWithTasks> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-lists`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create todo list');
  }

  return res.json();
}

export async function updateTodoList(listId: string, data: UpdateTodoListData): Promise<TodoListWithTasks> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-lists/${listId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update todo list');
  }

  return res.json();
}

export async function deleteTodoList(listId: string): Promise<void> {
  const userId = requireUserId();

  const res = await fetch(`${BASE}/api/v1/users/${userId}/todo-lists/${listId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete todo list');
  }
}