import type { Reminder, Priority } from '../../types';

export type FilterTab = 'all' | 'upcoming' | 'completed';

export type EnrichedReminder = Reminder & { _date: Date };

export interface ReminderFormData {
  heading: string;
  description: string;
  reminderDate: string;
  reminderTime: string;
  priority: Priority;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
}

export const EMPTY_FORM: ReminderFormData = {
  heading: '',
  description: '',
  reminderDate: '',
  reminderTime: '',
  priority: 'MEDIUM',
  notifyInApp: true,
  notifyEmail: false,
  notifyPush: false,
};

export const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  URGENT: { label: 'Urgent', cls: 'reminder-prio--urgent' },
  HIGH:   { label: 'High',   cls: 'reminder-prio--high'   },
  MEDIUM: { label: 'Medium', cls: 'reminder-prio--medium' },
  LOW:    { label: 'Low',    cls: 'reminder-prio--low'    },
};