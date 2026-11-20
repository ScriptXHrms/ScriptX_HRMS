/** Minimal RFC-4180 parser: quoted fields, escaped quotes, CRLF. Returns rows of strings. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) rows.push([...row, field]);
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** Accepts yyyy-mm-dd, dd/mm/yyyy, dd-mm-yyyy and dd/mm/yy. */
function toISO(value) {
  const text = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/.exec(text);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

const toNumber = (value) => Number(String(value ?? '').replace(/[,₹\s]/g, '')) || 0;

/** Maps a bank CSV to statement rows. Finds columns by header name. */
export function parseStatementRows(table) {
  const [header = [], ...body] = table;
  const names = header.map((h) => h.trim().toLowerCase());
  const find = (...options) => names.findIndex((name) => options.some((option) => name.includes(option)));

  const date = find('date');
  const narration = find('narration', 'description', 'particular');
  const reference = find('ref', 'chq');
  const withdrawal = find('withdrawal', 'debit');
  const deposit = find('deposit', 'credit');
  const amount = find('amount');
  const type = names.indexOf('type');
  if (date === -1 || narration === -1) return { rows: [], skipped: body.length };

  const rows = [];
  let skipped = 0;
  body.forEach((cells) => {
    const debit = withdrawal === -1 ? 0 : toNumber(cells[withdrawal]);
    const credit = deposit === -1 ? 0 : toNumber(cells[deposit]);
    const flat = amount === -1 ? 0 : toNumber(cells[amount]);
    const flatType = type === -1 ? '' : String(cells[type]).trim().toLowerCase();
    const row = {
      date: toISO(cells[date]),
      narration: cells[narration]?.trim(),
      reference_no: reference === -1 ? undefined : cells[reference]?.trim(),
      amount: debit || credit || flat,
      type: credit > 0 || flatType.startsWith('c') ? 'Credit' : 'Debit',
    };
    if (row.date && row.narration && row.amount > 0) rows.push(row);
    else skipped += 1;
  });
  return { rows, skipped };
}
