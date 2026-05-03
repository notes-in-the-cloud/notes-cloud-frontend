import { useEffect, useState } from 'react';
import type { Reminder, Priority } from '../types';
import { fetchReminders, fetchPendingReminders, fetchCompletedReminders, fetchReminderById, createReminder, updateReminder, deleteReminder } from '../api/reminders';
import './Reminders.css';

// ─────────────────────────────────────────────────────────────────
//   Constants
// ─────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  URGENT: { label: 'Urgent', cls: 'reminder-prio--urgent' },
  HIGH:   { label: 'High',   cls: 'reminder-prio--high'   },
  MEDIUM: { label: 'Medium', cls: 'reminder-prio--medium' },
  LOW:    { label: 'Low',    cls: 'reminder-prio--low'    },
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

// ─────────────────────────────────────────────────────────────────
//   Small inline icons
// ─────────────────────────────────────────────────────────────────

const Icon = {
  back: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  check: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  flag: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="22" x2="4" y2="15" /><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  device: (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  mail: (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  bellSmall: (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────
//   Helpers
// ─────────────────────────────────────────────────────────────────

function combineDateTime(date: string, time: string): Date {
  // reminderTime can be "HH:mm" or "HH:mm:ss"
  const t = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${t}`);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeStr(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTimeLabel(d: Date, now: Date): string {
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1);
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (d >= today && d < tomorrow) return `Today, ${time}`;
  if (d >= tomorrow && d < dayAfter) return `Tomorrow, ${time}`;
  return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function relativeLabel(d: Date, now: Date): string {
  const diff = d.getTime() - now.getTime();
  const absMs = Math.abs(diff);
  const mins = Math.round(absMs / 60000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  if (diff < 0) {
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  if (mins < 60) return `in ${mins} min`;
  if (hours < 24) return `in ${hours}h`;
  return `in ${days}d`;
}

// ─────────────────────────────────────────────────────────────────
//   Editor Modal
// ─────────────────────────────────────────────────────────────────

interface EditorProps {
  existing: Reminder | null;
  submitting: boolean;
  formError: string;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onDelete?: () => void;
}

function ReminderEditorModal({ existing, submitting, formError, form, setForm, onSubmit, onClose, onDelete }: EditorProps) {
  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function quickPick(opt: { hours?: number; days?: number; setHour?: number }) {
    const d = new Date();
    if (opt.hours) d.setHours(d.getHours() + opt.hours);
    if (opt.days) d.setDate(d.getDate() + opt.days);
    if (opt.setHour !== undefined) d.setHours(opt.setHour, 0, 0, 0);
    setForm(prev => ({ ...prev, reminderDate: toDateStr(d), reminderTime: toTimeStr(d) }));
  }

  const previewDate = form.reminderDate && form.reminderTime
    ? combineDateTime(form.reminderDate, form.reminderTime)
    : null;
  const previewLabel = previewDate
    ? previewDate.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : 'Pick a date and time';

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="reminder-modal-header">
            <div className="reminder-modal-header-title">
              <span className="reminder-modal-header-icon">{Icon.bell}</span>
              <h3>{existing ? 'Edit reminder' : 'New reminder'}</h3>
            </div>
            <button type="button" className="reminder-modal-close" onClick={onClose} aria-label="Close">
              {Icon.x}
            </button>
          </div>
          <p className="reminder-modal-subtitle">
            {existing ? 'Change the details' : 'What do you want to remember?'}
          </p>

          {formError && <div className="reminder-modal-error">{formError}</div>}

          <label className="reminder-form-label">Title</label>
          <input
            className="reminder-form-input"
            value={form.heading}
            onChange={e => setField('heading', e.target.value)}
            placeholder="Reminder title"
            autoFocus
            required
          />

          <label className="reminder-form-label" style={{ marginTop: '0.85rem' }}>Description (optional)</label>
          <textarea
            className="reminder-form-input reminder-form-textarea"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="Details..."
            rows={2}
          />

          <p className="reminder-form-section-label">Quick pick</p>
          <div className="reminder-form-quick">
            <button type="button" className="reminder-form-quick-btn" onClick={() => quickPick({ hours: 1 })}>In 1 hour</button>
            <button type="button" className="reminder-form-quick-btn" onClick={() => quickPick({ setHour: 19 })}>Tonight 19:00</button>
            <button type="button" className="reminder-form-quick-btn" onClick={() => quickPick({ days: 1, setHour: 9 })}>Tomorrow 9:00</button>
            <button type="button" className="reminder-form-quick-btn" onClick={() => quickPick({ days: 7 })}>In a week</button>
          </div>

          <div className="reminder-form-row">
            <div>
              <label className="reminder-form-label">Date</label>
              <input
                className="reminder-form-input"
                type="date"
                value={form.reminderDate}
                onChange={e => setField('reminderDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="reminder-form-label">Time</label>
              <input
                className="reminder-form-input"
                type="time"
                value={form.reminderTime}
                onChange={e => setField('reminderTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="reminder-form-preview">
            <span className="reminder-form-preview-icon">{Icon.clock}</span>
            <span>{previewLabel}</span>
          </div>

          <p className="reminder-form-section-label">Priority</p>
          <div className="reminder-form-pills">
            {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => (
              <button
                key={p}
                type="button"
                className={`reminder-form-pill ${PRIORITY_META[p].cls}${form.priority === p ? ' reminder-form-pill--active' : ''}`}
                onClick={() => setField('priority', p)}
              >
                <span className="reminder-form-pill-flag">{Icon.flag}</span>
                {PRIORITY_META[p].label}
              </button>
            ))}
          </div>

          <p className="reminder-form-section-label">Notification channels</p>
          <div className="reminder-form-channels">
            {([
              { key: 'notifyInApp' as const, label: 'In app',    icon: Icon.device },
              { key: 'notifyEmail' as const, label: 'Email',     icon: Icon.mail   },
              { key: 'notifyPush'  as const, label: 'Push',      icon: Icon.bellSmall },
            ]).map(c => (
              <button
                key={c.key}
                type="button"
                className="reminder-form-channel"
                onClick={() => setField(c.key, !form[c.key])}
              >
                <span className="reminder-form-channel-icon">{c.icon}</span>
                <span className="reminder-form-channel-label">{c.label}</span>
                <span className={`reminder-form-toggle${form[c.key] ? ' reminder-form-toggle--on' : ''}`}>
                  <span className="reminder-form-toggle-dot" />
                </span>
              </button>
            ))}
          </div>

          <div className="reminder-modal-actions">
            {existing && onDelete && (
              <button type="button" className="reminder-form-btn reminder-form-btn--delete" onClick={onDelete}>
                Delete
              </button>
            )}
            <button type="button" className="reminder-form-btn reminder-form-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="reminder-form-btn reminder-form-btn--submit" disabled={submitting}>
              {submitting ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//   Main page
// ─────────────────────────────────────────────────────────────────

export default function RemindersPage({ onBack, openReminderId }: { onBack: () => void; openReminderId?: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Re-render every minute so relative times stay fresh
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetcher =
      activeTab === 'completed' ? fetchCompletedReminders :
      activeTab === 'upcoming'  ? fetchPendingReminders   :
      fetchReminders;
    fetcher()
      .then(setReminders)
      .catch(() => setError('Could not load reminders.'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (!openReminderId) return;
    fetchReminderById(openReminderId).then(r => {
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
    }).catch(console.error);
  }, [openReminderId]);

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
      // silently fail
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
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Derived data ───
  type EnrichedReminder = Reminder & { _date: Date };
  const enriched: EnrichedReminder[] = reminders.map(r => ({ ...r, _date: combineDateTime(r.reminderDate, r.reminderTime) }));

  const active = enriched.filter(r => r.status !== 'COMPLETED').sort((a, b) => a._date.getTime() - b._date.getTime());
  const completed = enriched.filter(r => r.status === 'COMPLETED').sort((a, b) => b._date.getTime() - a._date.getTime());
  const overdue = active.filter(r => r._date < now);
  const upcoming = active.filter(r => r._date >= now);

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(tomorrowStart); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);

  const groups = {
    overdue,
    today:    active.filter(r => r._date >= now            && r._date < tomorrowStart),
    tomorrow: active.filter(r => r._date >= tomorrowStart  && r._date < tomorrowEnd),
    week:     active.filter(r => r._date >= tomorrowEnd    && r._date < weekEnd),
    later:    active.filter(r => r._date >= weekEnd),
  };

  const filtered =
    activeTab === 'all'        ? enriched  :
    activeTab === 'upcoming'   ? upcoming  :
    completed;

  const tabs: [FilterTab, string, number][] = [
    ['all',       'All',       enriched.length],
    ['upcoming',  'Upcoming',  upcoming.length],
    ['completed', 'Completed', completed.length],
  ];

  // ─── Card renderer ───
  function renderCard(r: EnrichedReminder) {
    const isOverdue = r.status !== 'COMPLETED' && r._date < now;
    const isCompleted = r.status === 'COMPLETED';
    const accentClass = isCompleted ? 'reminder-card--completed' : isOverdue ? 'reminder-card--overdue' : '';

    return (
      <div
        key={r.id}
        className={`reminder-card ${accentClass}`}
        onClick={() => !isCompleted && openEdit(r)}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !isCompleted) {
            e.preventDefault();
            openEdit(r);
          }
        }}
      >
        <button
          className={`reminder-checkbox${isCompleted ? ' reminder-checkbox--checked' : ''}`}
          onClick={e => { e.stopPropagation(); handleToggleComplete(r); }}
          disabled={togglingId === r.id}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && Icon.check}
        </button>

        <div className={`reminder-card-icon ${isCompleted ? 'reminder-card-icon--completed' : isOverdue ? 'reminder-card-icon--overdue' : ''}`}>
          {isOverdue ? Icon.alert : Icon.bell}
        </div>

        <div className="reminder-card-body">
          <div className="reminder-card-meta">
            <span className={`reminder-card-time${isOverdue ? ' reminder-card-time--overdue' : ''}`}>
              {formatTimeLabel(r._date, now)}
            </span>
            {!isCompleted && (
              <span className="reminder-card-relative">· {relativeLabel(r._date, now)}</span>
            )}
            <span className={`reminder-prio-badge ${PRIORITY_META[r.priority].cls}`}>
              <span className="reminder-prio-flag">{Icon.flag}</span>
              {PRIORITY_META[r.priority].label}
            </span>
          </div>

          <h3 className="reminder-card-title">{r.heading}</h3>

          {r.description && (
            <p className="reminder-card-desc">{r.description}</p>
          )}

          <div className="reminder-card-channels">
            {r.notifyInApp && (
              <span className="reminder-card-channel">{Icon.device}<span>In app</span></span>
            )}
            {r.notifyEmail && (
              <span className="reminder-card-channel">{Icon.mail}<span>Email</span></span>
            )}
            {r.notifyPush && (
              <span className="reminder-card-channel">{Icon.bellSmall}<span>Push</span></span>
            )}
          </div>
        </div>

        <button
          className="reminder-card-delete"
          aria-label="Delete"
          disabled={deletingId === r.id}
          onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
        >
          {Icon.trash}
        </button>
      </div>
    );
  }

  function renderGroup(label: string, items: EnrichedReminder[], barClass: string) {
    if (items.length === 0) return null;
    return (
      <div className="reminder-group" key={label}>
        <div className="reminder-group-header">
          <span className={`reminder-group-bar ${barClass}`} />
          <h2 className="reminder-group-title">{label}</h2>
          <span className="reminder-group-count">{items.length}</span>
        </div>
        <div className="reminder-group-list">
          {items.map(renderCard)}
        </div>
      </div>
    );
  }

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

      {!loading && !error && filtered.length === 0 ? (
        <div className="reminders-empty-state">
          <span className="reminders-empty-icon">{Icon.bell}</span>
          <p className="reminders-empty-title">
            {activeTab === 'completed' ? 'No completed reminders' : 'No reminders'}
          </p>
          <p className="reminders-empty-sub">
            {activeTab === 'completed' ? 'Completed reminders will appear here' : 'Create a new reminder to get started'}
          </p>
          {activeTab !== 'completed' && (
            <button className="reminders-new-btn reminders-empty-btn" onClick={openCreate}>
              {Icon.plus}
              New reminder
            </button>
          )}
        </div>
      ) : !loading && !error && activeTab === 'all' ? (
        <>
          {renderGroup('Overdue',     groups.overdue,  'reminder-group-bar--overdue')}
          {renderGroup('Today',       groups.today,    'reminder-group-bar--today')}
          {renderGroup('Tomorrow',    groups.tomorrow, 'reminder-group-bar--tomorrow')}
          {renderGroup('This week',   groups.week,     'reminder-group-bar--week')}
          {renderGroup('Later',       groups.later,    'reminder-group-bar--later')}
          {renderGroup('Completed',   completed,       'reminder-group-bar--completed')}
        </>
      ) : !loading && !error && (
        <div className="reminders-list">
          {filtered.map(renderCard)}
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