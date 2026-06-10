interface Props {
  onCreateTask: () => void;
  onCreateList: () => void;
}

export default function TodoActionsCard({ onCreateTask, onCreateList }: Props) {
  return (
    <section className="todos-actions-card">
      <div>
        <h2>Plan your work</h2>
        <p>Create standalone tasks or group them into todo lists.</p>
      </div>

      <div className="todos-actions">
        <button className="todos-secondary-btn" onClick={onCreateList}>
          New list
        </button>

        <button className="todos-primary-btn" onClick={onCreateTask}>
          Create task
        </button>
      </div>
    </section>
  );
}
