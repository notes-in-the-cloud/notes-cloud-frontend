import type { TodoTask } from '../../types';
import TodoTaskCard from './TodoTaskCard';

interface Props {
  tasks: TodoTask[];
  emptyText: string;
  onToggle: (task: TodoTask) => void;
  onEdit: (task: TodoTask) => void;
  onDelete: (task: TodoTask) => void;
}

export default function TodoTaskList({ tasks, emptyText, onToggle, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return <p className="todos-empty">{emptyText}</p>;
  }

  return (
    <div className="todos-task-list">
      {tasks.map(task => (
        <TodoTaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}