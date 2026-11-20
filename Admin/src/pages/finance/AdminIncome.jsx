import LedgerPage from '../../features/finance/LedgerPage';

export default function AdminIncome() {
  return (
    <LedgerPage
      type="income"
      title="Income List"
      totalLabel="Total Income"
      endpoint="/finance/income"
      itemLabel="Income"
      itemLabelPlural="Income entries"
      sourceLabel="Source"
      breadcrumb="Income"
    />
  );
}
