const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** ₹1,25,000 */
export function formatMoney(value, currency = 'INR') {
  const number = Number(value) || 0;
  const symbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] ?? '';
  return `${symbol}${inr.format(number)}`;
}

/** Options for selects from lookup records. */
export const toOptions = (items = [], label = 'name') =>
  items.map((item) => ({ value: item._id, label: typeof label === 'function' ? label(item) : item[label] }));

export const employeeOption = (employee) => `${employee.name} (${employee.employeeId})`;

/** The id behind a populated or plain reference. */
export const idOf = (value) => value?._id ?? value ?? '';

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-10" -> "October 2026" */
export function monthLabel(value) {
  const [year, month] = String(value ?? '').split('-').map(Number);
  return MONTHS[month - 1] ? `${MONTHS[month - 1]} ${year}` : '';
}
