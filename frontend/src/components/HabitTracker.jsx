import React, { useState } from 'react';
import { CalendarPlus, Edit3, Trash2, Check, X, RotateCcw } from 'lucide-react';

const todayISO = () => new Date().toISOString().split('T')[0];

const DEFAULT_FORM = {
  date: todayISO(),
  sleep_hours: 7.5,
  screen_time_hours: 4.5,
  physical_activity_minutes: 35,
  study_hours: 3.5,
  spending_food: 150,
  spending_entertainment: 60,
  spending_study: 0,
  spending_shopping: 0,
  spending_misc: 40,
  study_mode: 'regular',
  mental_mood: 'balanced',
  notes: '',
};

export default function HabitTracker({ logs, onSaveLog, onDeleteLog, onLoadSample, onClearAll }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await onSaveLog({
        ...form,
        sleep_hours: Number(form.sleep_hours),
        screen_time_hours: Number(form.screen_time_hours),
        physical_activity_minutes: Number(form.physical_activity_minutes),
        study_hours: Number(form.study_hours),
        spending_food: Number(form.spending_food),
        spending_entertainment: Number(form.spending_entertainment),
        spending_study: Number(form.spending_study),
        spending_shopping: Number(form.spending_shopping),
        spending_misc: Number(form.spending_misc),
        study_mode: form.study_mode || 'regular',
        mental_mood: form.mental_mood || 'balanced',
      });
      setFeedback(editingId ? 'Updated entry and refreshed your twin!' : 'Saved today’s check-in and updated your twin!');
      setEditingId(null);
      setForm({ ...DEFAULT_FORM, date: todayISO() });
    } catch (err) {
      setFeedback(err.message || 'Could not save entry. Please check your numbers.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setForm({
      date: log.date,
      sleep_hours: log.sleep_hours,
      screen_time_hours: log.screen_time_hours,
      physical_activity_minutes: log.physical_activity_minutes,
      study_hours: log.study_hours,
      spending_food: log.spending_food,
      spending_entertainment: log.spending_entertainment,
      spending_study: log.spending_study,
      spending_shopping: log.spending_shopping,
      spending_misc: log.spending_misc,
      study_mode: log.study_mode || 'regular',
      mental_mood: log.mental_mood || 'balanced',
      notes: log.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_FORM, date: todayISO() });
  };

  const dailySpendTotal =
    Number(form.spending_food || 0) +
    Number(form.spending_entertainment || 0) +
    Number(form.spending_study || 0) +
    Number(form.spending_shopping || 0) +
    Number(form.spending_misc || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Quick Daily Check-in Form */}
      <div className="lg:col-span-5 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Past Entry' : 'Quick Daily Check-In'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Takes 20 seconds • Keeps your twin accurate
              </p>
            </div>
          </div>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => handleField('date', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* Core 4 Habits Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Sleep (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                required
                value={form.sleep_hours}
                onChange={(e) => handleField('sleep_hours', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Total Screen (hrs, incl. study)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                required
                value={form.screen_time_hours}
                onChange={(e) => handleField('screen_time_hours', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                placeholder="Study + phone leisure"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Exercise (mins)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                max="720"
                required
                value={form.physical_activity_minutes}
                onChange={(e) => handleField('physical_activity_minutes', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Study Hours (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                required
                value={form.study_hours}
                onChange={(e) => handleField('study_hours', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Categorized Spending */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Today&apos;s Spending by Category (₹)
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Total: ₹{Math.round(dailySpendTotal).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { key: 'spending_food', label: 'Food' },
                { key: 'spending_entertainment', label: 'Fun / Media' },
                { key: 'spending_study', label: 'Books / Tools' },
                { key: 'spending_shopping', label: 'Shopping' },
                { key: 'spending_misc', label: 'Other' },
              ].map((cat) => (
                <div key={cat.key}>
                  <label className="block text-[11px] text-slate-500 mb-0.5">{cat.label}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form[cat.key]}
                    onChange={(e) => handleField(cat.key, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              How did the day feel? (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Great focus after morning run..."
              value={form.notes}
              onChange={(e) => handleField('notes', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {feedback && (
            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl">
              {feedback}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Daily Check-In'}
          </button>
        </form>
      </div>

      {/* Right: Past Entries Log */}
      <div className="lg:col-span-7 rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Habit History ({logs.length} days)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All records stay private and local on your computer
            </p>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
              title="Delete all check-in entries and reset your habit log to zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset to 0 (Clear Check-Ins)
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No daily logs yet. Log your first day on the left or try a sample 30-day student routine!
            </p>
            <button
              onClick={onLoadSample}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              Load Sample Routine
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Sleep</th>
                  <th className="py-2.5 px-2">Total Screen</th>
                  <th className="py-2.5 px-2">Active</th>
                  <th className="py-2.5 px-2">Study</th>
                  <th className="py-2.5 px-2">Spend</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-2.5 px-2">{log.sleep_hours}h</td>
                    <td className="py-2.5 px-2">{log.screen_time_hours}h</td>
                    <td className="py-2.5 px-2">{Math.round(log.physical_activity_minutes)}m</td>
                    <td className="py-2.5 px-2">{log.study_hours}h</td>
                    <td className="py-2.5 px-2 font-medium">₹{Math.round(log.total_spending).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(log)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
