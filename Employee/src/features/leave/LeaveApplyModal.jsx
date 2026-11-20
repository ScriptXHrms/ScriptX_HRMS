import { useMemo } from 'react';
import FormModal from '../../components/FormModal';
import { api } from '../../api/client';
import { LEAVE_DURATIONS } from '../../data/constants';
import { useToast } from '../../hooks/useToast';
import { todayISO } from '../../utils/dateUtils';

const needsEnd = (values) => values.category !== 'Permission' && (values.duration ?? 'Full Day') === 'Full Day';

/**
 * Apply for leave, permission or work from home. `category` fixes the type when set.
 * There is no leave type to pick: HR chooses it when approving.
 */
export default function LeaveApplyModal({ open, onClose, category, onApplied }) {
  const toast = useToast();

  const fields = useMemo(
    () => [
      ...(category ? [] : [{ name: 'category', label: 'Request type', type: 'select', required: true, options: ['Leave', 'Permission'] }]),
      { name: 'duration', label: 'Duration', type: 'select', required: true, options: LEAVE_DURATIONS, show: (v) => v.category !== 'Permission' },
      { name: 'startDate', label: 'From date', type: 'date', required: true },
      {
        name: 'endDate',
        label: 'To date',
        type: 'date',
        required: true,
        show: needsEnd,
        validate: (value, values) => (value < values.startDate ? 'To date can’t be before the from date.' : null),
      },
      { name: 'startTime', label: 'From time', type: 'time', required: true, show: (v) => v.category === 'Permission' },
      { name: 'endTime', label: 'To time', type: 'time', required: true, show: (v) => v.category === 'Permission' },
      { name: 'reason', label: 'Reason', type: 'textarea', required: true },
      ...(category === 'WFH' ? [] : [{ name: 'attachment', label: 'Attachment', type: 'file', span: 2, hint: 'Optional. For example, a medical certificate.' }]),
    ],
    [category],
  );

  const submit = async (values) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    await api.post('/leaves/apply', form);
    toast.success('Request sent', 'HR has been notified.');
    onClose();
    onApplied?.();
  };

  const title = category === 'WFH' ? 'Apply for work from home' : 'Apply for leave';

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      fields={fields}
      initialValues={{ category: category ?? 'Leave', duration: 'Full Day', startDate: todayISO(), endDate: todayISO() }}
      onSubmit={submit}
      submitLabel="Submit request"
    />
  );
}
