import { useEffect, useId, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import FormFields, { validateFields } from './FormFields';
import Modal from './Modal';
import Spinner from './Spinner';

/**
 * Modal with a config-driven form. `onSubmit(values)` should throw on failure;
 * the message is shown in the dialog so the user keeps what they typed.
 */
export default function FormModal({ open, onClose, title, description, fields, initialValues, onSubmit, submitLabel = 'Save', size = 'lg', children, onValuesChange }) {
  const formId = useId();
  const [values, setValues] = useState(initialValues ?? {});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? {});
      setErrors({});
      setFormError('');
    }
    // Reset only when the dialog opens, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const change = (next, changedName) => {
    const resolved = onValuesChange ? onValuesChange(next, changedName) : next;
    setValues(resolved);
    if (errors[changedName]) setErrors((prev) => ({ ...prev, [changedName]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validateFields(fields, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size={size}
      title={title}
      description={description}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>
            {busy && <Spinner size={16} />}
            {submitLabel}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <CircleAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}
        <FormFields fields={fields} values={values} onChange={change} errors={errors} />
        {children?.(values)}
      </form>
    </Modal>
  );
}
