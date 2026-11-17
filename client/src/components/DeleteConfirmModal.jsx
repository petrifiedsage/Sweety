import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card w-full max-w-md overflow-hidden p-7">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-stone-900">
                Remove Reading?
              </h3>
              <p className="text-xs font-medium text-stone-500">
                This measurement will be permanently removed from your logbook.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-[#F7F6F2] border border-stone-200/80 p-4 text-sm text-stone-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900">{reading.time_slot_label}</span>
            <span className="font-display text-lg font-extrabold text-stone-900">
              {reading.glucose_value} mg/dL
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Recorded on {formatDisplayDate(reading.reading_date, true)}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Keep Reading
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {deleting ? 'Removing...' : 'Delete Reading'}
          </button>
        </div>
      </div>
    </div>
  );
}
