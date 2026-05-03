import { useEffect, useRef, useState } from 'react';
import type { Reminder } from '../../types';
import {
  fetchReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../../api/reminders';

import {
  EMPTY_FORM,
  type FilterTab,
  type EnrichedReminder,
  type ReminderFormData,
} from './Types';
import { combineDateTime } from './Helper';
import { Icon } from './Icons';

import ReminderCard from './RemindersCard';
import ReminderGroup from './ReminderGroup';
import ReminderEditorModal from './RemindersEdit';
import ReminderEmptyState from './RemindersEmpty';

import './Reminders.css';

interface Props {
  onBack: () => void;
  openReminderId?: string;
}

export default function RemindersPage({ onBack, openReminderId }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReminderFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchReminders()
      .then(setReminders)
      .catch(err => {
        console.error('Failed to load reminders:', err);
        setError('Could not load reminders.');
      })
      .finally(() => setLoading(false));
  }, []);

  const openedIds = useRef(new Set<string>());
  useEffect(() => {
    if (!openReminderId || loading) return;
    if (openedIds.current.has(openReminderId)) return;
    const target = reminders.find(r => r.id === openReminderId);
    if (target) {
      openedIds.current.add(openReminderId);
      openEdit(target);
    }
  }, [openReminderId, loading, reminders]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(r: Reminder) {
    setEditingId(r.id);
    setForm({
      heading: r.heading,
      description: r.description,
      reminderDate: r.reminderDate,
      reminderTime: r.reminderTime.slice(0, 5),
      priority: r.priority,
      notifyInApp: r.notifyInApp,
      notifyEmail: r.notifyEmail,
      notifyPush: r.notifyPush,
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editingId) {
        const original = reminders.find(r => r.id === editingId)!;
        const updated = await updateReminder({ ...original, ...form });
        setReminders(prev => prev.map(r => r.id === editingId ? updated : r));
      } else {
        const created = await createReminder({ ...form, status: 'PENDING' });
        setReminders(prev => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      console.error('Failed to save reminder:', err);
      setFormError(editingId ? 'Failed to update reminder.' : 'Failed to create reminder.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleComplete(r: Reminder) {
    setTogglingId(r.id);
    try {
      const updated = await updateReminder({
        ...r,
        status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
      });
      setReminders(prev => prev.map(x => x.id === r.id ? updated : x));
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this reminder?')) return;
    setDeletingId(id);
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      if (editingId === id) closeForm();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const enriched: EnrichedReminder[] = reminders.map(r => ({
    ...r,
    _date: combineDateTime(r.reminderDate, r.reminderTime),
  }));

  const active = enriched
    .filter(r => r.status !== 'COMPLETED')
    .sort((a, b) => a._date.getTime() - b._date.getTime());

  const completed = enriched
    .filter(r => r.status === 'COMPLETED')
    .sort((a, b) => b._date.getTime() - a._date.getTime());

  const overdue  = active.filter(r => r._date <  now);
  const upcoming = active.filter(r => r._date >= now);

  const todayStart    = new Date(now);          todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);   tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd   = new Date(tomorrowStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const weekEnd       = new Date(todayStart);   weekEnd.setDate(weekEnd.getDate() + 7);

  const groups = {
    overdue,
    today:    active.filter(r => r._date >= now           && r._date < tomorrowStart),
    tomorrow: active.filter(r => r._date >= tomorrowStart && r._date < tomorrowEnd),
    week:     active.filter(r => r._date >= tomorrowEnd   && r._date < weekEnd),
    later:    active.filter(r => r._date >= weekEnd),
  };

  const filtered =
    activeTab === 'all'      ? active   :
    activeTab === 'upcoming' ? upcoming :
    completed;

  const tabs: [FilterTab, string, number][] = [
    ['all',       'All',       enriched.length],
    ['upcoming',  'Upcoming',  upcoming.length],
    ['completed', 'Completed', completed.length],
  ];

  const cardProps = {
    now,
    togglingId,
    deletingId,
    onOpenEdit: openEdit,
    onToggleComplete: handleToggleComplete,
    onDelete: handleDelete,
  };

  return (
    <div className="reminders-page">
      <div className="reminders-page-top">
        <div className="reminders-page-heading">
          <button className="reminders-back-btn" onClick={onBack} aria-label="Back">
            {Icon.back}
          </button>
          <h1 className="reminders-page-title">Reminders</h1>
        </div>
        <button className="reminders-new-btn" onClick={openCreate}>
          {Icon.plus}
          New reminder
        </button>
      </div>

      <p className="reminders-page-subtitle">
        {active.length} active reminders
        {overdue.length > 0 && (
          <span className="reminders-overdue-count"> · {overdue.length} overdue</span>
        )}
      </p>

      <div className="reminders-tabs">
        {tabs.map(([tab, label, count]) => (
          <button
            key={tab}
            className={`reminders-tab${activeTab === tab ? ' reminders-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {label}
            <span className="reminders-tab-count">{count}</span>
          </button>
        ))}
      </div>

      {loading && <p className="reminders-empty">Loading...</p>}
      {error && <p className="reminders-empty reminders-empty--error">{error}</p>}

      {!loading && !error && (activeTab === 'all' ? enriched.length === 0 : filtered.length === 0) ? (
        <ReminderEmptyState activeTab={activeTab} onCreate={openCreate} />
      ) : !loading && !error && activeTab === 'all' ? (
        <>
          <ReminderGroup label="Overdue"   items={groups.overdue}  barClass="reminder-group-bar--overdue"  {...cardProps} />
          <ReminderGroup label="Today"     items={groups.today}    barClass="reminder-group-bar--today"    {...cardProps} />
          <ReminderGroup label="Tomorrow"  items={groups.tomorrow} barClass="reminder-group-bar--tomorrow" {...cardProps} />
          <ReminderGroup label="This week" items={groups.week}     barClass="reminder-group-bar--week"     {...cardProps} />
          <ReminderGroup label="Later"     items={groups.later}    barClass="reminder-group-bar--later"    {...cardProps} />
          <ReminderGroup label="Completed" items={completed}       barClass="reminder-group-bar--completed" {...cardProps} />
        </>
      ) : !loading && !error && (
        <div className="reminders-list">
          {filtered.map(r => (
            <ReminderCard key={r.id} reminder={r} {...cardProps} />
          ))}
        </div>
      )}

      {showForm && (
        <ReminderEditorModal
          existing={editingId ? reminders.find(r => r.id === editingId) ?? null : null}
          submitting={submitting}
          formError={formError}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={closeForm}
          onDelete={editingId ? () => handleDelete(editingId) : undefined}
        />
      )}
    </div>
  );
}