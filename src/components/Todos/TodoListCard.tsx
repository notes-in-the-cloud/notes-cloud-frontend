import type { TodoListWithTasks, TodoTask } from '../../types';
import TodoTaskList from './TodoTaskList';
import TrashIcon from './TrashIcon';

interface Props {
  list: TodoListWithTasks;
  onEditList: (list: TodoListWithTasks) => void;
  onToggleTask: (task: TodoTask) => void;
  onEditTask: (task: TodoTask) => void;
  onDeleteTask: (task: TodoTask) => void;
  onDeleteList: (list: TodoListWithTasks) => void;
}

export default function TodoListCard({
  list,
  onEditList,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onDeleteList,
}: Props) {
  return (
    <section className="todos-list-card">
      <div className="todos-list-header">
        <div>
          <h2>{list.title}</h2>
          <p>{list.tasks.length} {list.tasks.length === 1 ? 'task' : 'tasks'}</p>
        </div>

        <div className="todos-card-actions">
          <button
            className="todos-icon-btn"
            onClick={() => onEditList(list)}
            aria-label="Edit list"
          >
            <EditIcon />
          </button>

          <button
            className="todos-icon-btn todos-icon-btn--danger"
            onClick={() => onDeleteList(list)}
            aria-label="Delete list"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <TodoTaskList
        tasks={list.tasks}
        emptyText="No tasks in this list."
        onToggle={onToggleTask}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
      />
    </section>
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