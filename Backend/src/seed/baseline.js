/** Records the app needs in every database, demo or real. CL, SL, COM and UHL draw down leave allowances. */
export const LEAVE_TYPES = [
  { name: 'Casual Leave', shortCode: 'CL', paid: true },
  { name: 'Sick Leave', shortCode: 'SL', paid: true },
  { name: 'Compensatory Leave', shortCode: 'COM', paid: true },
  { name: 'Unhappy Leave', shortCode: 'UHL', paid: true },
  { name: 'Unpaid Leave', shortCode: 'UL', paid: false },
];
