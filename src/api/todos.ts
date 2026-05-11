import type {
  CreateTodoListData,
  CreateTodoTaskData,
  TodoListWithTasks,
  TodoTask,
  UpdateTodoListData,
  UpdateTodoTaskData,
} from '../types';
import { API_BASE_URL, parseApiResponse, fetchWithAuth } from './config';

export async function fetchStandaloneTasks(): Promise<TodoTask[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todos`, {
    method: 'GET',
  });

  return parseApiResponse<TodoTask[]>(res);
}

export async function fetchTodoTask(taskId: string): Promise<TodoTask> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'GET',
  });

  return parseApiResponse<TodoTask>(res);
}

export async function createTodoTask(data: CreateTodoTaskData): Promise<TodoTask> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoTask>(res);
}

export async function updateTodoTask(
  taskId: string,
  data: UpdateTodoTaskData
): Promise<TodoTask> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoTask>(res);
}

export async function deleteTodoTask(taskId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todos/${taskId}`, {
    method: 'DELETE',
  });

  return parseApiResponse<void>(res);
}

export async function fetchTodoListsWithTasks(): Promise<TodoListWithTasks[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todo-lists`, {
    method: 'GET',
  });

  return parseApiResponse<TodoListWithTasks[]>(res);
}

export async function fetchTodoList(listId: string): Promise<TodoListWithTasks> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'GET',
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function createTodoList(data: CreateTodoListData): Promise<TodoListWithTasks> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todo-lists`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function updateTodoList(
  listId: string,
  data: UpdateTodoListData
): Promise<TodoListWithTasks> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return parseApiResponse<TodoListWithTasks>(res);
}

export async function deleteTodoList(listId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'DELETE',
  });

  return parseApiResponse<void>(res);
}
