import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });
const fileSchema = new Schema({ name: String, url: String, size: Number }, { _id: true });
const opts = { timestamps: true };

/* ------------------------------ Accounts ------------------------------ */

export const AdminUser = model(
  'AdminUser',
  new Schema(
    {
      name: { type: String, required: true },
      fullName: String,
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true, select: false },
      designation: { type: String, default: 'Administrator' },
      department: { type: String, default: 'Human Resources' },
      resetCode: { type: String, select: false },
      resetExpires: { type: Date, select: false },
    },
    opts,
  ),
);

export const Department = model('Department', new Schema({ name: { type: String, required: [true, 'Department name is required.'], unique: true, trim: true }, status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' } }, opts));

export const Role = model(
  'Role',
  new Schema(
    {
      name: { type: String, required: [true, 'Role name is required.'], trim: true },
      department: { ...ref('Department'), required: [true, 'Department is required.'] },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    opts,
  ),
);

export const Shift = model(
  'Shift',
  new Schema(
    {
      name: { type: String, required: [true, 'Shift name is required.'], unique: true, trim: true },
      from: { type: String, required: [true, 'Shift start is required.'] },
      to: { type: String, required: [true, 'Shift end is required.'] },
      color: { type: String, default: '#40108C' },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    opts,
  ),
);

const employeeSchema = new Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Employee name is required.'], trim: true },
    email: { type: String, required: [true, 'Email is required.'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: String,
    personalEmail: String,
    photo: String,
    employeeType: { type: String, enum: ['Employee', 'Intern', 'Freelancer', 'Part Time'], default: 'Employee' },
    experienceLevel: { type: String, enum: ['Fresher', 'Experienced'], default: 'Fresher' },
    internDuration: String,
    department: ref('Department'),
    role: ref('Role'),
    shift: ref('Shift'),
    dateOfJoining: String,
    confirmationDate: String,
    dateOfBirth: String,
    gender: String,
    maritalStatus: String,
    spouseName: String,
    fatherName: String,
    motherName: String,
    address: String,
    pincode: String,
    permanentAddress: String,
    permanentPincode: String,
    linkedIn: String,
    driveLink: String,
    skills: [String],
    panNo: String,
    aadharNo: String,
    passportNo: String,
    passportExpiry: String,
    uanNo: String,
    epfoAccountNumber: String,
    pfJoinDate: String,
    pfExpiryDate: String,
    ipNumber: String,
    insuranceNo: String,
    insuranceDate: String,
    bank: { accountNo: String, bankName: String, branch: String, ifscCode: String, gpayNumber: String },
    paymentType: { type: String, enum: ['BANK', 'CASH'], default: 'BANK' },
    salaryAmount: { type: Number, default: 0 },
    studentAmount: { type: Number, default: 0 },
    emergencyContacts: [{ fullName: String, contact: String, relation: String }],
    education: [{ schoolName: String, departmentName: String, endYear: String }],
    experience: [{ jobTitle: String, companyIndustry: String, companyName: String, previousSalary: String, startWork: String, endWork: String, responsibilities: String }],
    documents: [{ title: String, files: [fileSchema] }],
    status: { type: String, enum: ['Active', 'Relieving', 'Relieved'], default: 'Active' },
    relieving: {
      relievingType: { type: String, enum: ['Resignation', 'Termination', 'Absconding', 'Internship Completed', ''], default: '' },
      resignationEmailDate: String,
      noticePeriod: String,
      lastWorkingDate: String,
      reason: String,
      relievedOn: String,
      checklist: [{ item: String, done: { type: Boolean, default: false } }],
    },
    resetCode: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  opts,
);
employeeSchema.index({ status: 1, name: 1 });
export const Employee = model('Employee', employeeSchema);

export const Privilege = model(
  'Privilege',
  new Schema(
    {
      employee: { ...ref('Employee'), required: true, unique: true },
      modules: [{ _id: false, key: String, permission: { type: String, enum: ['view', 'manage'], default: 'view' } }],
    },
    opts,
  ),
);

export const Counter = model('Counter', new Schema({ _id: String, value: { type: Number, default: 0 } }));

export async function nextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { value: 1 } }, { new: true, upsert: true });
  return counter.value;
}

/* ------------------------- Attendance and leave ------------------------ */

const attendanceSchema = new Schema(
  {
    employee: { ...ref('Employee'), required: true },
    date: { type: String, required: true },
    shift: ref('Shift'),
    shiftName: String,
    shiftFrom: String,
    shiftTo: String,
    workType: { type: String, enum: ['Office', 'WFH', 'On Duty'], default: 'Office' },
    entries: [{ _id: false, reason: { type: String, enum: ['Login', 'Break Out', 'Break In', 'Logout'] }, time: Date }],
    isLate: { type: Boolean, default: false },
    lateMinutes: { type: Number, default: 0 },
    markedBy: { type: String, enum: ['self', 'admin'], default: 'self' },
    // Set when nobody logged out and the day was closed at 11:59 PM.
    autoLogout: { type: Boolean, default: false },
    notes: String,
    editLog: [{ _id: false, by: String, at: Date, note: String }],
  },
  opts,
);
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
export const Attendance = model('Attendance', attendanceSchema);

export const LeaveType = model(
  'LeaveType',
  new Schema(
    {
      name: { type: String, required: [true, 'Leave type is required.'], unique: true, trim: true },
      shortCode: { type: String, required: [true, 'Short code is required.'], trim: true },
      paid: { type: Boolean, default: true },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    opts,
  ),
);

const leaveSchema = new Schema(
  {
    employee: { ...ref('Employee'), required: [true, 'Employee is required.'] },
    category: { type: String, enum: ['Leave', 'Permission', 'WFH'], default: 'Leave' },
    leaveType: String,
    shortCode: String,
    duration: { type: String, enum: ['Full Day', 'First Half', 'Second Half', 'Hours'], default: 'Full Day' },
    startDate: { type: String, required: [true, 'Start date is required.'] },
    endDate: { type: String, required: [true, 'End date is required.'] },
    startTime: String,
    endTime: String,
    days: { type: Number, default: 1 },
    reason: { type: String, required: [true, 'Reason is required.'] },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
    note: String,
    attachment: fileSchema,
    createdBy: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    decidedBy: String,
    decidedAt: Date,
  },
  opts,
);
leaveSchema.index({ employee: 1, startDate: 1 });
leaveSchema.index({ status: 1, category: 1 });
export const Leave = model('Leave', leaveSchema);

export const EmployeeRequest = model(
  'EmployeeRequest',
  new Schema(
    {
      employee: { ...ref('Employee'), required: true },
      date: { type: String, required: [true, 'Date is required.'] },
      subject: { type: String, enum: ['Shift', 'Timing', 'Report', 'Technical', 'Stationary and Sync', 'Other'], required: [true, 'Subject is required.'] },
      customSubject: String,
      message: { type: String, required: [true, 'Message is required.'] },
      shiftType: { type: String, enum: ['Single', 'Multiple', ''], default: '' },
      shift: ref('Shift'),
      startTime: String,
      endTime: String,
      fromDate: String,
      toDate: String,
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      notes: String,
      decidedBy: String,
    },
    opts,
  ),
);

export const Holiday = model(
  'Holiday',
  new Schema({ date: { type: String, required: [true, 'Date is required.'], unique: true }, reason: { type: String, required: [true, 'Reason is required.'], trim: true } }, opts),
);

export const Announcement = model(
  'Announcement',
  new Schema(
    {
      date: { type: String, required: [true, 'Date is required.'] },
      expiryDate: { type: String, required: [true, 'Expiry date is required.'] },
      // Optional headline; the dashboard falls back to the message's first sentence.
      title: { type: String, trim: true },
      message: { type: String, required: [true, 'Message is required.'] },
      visible: { type: String, enum: ['Everyone', 'Employees', 'Admins'], default: 'Everyone' },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    opts,
  ),
);

export const Protocol = model(
  'Protocol',
  new Schema({ group: { type: String, enum: ['Company', 'DevOps'], default: 'Company' }, key: { type: String, required: true, unique: true }, title: { type: String, required: true }, body: { type: String, default: '' }, order: { type: Number, default: 0 } }, opts),
);

/* ---------------------------- Projects / tasks --------------------------- */

export const Client = model(
  'Client',
  new Schema(
    {
      client_name: { type: String, required: [true, 'Client name is required.'], trim: true },
      company_name: { type: String, required: [true, 'Company name is required.'], trim: true },
      trader_name: String,
      source: String,
      email: { type: String, required: [true, 'Email is required.'], unique: true, lowercase: true, trim: true },
      phone_number: { type: String, required: [true, 'Phone number is required.'] },
      address: String,
      gst: String,
      country: { type: String, default: 'India' },
      contact_person: String,
      contact_person_role: String,
      website: String,
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
      notes: String,
    },
    opts,
  ),
);

export const Project = model(
  'Project',
  new Schema(
    {
      name: { type: String, required: [true, 'Project name is required.'], unique: true, trim: true },
      description: String,
      client: { ...ref('Client'), required: [true, 'Client is required.'] },
      manager: ref('Employee'),
      team: [ref('Employee')],
      startDate: String,
      endDate: String,
      status: { type: String, enum: ['Active', 'Inactive', 'Completed', 'On Hold'], default: 'Active' },
      priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
      budget: { type: Number, default: 0 },
      currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
      paymentType: String,
      gst: String,
      notes: String,
      documents: [fileSchema],
    },
    opts,
  ),
);

const actorSchema = { _id: false, kind: { type: String, enum: ['admin', 'employee'] }, id: Schema.Types.ObjectId, name: String };

export const TASK_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const taskSchema = new Schema(
  {
    taskId: { type: String, unique: true },
    title: { type: String, required: [true, 'Task title is required.'], trim: true },
    description: String,
    project: { ...ref('Project'), required: [true, 'Project is required.'] },
    assignedTo: [ref('Employee')],
    category: String,
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: TASK_STATUSES, default: 'To Do' },
    testerStatus: { type: String, enum: ['Not Tested', 'Testing', 'Passed', 'Failed'], default: 'Not Tested' },
    startDate: String,
    dueDate: String,
    startTime: String,
    endTime: String,
    paused: { type: Boolean, default: false },
    pauseComment: String,
    workLog: [{ _id: false, start: Date, end: Date }],
    documents: [fileSchema],
    createdBy: new Schema(actorSchema),
  },
  opts,
);
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
export const Task = model('Task', taskSchema);

export const SubTask = model(
  'SubTask',
  new Schema(
    {
      task: { ...ref('Task'), required: true },
      title: { type: String, required: [true, 'Sub task title is required.'], trim: true },
      assignedTo: ref('Employee'),
      status: { type: String, enum: TASK_STATUSES, default: 'To Do' },
      priority: { type: String, enum: PRIORITIES, default: 'Medium' },
      dueDate: String,
    },
    opts,
  ),
);

export const TaskComment = model(
  'TaskComment',
  new Schema({ task: { ...ref('Task'), required: true }, message: { type: String, default: '' }, files: [fileSchema], author: new Schema(actorSchema) }, opts),
);

export const TaskLog = model('TaskLog', new Schema({ task: { ...ref('Task'), required: true }, action: String, detail: String, actor: new Schema(actorSchema) }, opts));

const dailyReportSchema = new Schema(
  {
    employee: { ...ref('Employee'), required: true },
    date: { type: String, required: [true, 'Date is required.'] },
    tasks: [{ project: ref('Project'), task: String, description: String, status: { type: String, default: 'In Progress' }, startTime: String, endTime: String }],
  },
  opts,
);
dailyReportSchema.index({ employee: 1, date: 1 }, { unique: true });
export const DailyReport = model('DailyReport', dailyReportSchema);

/* ------------------------------- Finance ------------------------------- */

export const FinanceAccount = model(
  'FinanceAccount',
  new Schema({ name: { type: String, required: [true, 'Account name is required.'], unique: true, trim: true }, accountType: { type: String, default: 'Bank' }, status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' } }, opts),
);

const ledgerEntry = {
  date: { type: String, required: [true, 'Date is required.'] },
  month: String,
  account: { ...ref('FinanceAccount'), required: [true, 'Account is required.'] },
  amount: { type: Number, required: [true, 'Amount is required.'], min: [0.01, 'Amount must be greater than zero.'] },
  source: String,
  paymentMode: { type: String, default: '' },
  narration: { type: String, default: '' },
  description: { type: String, default: '' },
  notes: String,
  clientPaymentRef: ref('ClientPayment'),
  installmentDate: String,
};
export const Income = model('Income', new Schema(ledgerEntry, opts));
export const Expense = model('Expense', new Schema(ledgerEntry, opts));

export const CLIENT_PAYMENT_TYPES = ['One Time', 'Monthly', 'Quarterly', 'Quartly', 'Half Yearly', 'Yearly', 'Full Payment', 'Recurring'];

export const ClientPayment = model(
  'ClientPayment',
  new Schema(
    {
      client: { ...ref('Client'), required: [true, 'Client is required.'] },
      project: ref('Project'),
      budget: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      advance: { type: Number, default: 0 },
      paymentType: { type: String, enum: CLIENT_PAYMENT_TYPES, default: 'One Time' },
      gst: { type: Boolean, default: false },
      oneTimeMonth: String,
      oneTimeDay: String,
      monthlyMonth: String,
      monthlyDay: String,
      quarterlyMonth1: String,
      quarterlyDay1: String,
      quarterlyMonth2: String,
      quarterlyDay2: String,
      quarterlyMonth3: String,
      quarterlyDay3: String,
      halfYearlyMonth1: String,
      halfYearlyDay1: String,
      halfYearlyMonth2: String,
      halfYearlyDay2: String,
      yearlyYear: String,
      yearlyMonth: String,
      yearlyDay: String,
      scheduleSummary: String,
      payments: [{ date: String, amount: Number, reference_no: String }],
      status: { type: String, enum: ['Pending', 'Partial', 'Completed'], default: 'Pending' },
      notes: String,
    },
    opts,
  ),
);

export const BankStatement = model(
  'BankStatement',
  new Schema(
    {
      date: { type: String, required: [true, 'Date is required.'] },
      narration: { type: String, required: [true, 'Narration is required.'] },
      reference_no: String,
      ledger: { type: String, default: '' },
      accountType: { type: String, default: '' },
      amount: { type: Number, required: [true, 'Amount is required.'] },
      type: { type: String, enum: ['Credit', 'Debit'], required: [true, 'Type is required.'] },
      account: { ...ref('FinanceAccount'), required: [true, 'Account is required.'] },
      lenderName: String,
      loanName: String,
      notes: String,
      sourceModel: { type: String, default: '' },
      sourceRef: { type: Schema.Types.ObjectId, default: null },
    },
    opts,
  ),
);

export const RECURRING_TYPES = ['Saving', 'Loan', 'Gold Loan', 'Subscription', 'Office', 'Credit Card', 'House Expense'];

export const RecurringPayment = model(
  'RecurringPayment',
  new Schema(
    {
      account: { ...ref('FinanceAccount'), required: [true, 'Account is required.'] },
      name: { type: String, required: [true, 'Name is required.'], trim: true },
      lenderName: String,
      paymentType: { type: String, enum: RECURRING_TYPES, required: true },
      recurringType: { type: String, default: 'Monthly' },
      paymentMode: String,
      amount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      interestRate: { type: Number, default: 0 },
      monthlyInterest: { type: Number, default: 0 },
      emiAmount: { type: Number, default: 0 },
      totalEmi: { type: Number, default: 0 },
      dueDay: Number,
      startDate: String,
      endDate: String,
      status: { type: String, enum: ['In Progress', 'Completed', 'Pending'], default: 'In Progress' },
      notes: String,
      logs: [{ date: String, amount: Number, note: String }],
    },
    opts,
  ),
);

export const Subscription = model(
  'Subscription',
  new Schema(
    {
      name: { type: String, required: [true, 'Name is required.'], trim: true },
      gstNumber: String,
      url: String,
      recurringType: { type: String, enum: ['Monthly', 'Quarterly', 'Half Year', 'Yearly'], default: 'Monthly' },
      dueDate: String,
      amount: { type: Number, default: 0 },
      expiryDate: String,
      username: String,
      email: String,
      passwordEnc: { type: String, select: false },
      status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    opts,
  ),
);

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, unique: true },
    client: { ...ref('Client'), required: [true, 'Client is required.'] },
    project: ref('Project'),
    invoiceType: { type: String, enum: ['Tax Invoice', 'Performa Invoice', 'Sales Invoice', 'Export Invoice'], default: 'Tax Invoice' },
    invoiceDate: { type: String, required: [true, 'Invoice date is required.'] },
    dueDate: String,
    currency: { type: String, default: 'INR' },
    items: [{ _id: false, description: String, details: String, hsnCode: String, quantity: Number, rate: Number, amount: Number }],
    subTotal: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
    paidDate: String,
    notes: String,
    paymentMethod: { type: String, default: '' },
    paymentInfo: { type: String, default: '' },
    signatureImage: { type: String, default: '' },
    signatureName: { type: String, default: '' },
    signatureDesignation: { type: String, default: '' },
  },
  opts,
);
export const Invoice = model('Invoice', invoiceSchema);

export const PayrollOverride = model(
  'PayrollOverride',
  new Schema(
    {
      employee: { ...ref('Employee'), required: true },
      year: Number,
      month: Number,
      field: { type: String, enum: ['payableDays', 'lop', 'lateLop', 'tds'], required: true },
      value: { type: Number, required: true },
      note: { type: String, required: [true, 'A note is required for manual changes.'] },
      by: String,
    },
    opts,
  ).index({ employee: 1, year: 1, month: 1, field: 1 }, { unique: true }),
);

export const SalaryPayment = model(
  'SalaryPayment',
  new Schema(
    { employee: { ...ref('Employee'), required: true }, year: Number, month: Number, status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' }, paymentDate: String, note: String, netPaid: Number },
    opts,
  ).index({ employee: 1, year: 1, month: 1 }, { unique: true }),
);

/* -------------------------------- Assets -------------------------------- */

export const AssetCategory = model('AssetCategory', new Schema({ name: { type: String, required: [true, 'Category is required.'], unique: true, trim: true } }, opts));
export const AssetSubCategory = model('AssetSubCategory', new Schema({ name: { type: String, required: [true, 'Sub category is required.'], trim: true }, category: { ...ref('AssetCategory'), required: [true, 'Category is required.'] } }, opts));

export const Asset = model(
  'Asset',
  new Schema(
    {
      invoiceNumber: { type: String, required: [true, 'Invoice number is required.'] },
      purchasedDate: { type: String, required: [true, 'Purchased date is required.'] },
      ledger: { type: String, required: [true, 'Ledger is required.'] },
      category: { ...ref('AssetCategory'), required: [true, 'Category is required.'] },
      subCategory: { ...ref('AssetSubCategory'), required: [true, 'Sub category is required.'] },
      title: { type: String, required: [true, 'Title is required.'] },
      depreciationPercentage: { type: Number, default: 0 },
      quantity: { type: Number, required: [true, 'Quantity is required.'], min: 1 },
      rate: { type: Number, required: [true, 'Rate is required.'] },
      gstRate: { type: Number, default: 18 },
      taxable: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      invoiceValue: { type: Number, default: 0 },
      warrantyYears: { type: Number, default: 0 },
      disposedDate: String,
      assignedTo: ref('Employee'),
    },
    opts,
  ),
);

/* ------------------------------- Settings ------------------------------ */

export const Settings = model(
  'Settings',
  new Schema(
    {
      gstPercent: { type: Number, default: 18 },
      basicPercent: { type: Number, default: 50 },
      hraPercent: { type: Number, default: 40 },
      medicalAllowance: { type: Number, default: 1250 },
      conveyanceAllowance: { type: Number, default: 1600 },
      eePfPercent: { type: Number, default: 12 },
      erPfPercent: { type: Number, default: 12 },
      eeEsiPercent: { type: Number, default: 0.75 },
      erEsiPercent: { type: Number, default: 3.25 },
      casualLeave: { type: Number, default: 12 },
      sickLeave: { type: Number, default: 6 },
      compensatoryLeave: { type: Number, default: 0 },
      permissionHours: { type: Number, default: 2 },
      wfhCount: { type: Number, default: 4 },
      unhappyLeave: { type: Number, default: 1 },
      lateGraceMinutes: { type: Number, default: 10 },
      lateWarningMinutes: { type: Number, default: 10 },
      lateRedMinutes: { type: Number, default: 30 },
      lateLopDays: { type: Number, default: 3 },
      lateLopType: { type: String, enum: ['Half Day', 'Full Day'], default: 'Half Day' },
      dateFormat: { type: String, default: 'DD MMM YYYY' },
      timeFormat: { type: String, default: '12-Hour' },
      // Printed on the back of the employee ID card.
      companyName: { type: String, default: 'ScriptX', trim: true },
      companyPhone: { type: String, default: '', trim: true },
      companyEmail: { type: String, default: '', trim: true },
      companyWebsite: { type: String, default: '', trim: true },
      companyAddress: { type: String, default: '', trim: true },
      // Invoice signature & payment settings
      enableSignature: { type: Boolean, default: true },
      signatureImage: { type: String, default: '' },
      signatureName: { type: String, default: 'Jhon Donate', trim: true },
      signatureDesignation: { type: String, default: 'Accounts Manager', trim: true },
      paymentMethod: { type: String, default: 'Bank Transfer / Western Union', trim: true },
      paymentInfo: { type: String, default: '', trim: true },
      invoiceTerms: { type: String, default: 'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.', trim: true },
    },
    opts,
  ),
);

export async function getSettings() {
  return (await Settings.findOne().lean()) ?? (await Settings.create({})).toObject();
}

export const Notification = model(
  'Notification',
  new Schema(
    {
      audience: { type: String, enum: ['admin', 'employee'], required: true },
      employee: ref('Employee'),
      type: { type: String, default: 'alert' },
      title: String,
      message: String,
      link: String,
      read: { type: Boolean, default: false },
    },
    opts,
  ).index({ audience: 1, employee: 1, createdAt: -1 }),
);
