import type { FilterTab } from './Types';
import { Icon } from './Icons';

interface Props {
  activeTab: FilterTab;
  onCreate: () => void;
}

export default function ReminderEmptyState({ activeTab, onCreate }: Props) {
  return (
    <div className="reminders-empty-state">
      <span className="reminders-empty-icon">{Icon.bell}</span>
      <p className="reminders-empty-title">
        {activeTab === 'completed' ? 'No completed reminders' : 'No reminders'}
      </p>
      <p className="reminders-empty-sub">
        {activeTab === 'completed'
          ? 'Completed reminders will appear here'
          : 'Create a new reminder to get started'}
      </p>
      {activeTab !== 'completed' && (
        <button className="reminders-new-btn reminders-empty-btn" onClick={onCreate}>
          {Icon.plus}
          New reminder
        </button>
      )}
    </div>
  );
}