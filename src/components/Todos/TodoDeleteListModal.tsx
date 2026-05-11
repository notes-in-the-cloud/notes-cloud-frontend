import type { TodoListWithTasks } from '../../types';

interface Props {
  list: TodoListWithTasks;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function TodoDeleteListModal({
  list,
  deleting,
  onCancel,
  onConfirm,
}: Props) {
  const taskCount = list.tasks?.length ?? 0;

  return (
    <div className="todos-modal-backdrop" onClick={onCancel}>
      <section className="todos-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="todos-confirm-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="todos-confirm-content">
          <h2>Delete list?</h2>

          <p>
            You are about to delete <strong>{list.title}</strong>.
          </p>

          {taskCount > 0 ? (
            <p className="todos-confirm-note">
              The {taskCount === 1 ? 'task' : `${taskCount} tasks`} inside this list will become standalone tasks.
            </p>
          ) : (
            <p className="todos-confirm-note">
              This list has no active tasks inside it.
            </p>
          )}
        </div>

        <div className="todos-confirm-footer">
          <button
            type="button"
            className="todos-secondary-btn"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="todos-danger-btn"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete list'}
          </button>
        </div>
      </section>
    </div>
  );
}