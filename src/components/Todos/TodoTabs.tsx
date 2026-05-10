type TodoTab = 'tasks' | 'lists';

interface Props {
  activeTab: TodoTab;
  standaloneCount: number;
  listsCount: number;
  onChange: (tab: TodoTab) => void;
}

export default function TodoTabs({
  activeTab,
  standaloneCount,
  listsCount,
  onChange,
}: Props) {
  return (
    <div className="todos-tabs">
      <button
        className={`todos-tab ${activeTab === 'tasks' ? 'todos-tab--active' : ''}`}
        onClick={() => onChange('tasks')}
      >
        Standalone
        <span>{standaloneCount}</span>
      </button>

      <button
        className={`todos-tab ${activeTab === 'lists' ? 'todos-tab--active' : ''}`}
        onClick={() => onChange('lists')}
      >
        Lists
        <span>{listsCount}</span>
      </button>
    </div>
  );
}