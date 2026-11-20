/** Starter policy text shown in the Employee Portal. Edit it from Admin > Settings > Policies. */
export const POLICIES = [
  {
    group: 'Company',
    key: 'intern',
    title: 'Intern Policy',
    order: 1,
    body: `Interns report to their department lead and follow the same working hours as full-time staff.

Attendance below 90% in a month is reviewed with the reporting manager.

Stipends are paid by the 7th of the following month, pro-rated by payable days.`,
  },
  {
    group: 'Company',
    key: 'conversion',
    title: 'Conversion Policy',
    order: 2,
    body: `Interns are reviewed one month before their internship ends.

Conversion to a full-time role depends on performance, attendance and open positions.

Salary for converted interns is effective from the first day of the following month.`,
  },
  {
    group: 'Company',
    key: 'experience',
    title: 'Experience Policy',
    order: 3,
    body: `Experience letters are issued after the relieving checklist is complete.

Employees must serve their notice period or have it waived in writing.`,
  },
  {
    group: 'Company',
    key: 'leave',
    title: 'Leave Policy',
    order: 4,
    body: `Apply for leave at least two working days in advance, except for sickness or emergencies.

Casual and sick leave allowances are set in HR settings and reset every calendar year.

Leave without approval is treated as loss of pay.

Permission is limited to the hours set in HR settings, and must be approved before it is taken.

Work from home is limited each month and needs approval from HR.`,
  },
];
