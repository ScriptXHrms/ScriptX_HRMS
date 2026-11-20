/**
 * Loads demo data into a LOCAL database. It wipes every collection first, so it
 * refuses to run against anything but localhost.
 *
 *   npm run seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import * as db from '../models/index.js';
import { dayKey, eachDay, isSunday, shiftDay } from '../utils/dates.js';
import { LEAVE_TYPES } from './baseline.js';
import { POLICIES } from './policies.js';

const {
  AdminUser, Announcement, Asset, AssetCategory, AssetSubCategory, Attendance, BankStatement, Client, ClientPayment, Counter, DailyReport,
  Department, Employee, EmployeeRequest, Expense, FinanceAccount, Holiday, Income, Invoice, Leave, LeaveType, Privilege, Project, Protocol,
  RecurringPayment, Role, Settings, Shift, Subscription, SubTask, Task, TaskComment, TaskLog,
} = db;

const uri = process.env.MONGO_URI ?? '';
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(uri)) {
  console.error('Refusing to seed: MONGO_URI is not a localhost database.');
  process.exit(1);
}

// Fixed sequence so a re-seed produces the same data.
let state = 20261031;
const random = () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => min + Math.floor(random() * (max - min + 1));

const today = dayKey();
const ago = (days) => shiftDay(today, -days);
const ahead = (days) => shiftDay(today, days);
const at = (date, hours, minutes) => new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`);

const DEPARTMENTS = {
  'Social Media Marketing': ['Social Media Manager', 'Digital Marketing Executive', 'Social Media Strategist', 'Community Manager'],
  SEO: ['SEO Specialist', 'SEO Analyst', 'Link Building Executive'],
  'Content Writing': ['Content Strategist', 'Senior Content Writer', 'Copywriter'],
  'Graphic Design': ['Senior Graphic Designer', 'Graphic Designer', 'Motion Designer'],
  'Video Production': ['Video Editor', 'Videographer'],
  'Paid Ads': ['Performance Marketing Lead', 'Paid Ads Executive'],
  'Email Marketing': ['Email Marketing Specialist', 'CRM Executive'],
  'Human Resources': ['HR Manager', 'HR Executive'],
};

const PEOPLE = [
  'Logesh', 'Priya Raman', 'Arjun Mehta', 'Kavya Iyer', 'Rahul Nair', 'Sneha Reddy', 'Vikram Singh', 'Ananya Das', 'Karthik Subramanian', 'Divya Menon',
  'Rohit Sharma', 'Meera Krishnan', 'Aditya Rao', 'Nisha Patel', 'Suresh Kumar', 'Pooja Hegde', 'Manoj Pillai', 'Lakshmi Narayan', 'Harish Babu', 'Swathi Rajan',
  'Naveen Prasad', 'Deepa Mohan', 'Ajay Varma', 'Shruti Bose', 'Ganesh Moorthy', 'Isha Kapoor', 'Tarun Joshi', 'Revathi Sekar', 'Pranav Desai', 'Aishwarya Lakshmi',
  'Siddharth Jain', 'Keerthana Raj', 'Varun Gupta', 'Bhavana Shetty', 'Dinesh Karthik', 'Monica George', 'Sanjay Dutt', 'Vidya Balan', 'Ramesh Chandran', 'Tanvi Shah',
  'Abhishek Roy', 'Janani Murali', 'Praveen Kumar', 'Sowmya Anand', 'Yash Malhotra', 'Gayathri Devi', 'Kiran Bedi', 'Nithya Sri',
];

const TASK_TITLES = [
  ['Monthly SEO audit', 'SEO'], ['Instagram reels for festive offer', 'Social Media'], ['Landing page copy refresh', 'Content Writing'], ['Google Ads campaign optimisation', 'Paid Ads'],
  ['Brand guideline poster set', 'Graphic Design'], ['Product launch teaser video', 'Video Editing'], ['Newsletter for November', 'Email Marketing'], ['Backlink outreach batch', 'SEO'],
  ['LinkedIn thought leadership posts', 'Social Media'], ['Blog: local SEO checklist', 'Content Writing'], ['Meta retargeting creatives', 'Paid Ads'], ['Website banner redesign', 'Graphic Design'],
  ['Client testimonial edit', 'Video Editing'], ['Drip campaign setup', 'Email Marketing'], ['Keyword gap analysis', 'SEO'], ['Content calendar for December', 'Social Media'],
  ['Case study write-up', 'Content Writing'], ['YouTube ads A/B test', 'Paid Ads'], ['Carousel templates', 'Graphic Design'], ['Podcast highlight clips', 'Video Editing'],
  ['Cart abandonment emails', 'Email Marketing'], ['Technical SEO fixes', 'SEO'], ['Influencer shortlist', 'Social Media'], ['Press release draft', 'Content Writing'],
];

const CLIENTS = [
  ['Asha Verma', 'Bloom Organics', 'asha@bloomorganics.in', 'Referral'], ['Daniel Thomas', 'UrbanNest Realty', 'daniel@urbannest.in', 'Website'],
  ['Farah Khan', 'FitLife Gyms', 'farah@fitlife.in', 'LinkedIn'], ['Mohan Raj', 'SpiceRoute Foods', 'mohan@spiceroute.in', 'Referral'],
  ['Neha Arora', 'Lumina Skincare', 'neha@luminaskin.in', 'Instagram'], ['Peter Paul', 'NorthStar Academy', 'peter@northstar.edu.in', 'Website'],
];

async function clearAll() {
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
}

async function seedOrganisation() {
  const departments = await Department.insertMany(Object.keys(DEPARTMENTS).map((name) => ({ name })));
  const roleDocs = departments.flatMap((department) => DEPARTMENTS[department.name].map((name) => ({ name, department: department._id })));
  const roles = await Role.insertMany(roleDocs);
  const shifts = await Shift.insertMany([
    { name: 'General Shift', from: '09:30', to: '18:30', color: '#40108C' },
    { name: 'Early Shift', from: '07:00', to: '16:00', color: '#16A34A' },
    { name: 'Evening Shift', from: '13:00', to: '22:00', color: '#EA580C' },
  ]);
  await LeaveType.insertMany(LEAVE_TYPES);
  await Settings.create({});
  return { departments, roles, shifts };
}

async function seedPeople({ departments, roles, shifts }) {
  await AdminUser.create({
    name: 'Admin',
    fullName: 'ScriptX Admin',
    email: 'admin@demo.com',
    password: await bcrypt.hash('Admin@123', 10),
    designation: 'HR & Operations Admin',
    department: 'Human Resources',
  });

  const employeePassword = await bcrypt.hash('Employee@123', 10);
  const docs = PEOPLE.map((name, index) => {
    const department = index === PEOPLE.length - 1 || index === PEOPLE.length - 2 ? departments.at(-1) : departments[index % (departments.length - 1)];
    const role = pick(roles.filter((r) => String(r.department) === String(department._id)));
    const isIntern = index > 0 && index % 11 === 0;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
    const salary = between(22, 75) * 1000;
    return {
      employeeId: `SX-${String(index + 1).padStart(3, '0')}`,
      name,
      email: index === 0 ? 'employee@demo.com' : `${slug}@scriptx.in`,
      password: employeePassword,
      phone: `9${between(100000000, 999999999)}`,
      employeeType: isIntern ? 'Intern' : 'Employee',
      experienceLevel: index % 3 === 0 ? 'Fresher' : 'Experienced',
      internDuration: isIntern ? '6 Months' : undefined,
      department: department._id,
      role: role._id,
      shift: index % 13 === 5 ? shifts[1]._id : index % 17 === 6 ? shifts[2]._id : shifts[0]._id,
      dateOfJoining: ago(between(120, 1400)),
      dateOfBirth: index % 16 === 1 ? `${between(1990, 2001)}-${ahead(index % 20).slice(5)}` : `${between(1988, 2002)}-${String(between(1, 12)).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}`,
      gender: index % 2 === 0 ? 'MALE' : 'FEMALE',
      maritalStatus: index % 3 === 0 ? 'Married' : 'Single',
      fatherName: 'Father name',
      address: `${between(1, 200)}, Anna Nagar, Chennai`,
      pincode: '600040',
      skills: ['Marketing', 'Client Servicing'],
      panNo: `ABCDE${between(1000, 9999)}F`,
      uanNo: String(between(100000000, 999999999)),
      bank: { accountNo: String(between(100000000, 999999999)), bankName: 'HDFC Bank', branch: 'Anna Nagar', ifscCode: 'HDFC0001234' },
      paymentType: 'BANK',
      salaryAmount: isIntern ? 0 : salary,
      studentAmount: isIntern ? 12000 : 0,
      emergencyContacts: [{ fullName: 'Parent', contact: `9${between(100000000, 999999999)}`, relation: 'Father' }],
      education: [{ schoolName: 'Anna University', departmentName: 'B.Com', endYear: String(between(2010, 2023)) }],
    };
  });
  // Relieving and relieved examples.
  docs[44].status = 'Relieving';
  docs[44].relieving = {
    relievingType: 'Resignation',
    resignationEmailDate: ago(20),
    noticePeriod: '30 days',
    lastWorkingDate: ahead(10),
    reason: 'Higher studies',
    checklist: ['Handover completed', 'Company assets returned', 'Accounts and access revoked', 'Final settlement processed', 'Relieving letter issued'].map((item, i) => ({ item, done: i === 0 })),
  };
  docs[45].status = 'Relieved';
  docs[45].relieving = {
    relievingType: 'Resignation',
    resignationEmailDate: ago(70),
    noticePeriod: '30 days',
    lastWorkingDate: ago(40),
    relievedOn: ago(40),
    reason: 'Relocation',
    checklist: ['Handover completed', 'Company assets returned'].map((item) => ({ item, done: true })),
  };

  const employees = await Employee.insertMany(docs);
  await Counter.create({ _id: 'employee', value: employees.length });

  const hr = employees.find((e) => e.name === 'Gayathri Devi') ?? employees.at(-3);
  await Privilege.create({
    employee: employees.find((e) => e.status === 'Active' && String(e.department) === String(departments.at(-1)._id))?._id ?? hr._id,
    modules: [
      { key: 'dashboard', permission: 'view' },
      { key: 'onboarding', permission: 'manage' },
      { key: 'attendance', permission: 'manage' },
      { key: 'leave', permission: 'manage' },
      { key: 'wfh', permission: 'manage' },
      { key: 'requests', permission: 'manage' },
    ],
  });
  return employees.filter((e) => e.status !== 'Relieved');
}

async function seedLeaves(employees) {
  const reasons = ['Family function', 'Not feeling well', 'Personal work', 'Medical appointment'];
  const leaves = [];
  const approvedOn = new Map();

  // Today's approved leave and WFH give the dashboard realistic exceptions.
  const onLeaveToday = employees.slice(10, 12);
  onLeaveToday.forEach((employee) => {
    leaves.push({ employee: employee._id, category: 'Leave', leaveType: 'Casual Leave', shortCode: 'CL', startDate: today, endDate: today, days: 1, reason: pick(reasons), status: 'Approved', decidedBy: 'Admin', decidedAt: new Date() });
    approvedOn.set(`${employee._id}|${today}`, true);
  });
  employees.slice(12, 17).forEach((employee) => {
    leaves.push({ employee: employee._id, category: 'WFH', leaveType: 'Work From Home', shortCode: 'WFH', startDate: today, endDate: today, days: 1, reason: 'Internet installation at home', status: 'Approved', decidedBy: 'Admin', decidedAt: new Date() });
  });

  // History, with the demo employee included so the employee portal has data.
  [employees[0], ...employees.slice(1, 30)].forEach((employee, index) => {
    const offset = between(3, 28);
    const start = ago(offset);
    if (isSunday(start)) return;
    const sick = index % 3 === 0;
    leaves.push({
      employee: employee._id, category: 'Leave', leaveType: sick ? 'Sick Leave' : 'Casual Leave', shortCode: sick ? 'SL' : 'CL',
      startDate: start, endDate: start, days: 1, reason: pick(reasons), status: index % 7 === 6 ? 'Rejected' : 'Approved', note: index % 7 === 6 ? 'Client delivery that week' : undefined, decidedBy: 'Admin', decidedAt: new Date(),
    });
    if (index % 7 !== 6) approvedOn.set(`${employee._id}|${start}`, true);
  });

  // A fixed history for the demo employee, whichever days the sequence lands on.
  [[12, 'Casual Leave', 'CL', 'Approved'], [26, 'Sick Leave', 'SL', 'Approved'], [ -5, 'Casual Leave', 'CL', 'Pending']].forEach(([offset, leaveType, shortCode, status]) => {
    const start = isSunday(ago(offset)) ? ago(offset + 1) : ago(offset);
    if (leaves.some((l) => l.employee === employees[0]._id && l.startDate === start)) return;
    leaves.push({ employee: employees[0]._id, category: 'Leave', leaveType, shortCode, startDate: start, endDate: start, days: 1, reason: 'Personal work', status });
    if (status === 'Approved') approvedOn.set(`${employees[0]._id}|${start}`, true);
  });

  // Pending items for the approval queues.
  employees.slice(20, 24).forEach((employee, index) => {
    const start = ahead(index + 2);
    leaves.push({ employee: employee._id, category: 'Leave', leaveType: 'Casual Leave', shortCode: 'CL', startDate: start, endDate: start, days: 1, reason: pick(reasons), status: 'Pending' });
  });
  employees.slice(24, 27).forEach((employee, index) => {
    const start = ahead(index + 1);
    leaves.push({ employee: employee._id, category: 'WFH', leaveType: 'Work From Home', shortCode: 'WFH', startDate: start, endDate: start, days: 1, reason: 'Plumbing work at home', status: 'Pending' });
  });
  employees.slice(27, 29).forEach((employee) => {
    leaves.push({ employee: employee._id, category: 'Permission', leaveType: 'Permission', shortCode: 'PER', duration: 'Hours', startDate: ahead(1), endDate: ahead(1), startTime: '16:30', endTime: '18:30', days: 0, reason: 'Bank work', status: 'Pending' });
  });
  await Leave.insertMany(leaves);
  return { approvedOn, wfhToday: new Set(employees.slice(12, 17).map((e) => String(e._id))) };
}

async function seedAttendance(employees, shifts, { approvedOn, wfhToday }) {
  const holidays = await Holiday.insertMany([
    { date: `${today.slice(0, 4)}-01-26`, reason: 'Republic Day' },
    { date: `${today.slice(0, 4)}-08-15`, reason: 'Independence Day' },
    { date: `${today.slice(0, 4)}-10-02`, reason: 'Gandhi Jayanti' },
    { date: `${today.slice(0, 4)}-11-08`, reason: 'Deepavali' },
    { date: `${today.slice(0, 4)}-12-25`, reason: 'Christmas' },
  ]);
  const closed = new Set(holidays.map((h) => h.date));
  const shiftById = new Map(shifts.map((s) => [String(s._id), s]));
  const records = [];

  eachDay(ago(70), today).forEach((date) => {
    if (isSunday(date) || closed.has(date)) return;
    employees.forEach((employee, index) => {
      if (employee.dateOfJoining > date || approvedOn.get(`${employee._id}|${date}`)) return;
      const isToday = date === today;
      // Two people absent today, a few here and there historically.
      if (isToday ? index === 2 || index === 3 : random() < 0.025) return;

      const shift = shiftById.get(String(employee.shift));
      const [startHour, startMinute] = shift.from.split(':').map(Number);
      const lateBy = random() < 0.12 ? between(12, 45) : 0;
      const loginAt = startHour * 60 + startMinute - between(0, 12) + lateBy;
      const login = at(date, Math.floor(loginAt / 60), loginAt % 60);
      const breakOut = new Date(login.getTime() + between(230, 260) * 60000);
      const breakIn = new Date(breakOut.getTime() + between(30, 50) * 60000);
      const entries = [{ reason: 'Login', time: login }];

      const now = new Date();
      if (!isToday || breakOut < now) entries.push({ reason: 'Break Out', time: breakOut });
      if (!isToday || breakIn < now) entries.push({ reason: 'Break In', time: breakIn });
      if (!isToday) {
        const logoutMinutes = random() < 0.06 ? between(200, 220) : between(280, 320);
        entries.push({ reason: 'Logout', time: new Date(breakIn.getTime() + logoutMinutes * 60000) });
      }
      if (isToday && login > now) return;

      const remote = isToday ? wfhToday.has(String(employee._id)) : random() < 0.05;
      records.push({
        employee: employee._id, date, shift: shift._id, shiftName: shift.name, shiftFrom: shift.from, shiftTo: shift.to,
        workType: remote ? 'WFH' : 'Office', entries, isLate: lateBy > 10, lateMinutes: lateBy > 10 ? lateBy - 10 : 0,
      });
    });
  });
  // The demo employee starts today not logged in, so check-in can be tried.
  const demoId = String(employees[0]._id);
  await Attendance.insertMany(records.filter((r) => !(String(r.employee) === demoId && r.date === today)));
}

async function seedWork(employees) {
  const clients = await Client.insertMany(
    CLIENTS.map(([client_name, company_name, email, source]) => ({
      client_name, company_name, email, source, phone_number: `9${between(100000000, 999999999)}`, address: 'Chennai, Tamil Nadu', gst: `33ABCDE${between(1000, 9999)}F1Z5`, country: 'India', contact_person: client_name, contact_person_role: 'Marketing Head',
    })),
  );
  const projects = await Project.insertMany(
    clients.flatMap((client, index) =>
      ['Digital Growth Retainer', 'Website & SEO'].slice(0, index % 2 === 0 ? 2 : 1).map((label) => ({
        name: `${client.company_name} ${label}`,
        client: client._id,
        manager: employees[1 + index]._id,
        team: employees.slice(index * 3, index * 3 + 5).map((e) => e._id),
        startDate: ago(between(60, 200)),
        endDate: ahead(between(30, 180)),
        status: 'Active',
        priority: pick(db.PRIORITIES),
        budget: between(5, 40) * 25000,
        currency: 'INR',
        paymentType: 'Recurring',
      })),
    ),
  );

  const actor = { kind: 'admin', name: 'Admin' };
  const statuses = ['To Do', 'In Progress', 'In Progress', 'In Review', 'In Review', 'Done', 'Done'];
  const taskDocs = TASK_TITLES.flatMap(([title, category], index) =>
    [0, 1].map((round) => {
      const status = pick(statuses);
      const assignee = round === 0 && index < 8 ? employees[0] : pick(employees);
      const dueDate = status === 'Done' ? ago(between(1, 20)) : ahead(between(-6, 14));
      return {
        taskId: `SX-T${String(index * 2 + round + 1).padStart(4, '0')}`,
        title: round === 0 ? title : `${title} (phase 2)`,
        description: `${title} for the client's current campaign. Share drafts in the comments before moving to review.`,
        project: pick(projects)._id,
        assignedTo: [assignee._id],
        category,
        priority: pick(db.PRIORITIES),
        status,
        startDate: ago(between(1, 14)),
        dueDate,
        workLog: status === 'In Progress' ? [{ start: new Date(Date.now() - between(1, 40) * 3600000) }] : [],
        createdBy: actor,
      };
    }),
  );
  const tasks = await Task.insertMany(taskDocs);
  await Counter.create({ _id: 'task', value: tasks.length });
  await SubTask.insertMany(tasks.slice(0, 10).flatMap((task) => [
    { task: task._id, title: 'Draft', status: 'Done', assignedTo: task.assignedTo[0] },
    { task: task._id, title: 'Internal review', status: 'To Do', assignedTo: task.assignedTo[0] },
  ]));
  await TaskComment.insertMany(tasks.slice(0, 10).map((task) => ({ task: task._id, message: 'Please share the first draft by tomorrow.', author: actor })));
  await TaskLog.insertMany(tasks.map((task) => ({ task: task._id, action: 'Created', detail: task.title, actor })));

  const reports = [];
  eachDay(ago(10), ago(1)).forEach((date) => {
    if (isSunday(date)) return;
    employees.slice(0, 8).forEach((employee) => {
      reports.push({
        employee: employee._id,
        date,
        tasks: [
          { project: pick(projects)._id, task: pick(TASK_TITLES)[0], description: 'Worked on deliverables', status: 'Done', startTime: '09:45', endTime: '13:15' },
          { project: pick(projects)._id, task: pick(TASK_TITLES)[0], description: 'Client revisions', status: 'In Progress', startTime: '14:00', endTime: '18:15' },
        ],
      });
    });
  });
  await DailyReport.insertMany(reports);

  await EmployeeRequest.insertMany([
    { employee: employees[0]._id, date: ago(3), subject: 'Technical', message: 'Laptop charger is not working.', status: 'Approved', notes: 'Replacement issued', decidedBy: 'Admin' },
    { employee: employees[5]._id, date: ago(1), subject: 'Shift', shiftType: 'Single', message: 'Need early shift tomorrow for a client shoot.', status: 'Pending', startTime: '07:00', endTime: '16:00' },
    { employee: employees[8]._id, date: today, subject: 'Stationary and Sync', message: 'Need notebooks for the design team.', status: 'Pending' },
    { employee: employees[9]._id, date: today, subject: 'Timing', message: 'Requesting 10:30 login this week for a medical reason.', status: 'Pending', fromDate: today, toDate: ahead(5) },
  ]);

  await Announcement.insertMany([
    { date: ago(2), expiryDate: ahead(8), message: 'Deepavali bonus will be processed with the November payroll.', visible: 'Everyone' },
    { date: today, expiryDate: ahead(5), message: 'Quarterly town hall this Friday at 4 PM in the main conference room.', visible: 'Everyone' },
    { date: ago(1), expiryDate: ahead(3), message: 'Payroll inputs for this month close on the 28th.', visible: 'Admins' },
  ]);
  await Protocol.insertMany(POLICIES);
  return { clients, projects };
}

async function seedFinance(employees, { clients, projects }) {
  const accounts = await FinanceAccount.insertMany([
    { name: 'HDFC Current', accountType: 'Bank' },
    { name: 'ICICI Savings', accountType: 'Bank' },
    { name: 'Petty Cash', accountType: 'Cash' },
    { name: 'Axis Credit Card', accountType: 'Credit Card' },
  ]);
  const [hdfc, icici, cash, card] = accounts;

  const incomes = [];
  const expenses = [];
  eachDay(ago(150), today).forEach((date) => {
    if (random() < 0.09) incomes.push({ date, account: hdfc._id, amount: between(4, 30) * 10000, source: pick(clients).company_name, notes: 'Retainer payment' });
    if (random() < 0.22) expenses.push({ date, account: pick([hdfc, icici, cash])._id, amount: between(2, 60) * 500, source: pick(['Rent', 'Software', 'Ad spend', 'Office supplies', 'Internet', 'Travel']), notes: '' });
  });
  await Income.insertMany(incomes);
  await Expense.insertMany(expenses);

  await BankStatement.insertMany(
    [...incomes.slice(-14).map((i) => ({ date: i.date, narration: `NEFT CR ${i.source}`, amount: i.amount, type: 'Credit', ledger: 'Income', account: i.account })),
      ...expenses.slice(-20).filter((e) => String(e.account) !== String(cash._id)).map((e) => ({ date: e.date, narration: `UPI DR ${e.source}`, amount: e.amount, type: 'Debit', ledger: 'Expense', account: e.account }))],
  );

  await ClientPayment.insertMany(projects.slice(0, 6).map((project, index) => {
    const paid = between(1, 3);
    const amount = Math.round(project.budget / 4);
    const payments = Array.from({ length: paid }, (_, i) => ({ date: ago(30 * (paid - i)), amount, reference_no: `NEFT${between(100000, 999999)}` }));
    return { client: project.client, project: project._id, budget: project.budget, paymentType: index % 2 === 0 ? 'Recurring' : 'One Time', gst: true, payments, status: 'Partial' };
  }));

  const month = today.slice(0, 7);
  const logs = (amount, months) => Array.from({ length: months }, (_, i) => ({ date: `${shiftDay(`${month}-05`, -30 * (months - i)).slice(0, 7)}-05`, amount }));
  await RecurringPayment.insertMany([
    { account: hdfc._id, name: 'Monthly RD', lenderName: 'HDFC Bank', paymentType: 'Saving', amount: 25000, totalAmount: 300000, recurringType: 'Monthly', paymentMode: 'Auto debit', dueDay: 5, logs: logs(25000, 6) },
    { account: icici._id, name: 'Emergency Fund', lenderName: 'ICICI Bank', paymentType: 'Saving', amount: 15000, totalAmount: 180000, recurringType: 'Monthly', paymentMode: 'Auto debit', dueDay: 7, logs: logs(15000, 4) },
    { account: hdfc._id, name: 'Office Loan', lenderName: 'Bajaj Finserv', paymentType: 'Loan', emiAmount: 42000, totalEmi: 36, totalAmount: 1512000, interestRate: 12.5, monthlyInterest: 11000, recurringType: 'EMI', paymentMode: 'NACH', dueDay: 10, logs: logs(42000, 8) },
    { account: hdfc._id, name: 'Gold Loan - Branch 1', lenderName: 'Muthoot Finance', paymentType: 'Gold Loan', emiAmount: 18000, totalEmi: 12, totalAmount: 216000, interestRate: 9, monthlyInterest: 3000, recurringType: 'EMI', paymentMode: 'NEFT', dueDay: 15, logs: logs(18000, 5) },
    { account: card._id, name: 'Adobe Creative Cloud', lenderName: 'Adobe', paymentType: 'Subscription', amount: 4230, recurringType: 'Monthly', paymentMode: 'Card', dueDay: 12, logs: logs(4230, 6) },
    { account: hdfc._id, name: 'Office Rent', lenderName: 'Sri Lakshmi Properties', paymentType: 'Office', amount: 85000, recurringType: 'Monthly', paymentMode: 'NEFT', dueDay: 3, logs: logs(85000, 6) },
    { account: card._id, name: 'Axis Card Bill', lenderName: 'Axis Bank', paymentType: 'Credit Card', amount: 60000, totalAmount: 0, recurringType: 'Monthly', paymentMode: 'NEFT', dueDay: 20, logs: logs(52000, 3) },
    { account: icici._id, name: 'House Maintenance', lenderName: 'Apartment Association', paymentType: 'House Expense', amount: 6500, recurringType: 'Monthly', paymentMode: 'UPI', dueDay: 8, logs: logs(6500, 6) },
  ]);

  await Subscription.create([
    { name: 'Semrush Pro', url: 'https://semrush.com', recurringType: 'Monthly', amount: 9900, dueDate: ahead(9), expiryDate: ahead(240), email: 'ops@scriptx.in' },
    { name: 'Canva Teams', url: 'https://canva.com', recurringType: 'Yearly', amount: 24000, dueDate: ahead(45), expiryDate: ahead(45), email: 'design@scriptx.in' },
    { name: 'Google Workspace', url: 'https://workspace.google.com', recurringType: 'Monthly', amount: 18400, dueDate: ahead(4), expiryDate: ahead(300), email: 'admin@scriptx.in' },
  ]);

  const invoices = projects.slice(0, 8).map((project, index) => {
    const amount = Math.round(project.budget / 6);
    const gst = Math.round(amount * 0.09);
    const total = amount + gst * 2;
    const received = index % 3 === 0 ? total : index % 3 === 1 ? Math.round(total / 2) : 0;
    return {
      invoiceNumber: `SX-INV-${today.slice(0, 4)}-${String(index + 1).padStart(4, '0')}`,
      client: project.client, project: project._id, invoiceType: 'Tax Invoice', invoiceDate: ago(between(3, 50)), dueDate: ahead(between(-10, 20)),
      items: [{ description: 'Digital marketing retainer', hsnCode: '998361', quantity: 1, rate: amount, amount }],
      subTotal: amount, cgst: gst, sgst: gst, totalAmount: total, receivedAmount: received,
      status: received >= total ? 'Paid' : received > 0 ? 'Partial' : 'Unpaid',
    };
  });
  await Invoice.insertMany(invoices);
  await Counter.create({ _id: 'invoice', value: invoices.length });

  const [laptops, furniture] = await AssetCategory.insertMany([{ name: 'Computers' }, { name: 'Furniture' }]);
  const subs = await AssetSubCategory.insertMany([
    { name: 'Laptop', category: laptops._id },
    { name: 'Monitor', category: laptops._id },
    { name: 'Chair', category: furniture._id },
  ]);
  await Asset.insertMany([
    ['MacBook Pro 14', subs[0], laptops, 3, 185000, 40],
    ['Dell 27" Monitor', subs[1], laptops, 6, 24000, 40],
    ['Ergonomic Chair', subs[2], furniture, 12, 11500, 10],
  ].map(([title, sub, category, quantity, rate, depreciationPercentage], index) => {
    const taxable = quantity * rate;
    const gst = taxable * 0.18;
    return {
      invoiceNumber: `PUR-${1000 + index}`, purchasedDate: ago(between(60, 400)), ledger: 'Fixed Assets', category: category._id, subCategory: sub._id, title,
      depreciationPercentage, quantity, rate, gstRate: 18, taxable, cgst: gst / 2, sgst: gst / 2, invoiceValue: taxable + gst, warrantyYears: 2,
    };
  }));
}

await mongoose.connect(uri);
console.log(`Seeding ${mongoose.connection.name}…`);
await clearAll();
const organisation = await seedOrganisation();
const employees = await seedPeople(organisation);
const leaves = await seedLeaves(employees);
await seedAttendance(employees, organisation.shifts, leaves);
const work = await seedWork(employees);
await seedFinance(employees, work);
await mongoose.disconnect();
console.log('Done. Admin: admin@demo.com / Admin@123 · Employee: employee@demo.com / Employee@123');
