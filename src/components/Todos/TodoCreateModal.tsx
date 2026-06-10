import { useState } from 'react';
import type { TodoListWithTasks, TodoPriority } from '../../types';

type CreateMode = 'task' | 'list';

interface CreateTaskData {
  title: string;
  priority: TodoPriority | null;
  dueDate: string | null;
  listId: string | null;
}

interface Props {
  mode: CreateMode;
  lists: TodoListWithTasks[];
  savingTask: boolean;
  savingList: boolean;
  onClose: () => void;
  onModeChange: (mode: CreateMode) => void;
  onCreateTask: (data: CreateTaskData) => void;
  onCreateList: (title: string) => void;
}

const PRIORITIES: TodoPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const FlagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21V5" />
    <path d="M4 5c3-2 5 2 8 0s5 2 8 0v10c-3 2-5-2-8 0s-5-2-8 0" />
  </svg>
);

export default function TodoCreateModal({
  mode,
  lists,
  savingTask,
  savingList,
  onClose,
  onModeChange,
  onCreateTask,
  onCreateList,
}: Props) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<TodoPriority>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [listTitle, setListTitle] = useState('');

  function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = taskTitle.trim();

    if (!title) {
      return;
    }

    onCreateTask({
      title,
      listId: selectedListId || null,
      priority: taskPriority,
      dueDate: taskDueDate ? `${taskDueDate}T23:59:00` : null,
    });
  }

  function handleCreateList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = listTitle.trim();

    if (!title) {
      return;
    }

    onCreateList(title);
  }

  return (
    <div className="todos-modal-backdrop" onClick={onClose}>
      <section className="todos-modal" onClick={e => e.stopPropagation()}>
        <div className="todos-modal-header">
          <div>
            <h2>{mode === 'task' ? 'Create todo task' : 'Create todo list'}</h2>
            <p>
              {mode === 'task'
                ? 'Add a task as standalone or attach it to a list.'
                : 'Create a list to group related tasks.'}
            </p>
          </div>

          <button className="todos-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="todos-modal-switch">
          <button
            className={mode === 'task' ? 'todos-modal-switch-btn active' : 'todos-modal-switch-btn'}
            onClick={() => onModeChange('task')}
            type="button"
          >
            Task
          </button>

          <button
            className={mode === 'list' ? 'todos-modal-switch-btn active' : 'todos-modal-switch-btn'}
            onClick={() => onModeChange('list')}
            type="button"
          >
            List
          </button>
        </div>

        {mode === 'task' ? (
          <form className="todos-modal-form" onSubmit={handleCreateTask}>
            <div className="todos-field">
              <label>Task title</label>
              <input
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="What do you need to do?"
                autoFocus
              />
            </div>

            <div className="todos-modal-grid">
              <div className="todos-field">
                <label>Priority</label>
                <div className="todo-priority-picker" role="group" aria-label="Task priority">
                  {PRIORITIES.map(priority => (
                    <button
                      key={priority}
                      type="button"
                      className={`todo-priority-pill todo-priority--${priority.toLowerCase()}${taskPriority === priority ? ' todo-priority-pill--active' : ''}`}
                      onClick={() => setTaskPriority(priority)}
                    >
                      <FlagIcon />
                      {PRIORITY_LABELS[priority]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="todos-field">
                <label>Due date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            {lists.length > 0 && (
              <div className="todos-field">
                <label>List</label>
                <select
                  value={selectedListId}
                  onChange={e => setSelectedListId(e.target.value)}
                >
                  <option value="">Standalone task</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {lists.length === 0 && (
              <p className="todos-modal-hint">
                No lists yet. This task will be created as standalone.
              </p>
            )}

            <div className="todos-modal-footer">
              <button type="button" className="todos-secondary-btn" onClick={onClose}>
                Cancel
              </button>

              <button type="submit" className="todos-primary-btn" disabled={savingTask}>
                {savingTask ? 'Creating...' : 'Create task'}
              </button>
            </div>
          </form>
        ) : (
          <form className="todos-modal-form" onSubmit={handleCreateList}>
            <div className="todos-field">
              <label>List title</label>
              <input
                value={listTitle}
                onChange={e => setListTitle(e.target.value)}
                placeholder="Example: University, Work, Project..."
                autoFocus
              />
            </div>

            <div className="todos-modal-footer">
              <button type="button" className="todos-secondary-btn" onClick={onClose}>
                Cancel
              </button>

              <button type="submit" className="todos-primary-btn" disabled={savingList}>
                {savingList ? 'Creating...' : 'Create list'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
