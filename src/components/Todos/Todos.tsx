import { useEffect, useMemo, useState } from 'react';
import type { TodoListWithTasks, TodoPriority, TodoTask } from '../../types';
import {
  createTodoList,
  createTodoTask,
  deleteTodoList,
  deleteTodoTask,
  fetchStandaloneTasks,
  fetchTodoListsWithTasks,
  updateTodoList,
  updateTodoTask,
} from '../../api/todos';

import TodoActionsCard from './TodoActionsCard';
import TodoCreateModal from './TodoCreateModal';
import TodoEditModal from './TodoEditModal';
import TodoTabs from './TodoTabs';
import TodoTaskList from './TodoTaskList';
import TodoListCard from './TodoListCard';
import TodoDeleteListModal from './TodoDeleteListModal';

import './Todos.css';
import './TodoLayout.css';
import './TodoActionsCard.css';
import './TodoForms.css';
import './TodoCreateModal.css';
import './TodoTabs.css';
import './TodoTasks.css';
import './TodoConfirmModal.css';

interface Props {
  onBack: () => void;
}

type TodoTab = 'tasks' | 'lists';
type CreateMode = 'task' | 'list';

type EditTarget =
  | { type: 'task'; task: TodoTask }
  | { type: 'list'; list: TodoListWithTasks };

interface UpdateTaskData {
  title: string | null;
  priority: TodoPriority | null;
  dueDate: string | null;
  done: boolean | null;
}

export default function TodosPage({ onBack }: Props) {
  const [standaloneTasks, setStandaloneTasks] = useState<TodoTask[]>([]);
  const [lists, setLists] = useState<TodoListWithTasks[]>([]);
  const [activeTab, setActiveTab] = useState<TodoTab>('tasks');

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('task');

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [listToDelete, setListToDelete] = useState<TodoListWithTasks | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingList, setSavingList] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    setLoading(true);
    setError('');

    try {
      const [tasksData, listsData] = await Promise.all([
        fetchStandaloneTasks(),
        fetchTodoListsWithTasks(),
      ]);

      setStandaloneTasks(tasksData);
      setLists(listsData);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Could not load todos. Make sure the todo service is running.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateTaskPanel() {
    setCreateMode('task');
    setShowCreatePanel(true);
    setError('');
  }

  function openCreateListPanel() {
    setCreateMode('list');
    setShowCreatePanel(true);
    setError('');
  }

  function closeCreatePanel() {
    setShowCreatePanel(false);
  }

  function openEditTask(task: TodoTask) {
    setEditTarget({ type: 'task', task });
    setError('');
  }

  function openEditList(list: TodoListWithTasks) {
    setEditTarget({ type: 'list', list });
    setError('');
  }

  function closeEditModal() {
    setEditTarget(null);
  }

  function openDeleteListModal(list: TodoListWithTasks) {
    setListToDelete(list);
    setError('');
  }

  function closeDeleteListModal() {
    if (deletingList) {
      return;
    }

    setListToDelete(null);
  }

  async function handleCreateTask(data: {
    title: string;
    priority: TodoPriority | null;
    dueDate: string | null;
    listId: string | null;
  }) {
    setSavingTask(true);
    setError('');

    try {
      const created = await createTodoTask(data);

      if (data.listId) {
        setLists(prev => prev.map(list =>
          list.id === data.listId
            ? { ...list, tasks: [created, ...list.tasks] }
            : list
        ));
        setActiveTab('lists');
      } else {
        setStandaloneTasks(prev => [created, ...prev]);
        setActiveTab('tasks');
      }

      closeCreatePanel();
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Could not create todo task.');
      closeCreatePanel();
    } finally {
      setSavingTask(false);
    }
  }

  async function handleCreateList(title: string) {
    setSavingList(true);
    setError('');

    try {
      await createTodoList({ title });

      const listsData = await fetchTodoListsWithTasks();
      setLists(listsData);
      setActiveTab('lists');

      closeCreatePanel();
    } catch (err) {
      console.error('Failed to create list:', err);
      setError('Could not create todo list.');
    } finally {
      setSavingList(false);
    }
  }

  async function handleUpdateTask(task: TodoTask, data: UpdateTaskData) {
    setSavingEdit(true);
    setError('');

    try {
      const updated = await updateTodoTask(task.id, data);

      if (updated.done) {
        removeTaskFromState(updated);
      } else {
        updateTaskInState(updated);
      }

      closeEditModal();
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Could not update todo task.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleUpdateList(list: TodoListWithTasks, title: string) {
    setSavingEdit(true);
    setError('');

    try {
      await updateTodoList(list.id, { title });

      setLists(prev => prev.map(current =>
        current.id === list.id
          ? { ...current, title }
          : current
      ));

      closeEditModal();
    } catch (err) {
      console.error('Failed to update list:', err);
      setError('Could not update todo list.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleTask(task: TodoTask) {
    setError('');

    try {
      await updateTodoTask(task.id, {
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        done: true,
      });

      removeTaskFromState(task);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Could not mark todo task as ready.');
    }
  }

  function removeTaskFromState(task: TodoTask) {
    setStandaloneTasks(prev =>
      prev.filter(currentTask => currentTask.id !== task.id)
    );

    setLists(prev =>
      prev.map(list => ({
        ...list,
        tasks: list.tasks.filter(currentTask => currentTask.id !== task.id),
      }))
    );
  }

  function updateTaskInState(updatedTask: TodoTask) {
    if (updatedTask.listId) {
      setLists(prev => prev.map(list => ({
        ...list,
        tasks: list.tasks.map(currentTask =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask
        ),
      })));

      return;
    }

    setStandaloneTasks(prev => prev.map(currentTask =>
      currentTask.id === updatedTask.id ? updatedTask : currentTask
    ));
  }

  async function handleDeleteTask(task: TodoTask) {
    try {
      await deleteTodoTask(task.id);
      removeTaskFromState(task);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Could not delete todo task.');
    }
  }

  async function handleDeleteList() {
    if (!listToDelete) {
      return;
    }

    setDeletingList(true);
    setError('');

    try {
      await deleteTodoList(listToDelete.id);
      await loadTodos();
      setListToDelete(null);
    } catch (err) {
      console.error('Failed to delete list:', err);
      setError('Could not delete todo list.');
    } finally {
      setDeletingList(false);
    }
  }

  const totalTasks = useMemo(() => {
    const listTasksCount = lists.reduce((sum, list) => sum + list.tasks.length, 0);
    return standaloneTasks.length + listTasksCount;
  }, [standaloneTasks.length, lists]);

  const completedTasks = useMemo(() => {
    const standaloneDone = standaloneTasks.filter(task => task.done).length;
    const listDone = lists.reduce(
      (sum, list) => sum + list.tasks.filter(task => task.done).length,
      0
    );

    return standaloneDone + listDone;
  }, [standaloneTasks, lists]);

  return (
    <main className="todos-page">
      <div className="todos-page-top">
        <div className="todos-heading-row">
          <button className="todos-back-btn" onClick={onBack} aria-label="Back to notes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div>
            <h1 className="todos-title">Todos</h1>
            <p className="todos-subtitle">
              {completedTasks}/{totalTasks} completed
            </p>
          </div>
        </div>
      </div>

      <TodoActionsCard
        onCreateList={openCreateListPanel}
        onCreateTask={openCreateTaskPanel}
      />

      {error && <div className="todos-error">{error}</div>}

      {showCreatePanel && (
        <TodoCreateModal
          mode={createMode}
          lists={lists}
          savingTask={savingTask}
          savingList={savingList}
          onClose={closeCreatePanel}
          onModeChange={setCreateMode}
          onCreateTask={handleCreateTask}
          onCreateList={handleCreateList}
        />
      )}

      {editTarget && (
        <TodoEditModal
          target={editTarget}
          saving={savingEdit}
          onClose={closeEditModal}
          onUpdateTask={handleUpdateTask}
          onUpdateList={handleUpdateList}
        />
      )}

      {listToDelete && (
        <TodoDeleteListModal
          list={listToDelete}
          deleting={deletingList}
          onCancel={closeDeleteListModal}
          onConfirm={handleDeleteList}
        />
      )}

      <TodoTabs
        activeTab={activeTab}
        standaloneCount={standaloneTasks.length}
        listsCount={lists.length}
        onChange={setActiveTab}
      />

      {loading ? (
        <p className="todos-empty">Loading todos...</p>
      ) : activeTab === 'tasks' ? (
        <TodoTaskList
          tasks={standaloneTasks}
          emptyText="No standalone tasks yet."
          onToggle={handleToggleTask}
          onEdit={openEditTask}
          onDelete={handleDeleteTask}
        />
      ) : (
        <div className="todos-lists">
          {lists.length === 0 ? (
            <p className="todos-empty">No todo lists yet.</p>
          ) : (
            lists.map(list => (
              <TodoListCard
                key={list.id}
                list={list}
                onEditList={openEditList}
                onToggleTask={handleToggleTask}
                onEditTask={openEditTask}
                onDeleteTask={handleDeleteTask}
                onDeleteList={openDeleteListModal}
              />
            ))
          )}
        </div>
      )}
    </main>
  );
}
