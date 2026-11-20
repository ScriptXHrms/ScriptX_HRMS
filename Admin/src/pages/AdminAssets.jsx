import { useMemo, useState } from 'react';
import { Boxes, IndianRupee, Layers, Tags, Trash2 } from 'lucide-react';
import CrudPage from '../components/CrudPage';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { useAction } from '../hooks/useAction';
import { useApi } from '../hooks/useApi';
import { todayISO, formatDate } from '../utils/dateUtils';
import { employeeOption, formatMoney, idOf, toOptions } from '../utils/format';

const COLUMNS = [
  { key: 'title', header: 'Title', render: (row) => <span className="font-semibold">{row.title}</span> },
  { key: 'invoiceNumber', header: 'Invoice Number' },
  { key: 'purchasedDate', header: 'Purchased Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.purchasedDate) },
  { key: 'category', header: 'Asset Category', render: (row) => row.category?.name ?? '—' },
  { key: 'subCategory', header: 'Sub Category', render: (row) => row.subCategory?.name ?? '—' },
  { key: 'quantity', header: 'Quantity', align: 'center' },
  { key: 'rate', header: 'Rate', align: 'right', render: (row) => formatMoney(row.rate) },
  { key: 'taxable', header: 'Taxable', align: 'right', render: (row) => formatMoney(row.taxable) },
  { key: 'gst', header: 'CGST + SGST / IGST', align: 'right', render: (row) => formatMoney(row.cgst + row.sgst + row.igst) },
  { key: 'invoiceValue', header: 'Invoice Value', align: 'right', render: (row) => <span className="font-semibold">{formatMoney(row.invoiceValue)}</span> },
  { key: 'warrantyYears', header: 'Warranty', align: 'center', render: (row) => `${row.warrantyYears} yr` },
  { key: 'disposedDate', header: 'Disposed', className: 'whitespace-nowrap', render: (row) => formatDate(row.disposedDate) },
];

function CategoryManager({ open, onClose, onChanged }) {
  const { data: categories, reload: reloadCategories } = useApi(open ? '/asset-categories' : null);
  const { data: subs, reload: reloadSubs } = useApi(open ? '/asset-subcategories' : null);
  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [parent, setParent] = useState('');
  const { busy, run } = useAction();

  const refresh = () => {
    reloadCategories();
    reloadSubs();
    onChanged();
  };

  const addCategory = async (event) => {
    event.preventDefault();
    if (name.trim() && (await run(() => api.post('/asset-categories', { name }), { success: 'Category added' }))) {
      setName('');
      refresh();
    }
  };

  const addSub = async (event) => {
    event.preventDefault();
    if (subName.trim() && parent && (await run(() => api.post('/asset-subcategories', { name: subName, category: parent }), { success: 'Sub category added' }))) {
      setSubName('');
      refresh();
    }
  };

  const remove = async (path) => {
    if (await run(() => api.del(path), { success: 'Deleted', errorTitle: 'Couldn’t delete' })) refresh();
  };

  const subsOf = (id) => (subs?.items ?? []).filter((s) => idOf(s.category) === id);

  return (
    <Modal open={open} onClose={onClose} title="Asset categories" size="lg">
      <div className="space-y-5">
        <form onSubmit={addCategory} className="flex gap-2">
          <label htmlFor="new-category" className="sr-only">New category</label>
          <input id="new-category" value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="input" />
          <button type="submit" className="btn btn-primary shrink-0" disabled={busy}>Add</button>
        </form>
        <form onSubmit={addSub} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="sr-only" htmlFor="sub-parent">Parent category</label>
          <select id="sub-parent" value={parent} onChange={(e) => setParent(e.target.value)} className="input select">
            <option value="">Select category</option>
            {(categories?.items ?? []).map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="new-sub">New sub category</label>
          <input id="new-sub" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="New sub category" className="input" />
          <button type="submit" className="btn btn-secondary" disabled={busy || !parent}>Add</button>
        </form>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {(categories?.items ?? []).map((category) => (
            <li key={category._id} className="px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">{category.name}</span>
                <button type="button" className="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${category.name}`} onClick={() => remove(`/asset-categories/${category._id}`)}>
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {subsOf(category._id).map((sub) => (
                  <li key={sub._id}>
                    <button type="button" onClick={() => remove(`/asset-subcategories/${sub._id}`)} aria-label={`Delete ${sub.name}`} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-red-50 hover:text-red-600">
                      {sub.name} ×
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export default function AdminAssets() {
  const [managing, setManaging] = useState(false);
  const { data: lookups, reload: reloadLookups } = useApi('/lookups?include=assetCategories,assetSubCategories,employees');
  const categories = useMemo(() => lookups?.assetCategories ?? [], [lookups]);
  const subCategories = useMemo(() => lookups?.assetSubCategories ?? [], [lookups]);
  const employees = useMemo(() => lookups?.employees ?? [], [lookups]);
  const categoryOptions = useMemo(() => toOptions(categories), [categories]);

  const fields = useMemo(
    () => [
      { name: 'title', label: 'Title', required: true },
      { name: 'invoiceNumber', label: 'Invoice number', required: true },
      { name: 'purchasedDate', label: 'Purchased date', type: 'date', required: true },
      { name: 'ledger', label: 'Ledger', required: true },
      { name: 'category', label: 'Asset category', type: 'select', required: true, options: categoryOptions },
      { name: 'subCategory', label: 'Asset sub category', type: 'select', required: true, options: (values) => toOptions(subCategories.filter((s) => idOf(s.category) === values.category)) },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 1 },
      { name: 'rate', label: 'Rate', type: 'number', required: true, min: 0 },
      { name: 'gstRate', label: 'GST rate (%)', type: 'number', min: 0 },
      { name: 'depreciationPercentage', label: 'Depreciation (%)', type: 'number', min: 0 },
      { name: 'warrantyYears', label: 'Warranty years', type: 'number', min: 0 },
      { name: 'disposedDate', label: 'Disposed date', type: 'date' },
      { name: 'assignedTo', label: 'Assigned to', type: 'select', options: toOptions(employees, employeeOption) },
      { name: 'igst', label: 'IGST', type: 'checkbox', checkboxLabel: 'Inter-state purchase (IGST)' },
    ],
    [categoryOptions, subCategories, employees],
  );

  return (
    <>
      <CrudPage
        title="Asset Management"
        description="Company equipment with purchase, tax and warranty details. Tax totals are worked out for you."
        endpoint="/assets"
        module="assets"
        columns={COLUMNS}
        fields={fields}
        itemLabel="Asset"
        modalSize="xl"
        defaults={{ purchasedDate: todayISO(), quantity: 1, gstRate: 18 }}
        filters={[
          { key: 'category', label: 'Category', type: 'select', options: categoryOptions, allLabel: 'All categories' },
          { key: 'from', label: 'From', type: 'date' },
          { key: 'to', label: 'To', type: 'date' },
        ]}
        fromItem={(item) => ({ ...item, category: idOf(item.category), subCategory: idOf(item.subCategory), assignedTo: idOf(item.assignedTo), igst: item.igst > 0 })}
        onValuesChange={(next, changed) => (changed === 'category' ? { ...next, subCategory: '' } : next)}
        headerActions={() => (
          <button type="button" className="btn btn-secondary" onClick={() => setManaging(true)}>
            <Tags size={16} aria-hidden="true" />
            Categories
          </button>
        )}
        stats={(data) => [
          { title: 'Assets', value: data.total, icon: Boxes, tone: 'brand' },
          { title: 'Units', value: data.items.reduce((total, a) => total + a.quantity, 0), icon: Layers, tone: 'sky' },
          { title: 'Total Value', value: formatMoney(data.items.reduce((total, a) => total + a.invoiceValue, 0)), icon: IndianRupee, tone: 'gold' },
        ]}
      />
      <CategoryManager open={managing} onClose={() => setManaging(false)} onChanged={reloadLookups} />
    </>
  );
}
