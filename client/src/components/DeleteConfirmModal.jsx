import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatDisplayDate } from '../utils/constants';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, reading }) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !reading) return null;

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm(reading.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Reading</h3>
              <p className="text-sm text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
          Are you sure you want to delete the{' '}
          <span className="font-semibold text-slate-900">{reading.time_slot_label}</span> reading of{' '}
          <span className="font-semibold text-slate-900">{reading.glucose_value} mg/dL</span> recorded
          on <span className="font-semibold text-slate-900">{formatDisplayDate(reading.reading_date)}</span>?
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete Reading'}
          </button>
        </div>
      </div>
    </div>
  );
}
