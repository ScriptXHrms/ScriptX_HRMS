import { getSettings, Leave } from '../models/index.js';
import { dayKey } from './dates.js';

/** Leave types that draw down a yearly allowance, and the setting holding it. */
const ALLOWANCES = { CL: 'casualLeave', SL: 'sickLeave', COM: 'compensatoryLeave', UHL: 'unhappyLeave' };

export async function leaveBalance(employeeId) {
  const settings = await getSettings();
  const year = dayKey().slice(0, 4);
  const month = dayKey().slice(0, 7);
  const leaves = await Leave.find({ employee: employeeId, startDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` } }).lean();

  const approved = leaves.filter((l) => l.status === 'Approved');
  const usedOf = (code) => approved.filter((l) => l.category === 'Leave' && l.shortCode === code).reduce((total, l) => total + l.days, 0);
  const wfhUsed = leaves.filter((l) => ['Approved', 'Pending'].includes(l.status) && l.category === 'WFH' && l.startDate.startsWith(month)).reduce((total, l) => total + l.days, 0);

  const allowance = Object.values(ALLOWANCES).reduce((total, key) => total + settings[key], 0);
  const used = Object.keys(ALLOWANCES).reduce((total, code) => total + usedOf(code), 0);

  return {
    allowance,
    used,
    available: Math.max(0, allowance - used),
    pendingCount: leaves.filter((l) => l.status === 'Pending').length,
    casual: { allowance: settings.casualLeave, used: usedOf('CL') },
    sick: { allowance: settings.sickLeave, used: usedOf('SL') },
    wfh: { allowance: settings.wfhCount, used: wfhUsed },
    permissionHours: settings.permissionHours,
  };
}
