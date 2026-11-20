import LedgerPage from '../../features/finance/LedgerPage';

export default function AdminExpenses() {
  return (
    <LedgerPage
      type="expense"
      title="Expense List"
      totalLabel="Total Debit"
      endpoint="/finance/expenses"
      itemLabel="Expense"
      itemLabelPlural="Expense entries"
      sourceLabel="Source"
      breadcrumb="Expense"
    />
  );
}
