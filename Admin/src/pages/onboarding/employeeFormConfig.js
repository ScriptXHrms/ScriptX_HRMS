import { EMPLOYEE_TYPES } from '../../data/constants';

const isIntern = (values) => values.employeeType === 'Intern' || values.employeeType === 'Freelancer';

/** Steps of the employee form. `edit` hides fields that only apply when creating. */
export function employeeSteps({ departments, roles, shifts, editing }) {
  return [
    {
      id: 'basic',
      label: 'Basic Information',
      fields: [
        { name: 'name', label: 'Employee name', required: true },
        { name: 'email', label: 'Work email', type: 'email', required: true },
        ...(editing ? [] : [{ name: 'password', label: 'Password', type: 'password', required: true, autoComplete: 'new-password', hint: 'At least 8 characters.', validate: (v) => (v.length < 8 ? 'Password must be at least 8 characters.' : null) }]),
        { name: 'phone', label: 'Contact number', type: 'tel', required: true, validate: (v) => (/^\d{10}$/.test(v) ? null : 'Enter a 10-digit phone number.') },
        { name: 'personalEmail', label: 'Personal email', type: 'email' },
        { name: 'employeeType', label: 'Employee type', type: 'select', required: true, options: EMPLOYEE_TYPES },
        { name: 'experienceLevel', label: 'Experience level', type: 'select', options: ['Fresher', 'Experienced'] },
        { name: 'internDuration', label: 'Internship duration', type: 'select', options: ['3 Months', '6 Months', '12 Months'], show: isIntern },
        { name: 'department', label: 'Department', type: 'select', required: true, options: departments },
        { name: 'role', label: 'Role', type: 'select', required: true, options: (values) => roles.filter((r) => !values.department || String(r.department) === String(values.department)).map((r) => ({ value: r._id, label: r.name })) },
        { name: 'shift', label: 'Shift', type: 'select', required: true, options: shifts },
        { name: 'dateOfJoining', label: 'Date of joining', type: 'date', required: true },
        { name: 'confirmationDate', label: 'Confirmation date', type: 'date' },
      ],
    },
    {
      id: 'personal',
      label: 'Personal Info',
      fields: [
        { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE', 'OTHER'] },
        { name: 'maritalStatus', label: 'Marital status', type: 'select', options: ['Single', 'Married'] },
        { name: 'spouseName', label: 'Spouse name', show: (v) => v.maritalStatus === 'Married' },
        { name: 'fatherName', label: 'Father name' },
        { name: 'motherName', label: 'Mother name' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'pincode', label: 'Pincode', validate: (v) => (/^\d{6}$/.test(v) ? null : 'Enter a 6-digit pincode.') },
        { name: 'permanentAddress', label: 'Permanent address', type: 'textarea' },
        { name: 'permanentPincode', label: 'Permanent pincode', validate: (v) => (/^\d{6}$/.test(v) ? null : 'Enter a 6-digit pincode.') },
        { name: 'linkedIn', label: 'LinkedIn URL', type: 'url' },
        { name: 'skills', label: 'Skills', type: 'tags', placeholder: 'Add a skill and press Enter', span: 2 },
        { name: 'driveLink', label: 'Drive link', type: 'url', span: 2 },
      ],
    },
    {
      id: 'identity',
      label: 'ID, PF & ESI',
      fields: [
        { name: 'panNo', label: 'PAN number' },
        { name: 'aadharNo', label: 'Aadhaar number', validate: (v) => (/^\d{12}$/.test(v) ? null : 'Enter a 12-digit Aadhaar number.') },
        { name: 'passportNo', label: 'Passport no.' },
        { name: 'passportExpiry', label: 'Passport expiry', type: 'date' },
        { name: 'uanNo', label: 'UAN no.' },
        { name: 'epfoAccountNumber', label: 'EPFO account number' },
        { name: 'pfJoinDate', label: 'PF join date', type: 'date' },
        { name: 'pfExpiryDate', label: 'PF exit date', type: 'date' },
        { name: 'ipNumber', label: 'ESI IP number' },
        { name: 'insuranceNo', label: 'Insurance no.' },
        { name: 'insuranceDate', label: 'Insurance date', type: 'date' },
      ],
    },
    {
      id: 'bank',
      label: 'Bank & Salary',
      fields: [
        { name: 'paymentType', label: 'Salary paid by', type: 'select', required: true, options: ['BANK', 'CASH'] },
        { name: 'salaryAmount', label: 'Salary amount per month (CTC)', type: 'number', min: 0, show: (v) => !isIntern(v) },
        { name: 'studentAmount', label: 'Stipend per month', type: 'number', min: 0, show: isIntern },
        { name: 'bank.accountNo', label: 'Account number', show: (v) => v.paymentType === 'BANK' },
        { name: 'bank.bankName', label: 'Bank name', show: (v) => v.paymentType === 'BANK' },
        { name: 'bank.branch', label: 'Branch', show: (v) => v.paymentType === 'BANK' },
        { name: 'bank.ifscCode', label: 'IFSC code', show: (v) => v.paymentType === 'BANK' },
        { name: 'bank.gpayNumber', label: 'GPay number' },
      ],
    },
    {
      id: 'history',
      label: 'Contact & History',
      fields: [
        {
          name: 'emergencyContacts',
          label: 'Emergency contacts',
          type: 'repeater',
          itemLabel: 'contact',
          fields: [
            { name: 'fullName', label: 'Full name' },
            { name: 'contact', label: 'Contact' },
            { name: 'relation', label: 'Relation', type: 'select', options: ['Father', 'Mother', 'Spouse', 'Sibling', 'Friend'] },
          ],
        },
        {
          name: 'education',
          label: 'Education',
          type: 'repeater',
          itemLabel: 'education',
          fields: [
            { name: 'schoolName', label: 'Institute name' },
            { name: 'departmentName', label: 'Department name' },
            { name: 'endYear', label: 'Year of passing' },
          ],
        },
        {
          name: 'experience',
          label: 'Experience',
          type: 'repeater',
          itemLabel: 'experience',
          show: (v) => v.experienceLevel === 'Experienced',
          fields: [
            { name: 'jobTitle', label: 'Job title' },
            { name: 'companyName', label: 'Company name' },
            { name: 'companyIndustry', label: 'Industry' },
            { name: 'previousSalary', label: 'Previous salary' },
            { name: 'startWork', label: 'From', type: 'date' },
            { name: 'endWork', label: 'To', type: 'date' },
            { name: 'responsibilities', label: 'Responsibilities' },
          ],
        },
      ],
    },
  ];
}

export const EMPLOYEE_DEFAULTS = {
  employeeType: 'Employee',
  experienceLevel: 'Fresher',
  paymentType: 'BANK',
  skills: [],
  emergencyContacts: [],
  education: [],
  experience: [],
};
