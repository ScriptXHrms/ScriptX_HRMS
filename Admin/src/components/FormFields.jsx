import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import FormField, { fieldA11y } from './FormField';
import { cx } from '../utils/cx';

/** Resolves a field's options to [{ value, label }]. */
function optionsFor(field, values) {
  const list = typeof field.options === 'function' ? field.options(values) : (field.options ?? []);
  return list.map((option) => (typeof option === 'object' ? option : { value: option, label: option }));
}

function MultiSelect({ id, field, value, onChange, values }) {
  const [query, setQuery] = useState('');
  const selected = useMemo(() => new Set((value ?? []).map(String)), [value]);
  const options = optionsFor(field, values);
  const shown = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (optionValue) => {
    const next = new Set(selected);
    if (next.has(String(optionValue))) next.delete(String(optionValue));
    else next.add(String(optionValue));
    onChange([...next]);
  };

  return (
    <div id={id} className="rounded-xl border border-line">
      <div className="border-b border-line p-2">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label={`Search ${field.label}`} className="input py-2" />
      </div>
      <ul className="scroll-thin max-h-44 overflow-y-auto p-1">
        {shown.length === 0 && <li className="px-3 py-3 text-sm text-muted">No matches.</li>}
        {shown.map((option) => (
          <li key={option.value}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-brand-50">
              <input type="checkbox" checked={selected.has(String(option.value))} onChange={() => toggle(option.value)} className="h-4 w-4 accent-brand-700" />
              {option.label}
            </label>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-3 py-1.5 text-xs text-muted">{selected.size} selected</p>
    </div>
  );
}

function TagInput({ id, value, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const tags = value ?? [];
  const add = () => {
    const tag = draft.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft('');
  };
  return (
    <div>
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="input"
      />
      {tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100" aria-label={`Remove ${tag}`}>
                {tag} ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Repeater({ field, value, onChange, values }) {
  const rows = value ?? [];
  const blank = () => Object.fromEntries(field.fields.map((f) => [f.name, f.defaultValue ?? '']));
  const update = (index, next) => onChange(rows.map((row, i) => (i === index ? next : row)));
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="relative rounded-xl border border-line bg-canvas/50 p-3 pr-11">
          <FormFields fields={field.fields} values={row} onChange={(next) => update(index, next)} parentValues={values} compact />
          <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} className="icon-btn absolute top-2 right-1 h-8 w-8 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${field.itemLabel ?? 'row'} ${index + 1}`}>
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([...rows, blank()])}>
        <Plus size={14} aria-hidden="true" />
        Add {field.itemLabel ?? 'row'}
      </button>
    </div>
  );
}

const MONTH_PICKER_ITEMS = [
  { short: 'Jan', full: 'January' },
  { short: 'Feb', full: 'February' },
  { short: 'Mar', full: 'March' },
  { short: 'Apr', full: 'April' },
  { short: 'May', full: 'May' },
  { short: 'Jun', full: 'June' },
  { short: 'Jul', full: 'July' },
  { short: 'Aug', full: 'August' },
  { short: 'Sep', full: 'September' },
  { short: 'Oct', full: 'October' },
  { short: 'Nov', full: 'November' },
  { short: 'Dec', full: 'December' },
];

function MonthPicker({ id, field, value, onChange, a11y, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayLabel = value || field.placeholder || 'Select Month';

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        {...a11y}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          'input flex w-full items-center justify-between text-left cursor-pointer transition-all',
          error && 'input-error'
        )}
      >
        <span className={value ? 'text-ink font-medium' : 'text-muted'}>{displayLabel}</span>
        <Calendar size={16} className="text-muted shrink-0 ml-2" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-64 rounded-xl border border-line bg-white p-3 shadow-xl">
          {field.allowEveryMonth && (
            <button
              type="button"
              onClick={() => {
                onChange('Every Month');
                setOpen(false);
              }}
              className={cx(
                'w-full mb-2.5 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all text-center',
                value === 'Every Month'
                  ? 'bg-[#0075ff] border-[#0052cc] text-white'
                  : 'bg-slate-50 border-line text-ink hover:bg-slate-100'
              )}
            >
              Every Month
            </button>
          )}
          <div className="grid grid-cols-4 gap-2">
            {MONTH_PICKER_ITEMS.map((m) => {
              const isSelected =
                value &&
                (String(value).toLowerCase() === m.full.toLowerCase() ||
                  String(value).toLowerCase() === m.short.toLowerCase());
              return (
                <button
                  key={m.short}
                  type="button"
                  onClick={() => {
                    onChange(field.useShort ? m.short : m.full);
                    setOpen(false);
                  }}
                  className={cx(
                    'py-2 px-1 text-sm rounded flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-[#0075ff] border border-[#0052cc] text-white font-bold shadow-sm'
                      : 'text-ink hover:bg-slate-100 font-medium'
                  )}
                >
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DayPicker({ id, field, value, onChange, a11y, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayLabel = value != null && value !== '' ? String(value) : (field.placeholder || 'Select Day');

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        {...a11y}
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          'input flex w-full items-center justify-between text-left cursor-pointer transition-all',
          error && 'input-error'
        )}
      >
        <span className={value != null && value !== '' ? 'text-ink font-medium' : 'text-muted'}>{displayLabel}</span>
        <Calendar size={16} className="text-muted shrink-0 ml-2" />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1.5 w-64 rounded-xl border border-line bg-white p-3 shadow-xl">
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => {
              const isSelected = String(value) === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                  className={cx(
                    'h-8 w-8 text-sm rounded flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-[#0075ff] border border-[#0052cc] text-white font-bold shadow-sm'
                      : 'text-ink hover:bg-slate-100 font-medium'
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Control({ id, field, value, onChange, values, error }) {
  const a11y = fieldA11y(id, error, field.hint);
  const className = cx('input', error && 'input-error');
  switch (field.type) {
    case 'month-picker':
      return <MonthPicker id={id} field={field} value={value} onChange={onChange} a11y={a11y} error={error} />;
    case 'day-picker':
      return <DayPicker id={id} field={field} value={value} onChange={onChange} a11y={a11y} error={error} />;
    case 'textarea':
      return <textarea {...a11y} rows={field.rows ?? 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={className} />;
    case 'select':
      return (
        <select {...a11y} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cx(className, 'select')}>
          <option value="">{field.placeholder ?? 'Select…'}</option>
          {optionsFor(field, values).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'multiselect':
      return <MultiSelect id={id} field={field} value={value} onChange={onChange} values={values} />;
    case 'tags':
      return <TagInput id={id} value={value} onChange={onChange} placeholder={field.placeholder} />;
    case 'repeater':
      return <Repeater field={field} value={value} onChange={onChange} values={values} />;
    case 'checkbox':
      return (
        <label className="flex min-h-[42px] items-center gap-2.5 text-sm text-ink">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand-700" />
          {field.checkboxLabel ?? field.label}
        </label>
      );
    case 'file':
      return (
        <input
          id={id}
          type="file"
          accept={field.accept}
          onChange={(e) => onChange(e.target.files[0])}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-700"
        />
      );
    case 'color':
      return <input {...a11y} type="color" value={value || '#40108C'} onChange={(e) => onChange(e.target.value)} className="input h-[42px] cursor-pointer p-1" />;
    default:
      return (
        <input
          {...a11y}
          type={field.type ?? 'text'}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onWheel={(e) => {
            if ((field.type ?? 'text') === 'number') {
              e.target.blur();
            }
          }}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete ?? 'off'}
          className={className}
        />
      );
  }
}

/** Required-field and pattern checks for a field list. Returns { name: message }. */
export function validateFields(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    if (field.show && !field.show(values)) return;
    const value = values[field.name];
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (field.required && empty) errors[field.name] = `${field.label} is required.`;
    else if (!empty && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) errors[field.name] = 'Enter a valid email address.';
    else if (!empty && field.validate) {
      const message = field.validate(value, values);
      if (message) errors[field.name] = message;
    }
  });
  return errors;
}

/**
 * Config-driven form body.
 * field = { name, label, type, required, options, span: 2, show(values), hint, validate(value, values) }
 */
export default function FormFields({ fields, values, onChange, errors = {}, compact = false, parentValues }) {
  const prefix = useId();
  const visible = fields.filter((field) => !field.show || field.show({ ...parentValues, ...values }));
  return (
    <div className={cx('grid gap-4', compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
      {visible.map((field) => {
        const id = `${prefix}-${field.name}`;
        const set = (value) => onChange({ ...values, [field.name]: value }, field.name);
        const fullWidth = field.span === 2 || ['textarea', 'repeater', 'multiselect'].includes(field.type);
        return (
          <FormField
            key={field.name}
            id={id}
            label={field.type === 'checkbox' && !field.checkboxLabel ? '' : field.label}
            required={field.required}
            error={errors[field.name]}
            hint={field.hint}
            className={cx(fullWidth && !compact && 'sm:col-span-2')}
          >
            <Control id={id} field={field} value={values[field.name]} onChange={set} values={{ ...parentValues, ...values }} error={errors[field.name]} />
          </FormField>
        );
      })}
    </div>
  );
}
