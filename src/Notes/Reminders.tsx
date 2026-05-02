import { useEffect, useState } from 'react';
import type { Reminder, Priority } from '../types';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../api/reminders';
import './Reminders.css';

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

type FilterTab = 'all' | 'upcoming' | 'completed';

const EMPTY_FORM = {
  heading: '',
  description: '',
  reminderDate: '',
  reminderTime: '',
  priority: 'MEDIUM' as Priority,
  notifyInApp: true,
  notifyEmail: false,
  notifyPush: false,
};

export default function RemindersPage({ onBack }: { onBack: () => void }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReminders()
      .then(setReminders)
      .catch(() => setError('Could not load reminders.'))
      .finally(() => setLoading(false));
  }, []);

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function openEdit(r: Reminder) {
    setEditingId(r.id);
    setForm({
      heading: r.heading,
      description: r.description,
      reminderDate: r.reminderDate,
      reminderTime: r.reminderTime,
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
    } catch {
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
    } catch {
      // silently fail — status stays unchanged
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch {
      // silently fail — item stays in list
    } finally {
      setDeletingId(null);
    }
  }

  const now = new Date();
  const active = reminders.filter(r => r.status !== 'COMPLETED');
  const overdue = reminders.filter(r =>
    r.status !== 'COMPLETED' && new Date(`${r.reminderDate}T${r.reminderTime}`) < now
  );
  const upcoming = reminders.filter(r =>
    r.status !== 'COMPLETED' && new Date(`${r.reminderDate}T${r.reminderTime}`) >= now
  );
  const completed = reminders.filter(r => r.status === 'COMPLETED');

  const filtered =
    activeTab === 'all' ? reminders :
    activeTab === 'upcoming' ? upcoming :
    completed;

  const tabs: [FilterTab, string, number][] = [
    ['all', 'All', reminders.length],
    ['upcoming', 'Upcoming', upcoming.length],
    ['completed', 'Completed', completed.length],
  ];

  return (
    <div className="reminders-page">
      <div className="reminders-page-top">
        <div className="reminders-page-heading">
          <button className="reminders-back-btn" onClick={onBack} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="reminders-page-title">Reminders</h1>
        </div>
        <button className="reminders-new-btn" onClick={() => { setEditingId(null); setShowForm(true); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New reminder
        </button>
      </div>

      <p className="reminders-page-subtitle">
        {active.length} active reminders
        {overdue.length > 0 && (
          <span className="reminders-overdue-count"> · {overdue.length} postponed</span>
        )}
      </p>

      <div className="reminders-tabs">
        {tabs.map(([tab, label, count]) => (
          <button
            key={tab}
            className={`reminders-tab${activeTab === tab ? ' reminders-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="reminder-form reminder-form--page" onSubmit={handleSubmit}>
          <div className="reminder-form-group">
            <label className="reminder-form-label">Title</label>
            <input
              className="reminder-form-input"
              name="heading"
              value={form.heading}
              onChange={handleField}
              placeholder="Reminder title"
              required
            />
          </div>
          <div className="reminder-form-group">
            <label className="reminder-form-label">Description</label>
            <textarea
              className="reminder-form-input reminder-form-textarea"
              name="description"
              value={form.description}
              onChange={handleField}
              placeholder="Details"
              rows={2}
            />
          </div>
          <div className="reminder-form-row">
            <div className="reminder-form-group">
              <label className="reminder-form-label">Date</label>
              <input
                className="reminder-form-input"
                type="date"
                name="reminderDate"
                value={form.reminderDate}
                onChange={handleField}
                required
              />
            </div>
            <div className="reminder-form-group">
              <label className="reminder-form-label">Time</label>
              <input
                className="reminder-form-input"
                type="time"
                name="reminderTime"
                value={form.reminderTime}
                onChange={handleField}
                required
              />
            </div>
          </div>
          <div className="reminder-form-group">
            <label className="reminder-form-label">Priority</label>
            <select className="reminder-form-input reminder-form-select" name="priority" value={form.priority} onChange={handleField}>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="reminder-form-checks">
            <label className="reminder-form-check">
              <input type="checkbox" name="notifyInApp" checked={form.notifyInApp} onChange={handleField} />
              In app
            </label>
            <label className="reminder-form-check">
              <input type="checkbox" name="notifyEmail" checked={form.notifyEmail} onChange={handleField} />
              Email
            </label>
            <label className="reminder-form-check">
              <input type="checkbox" name="notifyPush" checked={form.notifyPush} onChange={handleField} />
              Push
            </label>
          </div>
          {formError && <p className="reminder-form-error">{formError}</p>}
          <div className="reminder-form-actions">
            <button type="button" className="reminder-form-btn reminder-form-btn--cancel" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="reminder-form-btn reminder-form-btn--submit" disabled={submitting}>
              {submitting ? (editingId ? 'Saving…' : 'Adding…') : (editingId ? 'Save' : 'Add')}
            </button>
          </div>
        </form>
      )}

      <div className="reminders-list">
        {loading && <p className="panel-empty">Loading...</p>}
        {error && <p className="panel-empty panel-empty--error">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="panel-empty">No reminders.</p>
        )}
        {filtered.map(r => (
          <div key={r.id} className={`reminder-item${r.status === 'COMPLETED' ? ' reminder-item--done' : ''}`}>
            <button
              className={`reminder-checkbox${r.status === 'COMPLETED' ? ' reminder-checkbox--checked' : ''}`}
              onClick={() => handleToggleComplete(r)}
              disabled={togglingId === r.id}
              aria-label={r.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
            >
              {r.status === 'COMPLETED' && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <div className="reminder-item-body">
              <div className="reminder-item-priority">{PRIORITY_LABEL[r.priority] ?? r.priority}</div>
              <div className="reminder-item-title">{r.heading}</div>
              <div className="reminder-item-time">{r.reminderDate} · {r.reminderTime.slice(0, 5)}</div>
              {r.description && <div className="reminder-item-desc">{r.description}</div>}
            </div>
            <div className="reminder-item-actions">
              <button
                className="reminder-item-btn"
                aria-label="Edit"
                onClick={() => openEdit(r)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className="reminder-item-btn reminder-item-btn--delete"
                aria-label="Delete"
                disabled={deletingId === r.id}
                onClick={() => handleDelete(r.id)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
