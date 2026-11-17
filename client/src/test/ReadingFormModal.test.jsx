import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReadingFormModal from '../components/ReadingFormModal';

describe('ReadingFormModal Component Tests', () => {
  test('1. Reading form renders correctly when open', () => {
    render(
      <ReadingFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={async () => {}}
        defaultDate="2026-10-15"
        defaultSlot="MORNING_FASTING"
      />
    );

    expect(screen.getByText('Add Glucose Reading')).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Measurement/i)).toHaveValue('2026-10-15');
    expect(screen.getByLabelText(/Time Slot/i)).toHaveValue('MORNING_FASTING');
    expect(screen.getByLabelText(/Glucose Value/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Reading/i })).toBeInTheDocument();
  });

  test('2. Required-field validation displays exact BR-01 error when glucose value is empty', async () => {
    const handleSubmit = vi.fn();

    render(
      <ReadingFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={handleSubmit}
        defaultDate="2026-10-15"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Save Reading/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter a glucose value.'
    );
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('3. Invalid-value validation displays exact BR-02 error for out-of-range or decimal values', async () => {
    const handleSubmit = vi.fn();

    render(
      <ReadingFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={handleSubmit}
        defaultDate="2026-10-15"
      />
    );

    const glucoseInput = screen.getByLabelText(/Glucose Value/i);

    // Below 40
    fireEvent.change(glucoseInput, { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Reading/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Value must be between 40 and 600 mg/dl.'
    );

    // Decimal value
    fireEvent.change(glucoseInput, { target: { value: '120.5' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Reading/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Value must be between 40 and 600 mg/dl.'
    );

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('4. Displays API error message when backend rejects submission (e.g. BR-03 duplicate slot)', async () => {
    const handleSubmit = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: 'You already have an After lunch reading for this date.',
        },
      },
    });

    render(
      <ReadingFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={handleSubmit}
        defaultDate="2026-10-15"
        defaultSlot="AFTER_LUNCH"
      />
    );

    fireEvent.change(screen.getByLabelText(/Glucose Value/i), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Reading/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You already have an After lunch reading for this date.'
    );
  });

  test('5. Successful form submission calls onSubmit with normalized payload and closes modal', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <ReadingFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        defaultDate="2026-10-15"
        defaultSlot="AFTER_BREAKFAST"
      />
    );

    fireEvent.change(screen.getByLabelText(/Glucose Value/i), {
      target: { value: '125' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Reading/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_BREAKFAST',
        glucose_value: 125,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
