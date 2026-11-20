import { useEffect, useMemo, useState } from 'react';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import ActionMenu from './ActionMenu';
import ConfirmDialog from './ConfirmDialog';
import DataTable from './DataTable';
import FilterBar from './FilterBar';
import FormModal from './FormModal';
import PageHeader from './PageHeader';
import StatCard from './StatCard';
import { api, withQuery } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { downloadCsv } from '../utils/exportCsv';
import { cx } from '../utils/cx';

/**
 * List + add/edit modal + delete confirm for a REST resource. Pages supply
 * columns, form fields and filters; everything else is shared.
 *
 * stats(data) returns StatCard props; fromItem/toPayload map between API
 * records and form values; extraActions(row, reload) adds row menu entries.
 */
export default function CrudPage({
  title,
  description,
  endpoint,
  module,
  columns,
  fields,
  itemLabel,
  itemLabelPlural,
  defaults = {},
  filters = [],
  initialFilters = {},
  searchPlaceholder,
  searchable = true,
  stats,
  fromItem = (item) => item,
  toPayload = (values) => values,
  extraActions,
  headerActions,
  beforeTable,
  deleteMessage,
  csv,
  modalSize,
  onValuesChange,
  canDelete = () => true,
  emptyDescription,
}) {
  const { can } = useAuth();
  const toast = useToast();
  const canManage = can(module, 'manage');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [modal, setModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data, loading, error, reload } = useApi(withQuery(endpoint, { ...filterValues, q: debounced, limit: 2000 }));
  const plural = itemLabelPlural ?? `${itemLabel}s`;

  const tableColumns = useMemo(() => {
    const showActions = canManage || extraActions;
    return [
      { key: 'sno', header: 'S.No', render: (_, index) => <span className="text-muted tabular-nums">{index + 1}</span> },
      ...columns,
      ...(showActions
        ? [
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              align: 'right',
              render: (row) => {
                const items = [
                  ...(extraActions?.(row, reload) ?? []),
                  ...(canManage ? [{ label: 'Edit', icon: Pencil, onClick: () => setModal({ open: true, item: row }) }] : []),
                  ...(canManage && canDelete(row) ? [{ label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => setDeleting(row) }] : []),
                ];
                return items.length > 0 ? <ActionMenu items={items} label={`Actions for this ${itemLabel.toLowerCase()}`} /> : null;
              },
            },
          ]
        : []),
    ];
  }, [columns, canManage, extraActions, reload, itemLabel, canDelete]);

  const save = async (values) => {
    const payload = toPayload(values);
    if (modal.item) await api.put(`${endpoint}/${modal.item._id}`, payload);
    else await api.post(endpoint, payload);
    toast.success(modal.item ? `${itemLabel} updated` : `${itemLabel} added`);
    setModal((prev) => ({ ...prev, open: false }));
    reload();
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.del(`${endpoint}/${deleting._id}`);
      toast.success(`${itemLabel} deleted`);
      setDeleting(null);
      reload();
    } catch (failure) {
      toast.error('Couldn’t delete', failure.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  const exportRows = () => {
    downloadCsv(`${plural.toLowerCase().replace(/\s+/g, '-')}.csv`, csv.map((c) => c.header), (data?.items ?? []).map((row) => csv.map((c) => c.value(row))));
  };

  const statCards = data && stats ? stats(data) : [];

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {headerActions?.(reload)}
            {csv && (
              <button type="button" className="btn btn-secondary" onClick={exportRows} disabled={!data?.items?.length}>
                <Download size={16} aria-hidden="true" />
                Export CSV
              </button>
            )}
            {canManage && fields && (
              <button type="button" className="btn btn-primary" onClick={() => setModal({ open: true, item: null })}>
                <Plus size={18} aria-hidden="true" />
                Add {itemLabel}
              </button>
            )}
          </>
        }
      />

      {statCards.length > 0 && (
        <section
          aria-label="Summary"
          className={cx(
            'mb-6 grid gap-3 sm:gap-4',
            statCards.length === 1 && 'grid-cols-1',
            statCards.length === 2 && 'grid-cols-1 sm:grid-cols-2',
            statCards.length === 3 && 'grid-cols-1 sm:grid-cols-3',
            statCards.length >= 4 && 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {statCards.map((card, index) => (
            <StatCard key={card.title} index={index} {...card} />
          ))}
        </section>
      )}

      {beforeTable}

      <section className="card overflow-hidden">
        <FilterBar
          idPrefix={endpoint.replace(/\W/g, '')}
          search={search}
          onSearch={searchable ? setSearch : undefined}
          searchPlaceholder={searchPlaceholder ?? `Search ${plural.toLowerCase()}…`}
          filters={filters}
          values={filterValues}
          onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
        />
        <DataTable
          columns={tableColumns}
          rows={data?.items}
          loading={loading}
          error={error}
          onRetry={reload}
          itemLabel={plural.toLowerCase()}
          caption={title}
          empty={{
            title: `No ${plural.toLowerCase()} yet`,
            description: emptyDescription ?? (canManage ? `Add your first ${itemLabel.toLowerCase()} to get started.` : 'Nothing to show here yet.'),
          }}
        />
      </section>

      {fields && (
        <FormModal
          open={modal.open}
          onClose={() => setModal((prev) => ({ ...prev, open: false }))}
          title={modal.item ? `Edit ${itemLabel.toLowerCase()}` : `Add ${itemLabel.toLowerCase()}`}
          fields={fields}
          initialValues={modal.item ? fromItem(modal.item) : defaults}
          onSubmit={save}
          submitLabel={modal.item ? 'Save changes' : `Add ${itemLabel.toLowerCase()}`}
          size={modalSize}
          onValuesChange={onValuesChange}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete this ${itemLabel.toLowerCase()}?`}
        message={deleteMessage ?? 'This can’t be undone.'}
        confirmLabel="Delete"
        loading={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
