import type { TodoTask } from '../../types';
import TrashIcon from './TrashIcon';

interface Props {
  task: TodoTask;
  onToggle: (task: TodoTask) => void;
  onEdit: (task: TodoTask) => void;
  onDelete: (task: TodoTask) => void;
}

export default function TodoTaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  return (
    <article className={`todo-task-card ${task.done ? 'todo-task-card--done' : ''}`}>
      <button
        type="button"
        className={`todo-task-check ${task.done ? 'todo-task-check--checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
      >
        {task.done && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="todo-task-content">
        <h3>{task.title}</h3>

        <div className="todo-task-meta">
          <span className={`todo-priority todo-priority--${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>

          {task.dueDate && (
            <span>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="todos-card-actions">
        <button
          type="button"
          className="todos-icon-btn"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <EditIcon />
        </button>

        <button
          type="button"
          className="todos-icon-btn todos-icon-btn--danger"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}