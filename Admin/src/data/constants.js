/** Enumerations shared across pages. These match the API's enum values. */

export const TASK_CATEGORIES = ['SEO', 'Social Media', 'Content Writing', 'Graphic Design', 'Video Editing', 'Paid Ads', 'Email Marketing'];
export const TASK_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];
/** Employees take a task as far as In Review. An admin then marks it Done or sends it back to To Do. */
export const EMPLOYEE_TASK_STATUSES = ['To Do', 'In Progress', 'In Review'];
export const TESTER_STATUSES = ['Not Tested', 'Testing', 'Passed', 'Failed'];
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const ACTIVE_STATUSES = ['Active', 'Inactive'];
export const EMPLOYEE_TYPES = ['Employee', 'Intern', 'Freelancer', 'Part Time'];
export const REQUEST_SUBJECTS = ['Shift', 'Timing', 'Report', 'Technical', 'Stationary and Sync', 'Other'];
export const LEAVE_DURATIONS = ['Full Day', 'First Half', 'Second Half'];
export const RELIEVING_TYPES = ['Resignation', 'Termination', 'Absconding', 'Internship Completed'];
export const COUNTRIES = ['India', 'United States', 'United Kingdom', 'China', 'Russia', 'Brazil', 'Mexico', 'Nigeria', 'Pakistan', 'Bangladesh', 'Indonesia'];
export const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];
export const STATEMENT_LEDGERS = ['Expense', 'Income', 'Return Investment', 'Cash From Other Account'];
