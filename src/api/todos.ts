import type {
  CreateTodoListData,
  CreateTodoTaskData,
  TodoListWithTasks,
  TodoTask,
  UpdateTodoListData,
  UpdateTodoTaskData,
} from '../types';
import { API_BASE_URL, authHeaders, parseApiResponse } from './config';

export async function fetchStandaloneTasks(): Promise<TodoTask[]> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<TodoTask[]>(res);
}

export async function fetchTodoTask(taskId: string): Promise<TodoTask> {
  const res = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<TodoTask>(res);
}

export async function createTodoTask(data: CreateTodoTaskData): Promise<TodoTask> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoTask>(res);
}

export async function updateTodoTask(
  taskId: string,
  data: UpdateTodoTaskData
): Promise<TodoTask> {
  const res = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoTask>(res);
}

export async function deleteTodoTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseApiResponse<void>(res);
}

export async function fetchTodoListsWithTasks(): Promise<TodoListWithTasks[]> {
  const res = await fetch(`${API_BASE_URL}/todo-lists`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<TodoListWithTasks[]>(res);
}

export async function fetchTodoList(listId: string): Promise<TodoListWithTasks> {
  const res = await fetch(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function createTodoList(data: CreateTodoListData): Promise<TodoListWithTasks> {
  const res = await fetch(`${API_BASE_URL}/todo-lists`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function updateTodoList(
  listId: string,
  data: UpdateTodoListData
): Promise<TodoListWithTasks> {
  const res = await fetch(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function deleteTodoList(listId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseApiResponse<void>(res);
}
