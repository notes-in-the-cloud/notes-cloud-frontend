import { useEffect, useState } from 'react';
import type { Reminder, Priority } from '../types';
import { fetchReminders, createReminder } from '../api/reminders';
import './Reminders.css';

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

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

export default function RemindersPanel({ onClose }: { onClose: () => void }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const created = await createReminder({ ...form, status: 'PENDING' });
      setReminders(prev => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError('Failed to create reminder.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <aside className="side-panel">
        <div className="panel-header">
          <div className="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Reminders</span>
          </div>
          <button className="panel-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {showForm ? (
          <form className="reminder-form" onSubmit={handleSubmit}>
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
                placeholder="Optional details"
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
                In-app
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
              <button type="button" className="reminder-form-btn reminder-form-btn--cancel" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}>
                Cancel
              </button>
              <button type="submit" className="reminder-form-btn reminder-form-btn--submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Add'}
              </button>
            </div>
          </form>
        ) : (
          <div className="panel-add-row">
            <button className="reminder-add-btn" onClick={() => setShowForm(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Reminder
            </button>
          </div>
        )}

        <div className="panel-content">
          {loading && <p className="panel-empty">Loading...</p>}
          {error && <p className="panel-empty panel-empty--error">{error}</p>}
          {!loading && !error && reminders.length === 0 && (
            <p className="panel-empty">No reminders yet.</p>
          )}
          {reminders.map(r => (
            <div key={r.id} className={`reminder-item${r.status === 'COMPLETED' ? ' reminder-item--done' : ''}`}>
              <div className="reminder-item-priority">{PRIORITY_LABEL[r.priority] ?? r.priority}</div>
              <div className="reminder-item-title">{r.heading}</div>
              <div className="reminder-item-time">{r.reminderDate} · {r.reminderTime.slice(0, 5)}</div>
              {r.description && <div className="reminder-item-desc">{r.description}</div>}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
