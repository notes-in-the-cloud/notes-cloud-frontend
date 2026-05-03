import type { Reminder, Priority } from '../../types';
import { PRIORITY_META, type ReminderFormData } from './Types';
import { combineDateTime, toDateStr, toTimeStr } from './Helper';
import { Icon } from './Icons';

interface Props {
  existing: Reminder | null;
  submitting: boolean;
  formError: string;
  form: ReminderFormData;
  setForm: React.Dispatch<React.SetStateAction<ReminderFormData>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onDelete?: () => void;
}

export default function ReminderEditorModal({
  existing, submitting, formError, form, setForm, onSubmit, onClose, onDelete,
}: Props) {
  function setField<K extends keyof ReminderFormData>(key: K, value: ReminderFormData[K]) {
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
              { key: 'notifyInApp' as const, label: 'In app', icon: Icon.device },
              { key: 'notifyEmail' as const, label: 'Email',  icon: Icon.mail   },
              { key: 'notifyPush'  as const, label: 'Push',   icon: Icon.bellSmall },
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