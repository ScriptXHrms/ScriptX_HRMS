import { CircleHelp, TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { cx } from '../utils/cx';

/** Confirmation prompt for destructive or important actions. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const danger = tone === 'danger';
  const Icon = danger ? TriangleAlert : CircleHelp;
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      dismissible={!loading}
      size="sm"
      title={title}
      icon={
        <span
          className={cx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700',
          )}
        >
          <Icon size={20} aria-hidden="true" />
        </span>
      }
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading} data-autofocus>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cx('btn', danger ? 'btn-danger' : 'btn-primary')}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Spinner size={16} />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-muted">{message}</div>
    </Modal>
  );
}
