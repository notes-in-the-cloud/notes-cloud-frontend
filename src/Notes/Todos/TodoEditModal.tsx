import { useState } from 'react';
import type { TodoListWithTasks, TodoPriority, TodoTask } from '../../types';

type EditTarget =
  | { type: 'task'; task: TodoTask }
  | { type: 'list'; list: TodoListWithTasks };

interface UpdateTaskData {
  title: string | null;
  priority: TodoPriority | null;
  dueDate: string | null;
  done: boolean | null;
}

interface Props {
  target: EditTarget;
  saving: boolean;
  onClose: () => void;
  onUpdateTask: (task: TodoTask, data: UpdateTaskData) => void;
  onUpdateList: (list: TodoListWithTasks, title: string) => void;
}

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

function toDateInputValue(value: string | null): string {
  if (!value) {
    return '';
  }

  return value.split('T')[0];
}

export default function TodoEditModal({
  target,
  saving,
  onClose,
  onUpdateTask,
  onUpdateList,
}: Props) {
  const isTask = target.type === 'task';

  const [taskTitle, setTaskTitle] = useState(isTask ? target.task.title : '');
  const [taskPriority, setTaskPriority] = useState<TodoPriority>(
    isTask ? target.task.priority : 'MEDIUM'
  );
  const [taskDueDate, setTaskDueDate] = useState(
    isTask ? toDateInputValue(target.task.dueDate) : ''
  );

  const [listTitle, setListTitle] = useState(
    target.type === 'list' ? target.list.title : ''
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (target.type === 'task') {
      const title = taskTitle.trim();

      if (!title) {
        return;
      }

      onUpdateTask(target.task, {
        title,
        priority: taskPriority,
        dueDate: taskDueDate ? `${taskDueDate}T23:59:00` : null,
        done: target.task.done,
      });

      return;
    }

    const title = listTitle.trim();

    if (!title) {
      return;
    }

    onUpdateList(target.list, title);
  }

  return (
    <div className="todos-modal-backdrop" onClick={onClose}>
      <section className="todos-modal" onClick={e => e.stopPropagation()}>
        <div className="todos-modal-header">
          <div>
            <h2>{target.type === 'task' ? 'Edit todo task' : 'Edit todo list'}</h2>
            <p>
              {target.type === 'task'
                ? 'Update the task title, priority, or due date.'
                : 'Rename this todo list.'}
            </p>
          </div>

          <button className="todos-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="todos-modal-form" onSubmit={handleSubmit}>
          {target.type === 'task' ? (
            <>
              <div className="todos-field">
                <label>Task title</label>
                <input
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <div className="todos-modal-grid">
                <div className="todos-field">
                  <label>Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TodoPriority)}
                  >
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
            </>
          ) : (
            <div className="todos-field">
              <label>List title</label>
              <input
                value={listTitle}
                onChange={e => setListTitle(e.target.value)}
                placeholder="List title"
                autoFocus
              />
            </div>
          )}

          <div className="todos-modal-footer">
            <button type="button" className="todos-secondary-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="todos-primary-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}