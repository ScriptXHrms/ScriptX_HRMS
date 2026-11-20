import { useCallback, useMemo, useRef, useState } from 'react';
import { Eye, Printer } from 'lucide-react';
import { BrandMark } from '../../components/BrandLogo';
import CrudPage from '../../components/CrudPage';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { CURRENCIES } from '../../data/constants';
import { useApi, useLookups } from '../../hooks/useApi';
import { formatDate, todayISO } from '../../utils/dateUtils';
import { formatMoney, idOf, toOptions } from '../../utils/format';

const TYPES = ['Tax Invoice', 'Performa Invoice', 'Sales Invoice', 'Export Invoice'];
const STATUSES = ['Unpaid', 'Partial', 'Paid'];

const COLUMNS = [
  { key: 'invoiceNumber', header: 'Invoice Number', render: (row) => <span className="font-semibold">{row.invoiceNumber}</span> },
  { key: 'client', header: 'Client Name', render: (row) => row.client?.company_name ?? '—' },
  { key: 'project', header: 'Project', className: 'max-w-[200px] truncate', render: (row) => row.project?.name ?? '—' },
  { key: 'invoiceType', header: 'Type' },
  { key: 'invoiceDate', header: 'Invoice Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.invoiceDate) },
  { key: 'dueDate', header: 'Due Date', className: 'whitespace-nowrap', render: (row) => formatDate(row.dueDate) },
  { key: 'total', header: 'Total Amount', align: 'right', render: (row) => <span className="font-semibold">{formatMoney(row.totalAmount, row.currency)}</span> },
  { key: 'received', header: 'Received', align: 'right', render: (row) => formatMoney(row.receivedAmount, row.currency) },
  { key: 'balance', header: 'Balance', align: 'right', render: (row) => formatMoney(row.totalAmount - row.receivedAmount, row.currency) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
];

function InvoiceView({ invoice, settings, printRef }) {
  const enableSig = settings?.enableSignature ?? true;
  const sigImage = invoice.signatureImage || settings?.signatureImage;
  const sigName = invoice.signatureName || settings?.signatureName || 'Logeshwaran';
  const sigDesignation = invoice.signatureDesignation || settings?.signatureDesignation || 'CEO';
  const taxTotal = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);

  return (
    <div ref={printRef} className="print-area bg-white text-[#0f172a] text-sm font-sans max-w-4xl mx-auto p-4 sm:p-6 sm:px-8">
      {/* Header: Company Logo & Name on left, Blue geometric banner on right */}
      <div className="relative -mx-4 -mt-4 sm:-mx-8 sm:-mt-6 mb-6 flex items-stretch justify-between min-h-[90px] border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3.5 pl-4 sm:pl-8 py-4">
          <BrandMark size={48} alt="ScriptX logo" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0f172a] uppercase">ScriptX</h1>
            <p className="text-xs text-[#64748b] font-medium">Write | Create | Elevate</p>
          </div>
        </div>
        <div
          className="flex items-center justify-end text-white px-6 sm:px-12 w-[48%] max-w-sm"
          style={{ backgroundColor: '#0070F3', clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          <span className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase">INVOICE</span>
        </div>
      </div>

      {/* Sub-header: Payment method on left, Angled blue ribbon with invoice # and date on right */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="text-sm">
          <span className="font-bold text-[#0f172a]">Payment Method: </span>
          <span className="text-[#64748b] font-medium">
            {invoice.paymentMethod || settings?.paymentMethod || 'Bank Transfer'}
          </span>
        </div>
        <div
          className="text-white text-xs sm:text-sm font-semibold py-2 px-6"
          style={{ backgroundColor: '#0070F3', clipPath: 'polygon(14px 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        >
          Invoice No: #{invoice.invoiceNumber}&nbsp;&nbsp;&nbsp;&nbsp;Date: {formatDate(invoice.invoiceDate)}
        </div>
      </div>

      {/* Address block: Invoice To (Client) on left, Pay To (Company) on right */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div className="space-y-1">
          <p className="font-bold text-[#0f172a] text-sm">Invoice To:</p>
          <p className="text-[#0f172a] font-semibold">
            {invoice.client?.contact_person || invoice.client?.client_name || invoice.client?.company_name}
          </p>
          {invoice.client?.company_name && invoice.client.company_name !== invoice.client?.contact_person && (
            <p className="text-[#64748b]">{invoice.client.company_name}</p>
          )}
          <p className="text-[#64748b] whitespace-pre-line leading-relaxed">
            {invoice.client?.address || 'Client address'}
          </p>
          {invoice.client?.email && <p className="text-[#64748b]">{invoice.client.email}</p>}
          {invoice.client?.phone_number && <p className="text-[#64748b]">{invoice.client.phone_number}</p>}
          {invoice.client?.gst && <p className="text-[#64748b] font-medium">GST: {invoice.client.gst}</p>}
        </div>

        <div className="space-y-1 text-right">
          <p className="font-bold text-[#0f172a] text-sm">Pay To:</p>
          <p className="text-[#0f172a] font-semibold">{settings?.companyName || 'ScriptX Private Limited'}</p>
          <p className="text-[#64748b] whitespace-pre-line leading-relaxed">
            {settings?.companyAddress || 'No. 9, Choolaimedu High Road, Chennai, Tamil Nadu'}
          </p>
          {settings?.companyEmail && <p className="text-[#64748b]">{settings.companyEmail}</p>}
          {settings?.companyPhone && <p className="text-[#64748b]">{settings.companyPhone}</p>}
          {settings?.companyWebsite && <p className="text-[#64748b]">{settings.companyWebsite}</p>}
        </div>
      </div>

      {/* Items Table: Solid Blue Header */}
      <div className="overflow-hidden rounded-sm mb-6" style={{ border: '1px solid rgba(0,112,243,0.3)' }}>
        <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0070F3', color: '#ffffff' }}>
              <th scope="col" className="px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide" style={{ width: '28%' }}>Item</th>
              <th scope="col" className="px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide" style={{ width: '38%' }}>Description</th>
              <th scope="col" className="px-4 py-3 text-right text-xs sm:text-sm font-semibold tracking-wide" style={{ width: '12%' }}>Price</th>
              <th scope="col" className="px-4 py-3 text-center text-xs sm:text-sm font-semibold tracking-wide" style={{ width: '8%' }}>Qty</th>
              <th scope="col" className="px-4 py-3 text-right text-xs sm:text-sm font-semibold tracking-wide" style={{ width: '14%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const qty = Number(item.quantity) || 1;
              const rate = Number(item.rate) || 0;
              const amount = item.amount || qty * rate;
              const detailsText = item.details || (item.hsnCode ? `HSN/SAC: ${item.hsnCode}` : 'Standard services & deliverables');

              return (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td className="px-4 py-3.5 text-[#0f172a] font-medium align-top">
                    {index + 1}. {item.description}
                  </td>
                  <td className="px-4 py-3.5 text-[#64748b] align-top text-xs sm:text-sm leading-relaxed">
                    {detailsText}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-[#64748b] align-top">
                    {formatMoney(rate, invoice.currency)}
                  </td>
                  <td className="px-4 py-3.5 text-center tabular-nums text-[#64748b] align-top">
                    {qty}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-[#0f172a] align-top">
                    {formatMoney(amount, invoice.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Section: Payment info on left, Totals & Signature on right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-6">
        {/* Left: Payment info */}
        <div className="space-y-1 text-sm p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p className="font-bold text-[#0f172a]">Payment info:</p>
          <p className="text-[#64748b] whitespace-pre-line leading-relaxed text-xs sm:text-sm">
            {invoice.paymentInfo || settings?.paymentInfo || 'Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234'}
          </p>
          <p className="text-[#0f172a] font-semibold mt-2 text-xs sm:text-sm">
            Amount: {formatMoney(invoice.totalAmount, invoice.currency)}
          </p>
        </div>

        {/* Right: Subtotal, Tax, Grand Total & Signature */}
        <div className="space-y-3">
          <div className="space-y-2 text-sm pl-4">
            <div className="flex justify-between gap-6 text-[#64748b]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#0f172a] tabular-nums">{formatMoney(invoice.subTotal, invoice.currency)}</span>
            </div>
            {invoice.cgst > 0 && (
              <div className="flex justify-between gap-6 text-[#64748b] text-xs">
                <span>CGST</span>
                <span className="tabular-nums font-medium text-[#0f172a]">+{formatMoney(invoice.cgst, invoice.currency)}</span>
              </div>
            )}
            {invoice.sgst > 0 && (
              <div className="flex justify-between gap-6 text-[#64748b] text-xs">
                <span>SGST</span>
                <span className="tabular-nums font-medium text-[#0f172a]">+{formatMoney(invoice.sgst, invoice.currency)}</span>
              </div>
            )}
            {invoice.igst > 0 && (
              <div className="flex justify-between gap-6 text-[#64748b] text-xs">
                <span>IGST</span>
                <span className="tabular-nums font-medium text-[#0f172a]">+{formatMoney(invoice.igst, invoice.currency)}</span>
              </div>
            )}
            {taxTotal > 0 && !invoice.cgst && !invoice.sgst && !invoice.igst && (
              <div className="flex justify-between gap-6 text-[#64748b]">
                <span>Tax</span>
                <span className="tabular-nums font-medium text-[#0f172a]">+{formatMoney(taxTotal, invoice.currency)}</span>
              </div>
            )}
          </div>

          {/* Solid Blue Grand Total Bar */}
          <div className="text-white px-5 py-3 font-bold flex justify-between items-center text-base" style={{ backgroundColor: '#0070F3' }}>
            <span>Grand Total</span>
            <span className="tabular-nums font-extrabold text-lg">
              {formatMoney(invoice.totalAmount, invoice.currency)}
            </span>
          </div>

          {/* Signature block directly below Grand Total */}
          {enableSig && (
            <div className="pt-4 flex flex-col items-end text-right">
              {sigImage ? (
                <img src={sigImage} alt="Authorized Signature" className="h-14 max-w-[180px] object-contain mb-1.5" />
              ) : (
                <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', color: '#6d28d9', letterSpacing: '0.05em', paddingRight: '8px' }}>
                  Signature
                </div>
              )}
              <p className="text-sm font-bold text-[#0f172a]">{sigName}</p>
              <p className="text-xs text-[#64748b]">{sigDesignation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions centered at bottom */}
      <div className="mt-8 pt-4 text-center" style={{ borderTop: '1px solid #e2e8f0' }}>
        <p className="text-xs font-bold text-[#0f172a]">Terms & Conditions:</p>
        <p className="mt-1 text-xs text-[#64748b] max-w-2xl mx-auto leading-relaxed">
          {invoice.notes || settings?.invoiceTerms || 'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.'}
        </p>
      </div>
    </div>
  );
}

export default function AdminInvoices() {
  const [viewing, setViewing] = useState(null);
  const printRef = useRef(null);
  const { clients = [], projects = [] } = useLookups(['clients', 'projects']);
  const clientOptions = useMemo(() => toOptions(clients, 'company_name'), [clients]);
  const { data: settings } = useApi('/settings');
  const gstPercent = settings?.item.gstPercent ?? 0;

  const handlePrint = useCallback(() => {
    const el = printRef.current;
    if (!el) return;

    // Collect all stylesheets from the main document
    const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')]
      .map((s) => s.outerHTML)
      .join('\n');

    const invoiceNum = viewing?.invoiceNumber || 'Invoice';

    // Open a fresh window, write the invoice HTML + styles, then print
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      // Pop-up blocked fallback: just try window.print()
      window.print();
      return;
    }

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${invoiceNum} - ScriptX Invoice</title>
  ${styles}
  <style>
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #0f172a !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: visible !important;
      height: auto !important;
    }
    .print-area {
      max-width: 800px;
      margin: 24px auto;
      padding: 24px 32px;
    }
    @media print {
      .print-area { margin: 0 auto; padding: 0 8px; }
      @page { size: A4 portrait; margin: 8mm 10mm; }
    }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`);
    win.document.close();

    // Wait for images to load, then print
    const imgs = [...win.document.images];
    let pending = imgs.filter((i) => !i.complete).length;

    const doPrint = () => {
      // Small delay to let the browser finish rendering
      setTimeout(() => {
        win.focus();
        win.print();
        // Close the window after a short delay (user may cancel)
        setTimeout(() => { try { win.close(); } catch {} }, 1000);
      }, 300);
    };

    if (pending === 0) {
      doPrint();
    } else {
      const onDone = () => { if (--pending <= 0) doPrint(); };
      imgs.forEach((img) => {
        if (img.complete) return;
        img.onload = onDone;
        img.onerror = onDone;
      });
      // Safety timeout
      setTimeout(doPrint, 2000);
    }
  }, [viewing]);

  // New line items refresh the split-GST amounts; they stay editable for exports and IGST.
  const applyGst = (next, changed) => {
    if (changed === 'client') return { ...next, project: '' };
    if (changed !== 'items') return next;
    const subTotal = (next.items ?? []).reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
    const half = Math.round(subTotal * (gstPercent / 2)) / 100;
    return { ...next, cgst: half, sgst: half };
  };

  const fields = useMemo(
    () => [
      { name: 'client', label: 'Client', type: 'select', required: true, options: clientOptions },
      { name: 'project', label: 'Project', type: 'select', options: (values) => toOptions(projects.filter((p) => idOf(p.client) === values.client)) },
      { name: 'invoiceType', label: 'Invoice type', type: 'select', required: true, options: TYPES },
      { name: 'currency', label: 'Currency', type: 'select', options: CURRENCIES },
      { name: 'invoiceDate', label: 'Invoice date', type: 'date', required: true },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      {
        name: 'items',
        label: 'Line items',
        type: 'repeater',
        required: true,
        itemLabel: 'item',
        fields: [
          { name: 'description', label: 'Item Name / Title', required: true },
          { name: 'details', label: 'Description / Scope' },
          { name: 'hsnCode', label: 'HSN code' },
          { name: 'quantity', label: 'Quantity', type: 'number', min: 0, defaultValue: 1 },
          { name: 'rate', label: 'Rate', type: 'number', min: 0 },
        ],
      },
      { name: 'paymentMethod', label: 'Payment Method', placeholder: 'e.g. Paypal, Western Union (optional, defaults to Settings)' },
      { name: 'paymentInfo', label: 'Payment Info', placeholder: 'e.g. Bank / Card details (optional, defaults to Settings)' },
      { name: 'cgst', label: 'CGST amount', type: 'number', min: 0 },
      { name: 'sgst', label: 'SGST amount', type: 'number', min: 0 },
      { name: 'igst', label: 'IGST amount', type: 'number', min: 0 },
      { name: 'receivedAmount', label: 'Received amount', type: 'number', min: 0 },
      { name: 'notes', label: 'Terms & Notes', type: 'textarea' },
    ],
    [clientOptions, projects],
  );

  const extraActions = useMemo(() => (row) => [{ label: 'View invoice', icon: Eye, onClick: () => setViewing(row) }], []);

  return (
    <>
      <CrudPage
        title="Invoices"
        description="Invoices raised to clients, and what has been received."
        endpoint="/invoices"
        module="clients"
        columns={COLUMNS}
        fields={fields}
        itemLabel="Invoice"
        modalSize="xl"
        searchPlaceholder="Search invoice number…"
        defaults={{ invoiceType: 'Tax Invoice', currency: 'INR', invoiceDate: todayISO(), items: [{ description: '', details: '', hsnCode: '', quantity: 1, rate: '' }] }}
        filters={[
          { key: 'client', label: 'Client', type: 'select', options: clientOptions, allLabel: 'All clients' },
          { key: 'status', label: 'Status', type: 'select', options: STATUSES },
          { key: 'invoiceType', label: 'Type', type: 'select', options: TYPES },
          { key: 'from', label: 'From', type: 'date' },
          { key: 'to', label: 'To', type: 'date' },
        ]}
        fromItem={(item) => ({ ...item, client: idOf(item.client), project: idOf(item.project) })}
        onValuesChange={applyGst}
        extraActions={extraActions}
      />
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Invoice"
        size="xl"
        footer={
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} aria-hidden="true" />
            Print / Save PDF
          </button>
        }
      >
        {viewing && <InvoiceView invoice={viewing} settings={settings?.item} printRef={printRef} />}
      </Modal>
    </>
  );
}
