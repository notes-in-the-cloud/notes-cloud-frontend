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

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

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
  const [taskPriority, setTaskPriority] = useState<TodoPriority | ''>('');
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
      priority: taskPriority || null,
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
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value as TodoPriority | '')}
                >
                  <option value="">Default</option>
                  {PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
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