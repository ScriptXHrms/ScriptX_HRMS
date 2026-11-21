# ScriptX HRMS (Human Resource Management System) — Version 1.0

A modern, full-stack Human Resource Management System engineered for digital agencies, IT enterprises, and growing startups. ScriptX HRMS streamlines employee onboarding, live attendance tracking with geo/time boundaries, granular payroll calculations, project task management, client billing, leave workflows, and role-based privilege controls.

---

## 🌟 Table of Contents
1. [System Architecture](#-system-architecture)
2. [Technology Stack](#-technology-stack)
3. [Live Production URLs](#-live-production-urls)
4. [Admin Portal — Features & Field Documentation](#-admin-portal--features--field-documentation)
   - [1. Overview & Dashboard](#1-overview--dashboard)
   - [2. Onboarding & Employee Lifecycle](#2-onboarding--employee-lifecycle)
   - [3. Attendance & Shift Operations](#3-attendance--shift-operations)
   - [4. Finance, Payroll & Accounting](#4-finance-payroll--accounting)
   - [5. Projects, Task Board & Daily Reports](#5-projects-task-board--daily-reports)
   - [6. Clients & Invoicing](#6-clients--invoicing)
   - [7. Leaves, WFH & Requests](#7-leaves-wfh--requests)
   - [8. Announcements](#8-announcements)
   - [9. Privileges & Access Control (RBAC)](#9-privileges--access-control-rbac)
   - [10. Asset Management](#10-asset-management)
   - [11. Holidays Management](#11-holidays-management)
   - [12. Company Settings](#12-company-settings)
5. [Employee Portal — Features & Field Documentation](#-employee-portal--features--field-documentation)
   - [1. Authentication & Security](#1-authentication--security)
   - [2. Employee Dashboard](#2-employee-dashboard)
   - [3. Daily Attendance Tracker](#3-daily-attendance-tracker)
   - [4. Monthly Attendance & Transparent Salary Breakdown](#4-monthly-attendance--transparent-salary-breakdown)
   - [5. Daily Work Reports](#5-daily-work-reports)
   - [6. Leave Applications](#6-leave-applications)
   - [7. Work From Home (WFH) Requests](#7-work-from-home-wfh-requests)
   - [8. Tasks & Kanban Board](#8-tasks--kanban-board)
   - [9. Content Calendar](#9-content-calendar)
   - [10. Employee Requests & Helpdesk](#10-employee-requests--helpdesk)
   - [11. Company Policies & Protocols](#11-company-policies--protocols)
   - [12. Employee Profile Dossier](#12-employee-profile-dossier)
6. [Core Business Logic & Payroll Formula](#-core-business-logic--payroll-formula)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Environment Configuration](#-environment-configuration)
9. [Deployment Guide](#-deployment-guide)

---

## 🏗 System Architecture

ScriptX HRMS is structured as an enterprise-grade monorepo containing three core applications:

```
scriptx-hrms/
├── Backend/                 # Express 5 REST API + MongoDB (Mongoose) + JWT Auth
│   ├── src/
│   │   ├── config/          # CORS, environment, and security configurations
│   │   ├── controllers/     # API request handlers and business logic
│   │   ├── middleware/      # JWT authentication, RBAC privileges, file uploads
│   │   ├── models/          # Mongoose data schemas (20+ entities)
│   │   ├── routes/          # Express route definitions
│   │   ├── seed/            # Safe initial setup and development seed scripts
│   │   └── utils/           # Math engines (payroll, hours, dates, tokens)
│   └── server.js            # Entry point & keep-alive monitors
│
├── Admin/                   # Superadmin & HR Management Portal (React 19 + Vite)
│   ├── src/
│   │   ├── components/      # UI components, modals, stats cards, navbar, sidebar
│   │   ├── features/        # Shared components (TaskBoard, DailyReports, Calendar)
│   │   ├── pages/           # Admin modules (Onboarding, Payroll, Attendance, etc.)
│   │   └── config/          # RBAC module navigation and routing maps
│   └── vite.config.js       # Vite configuration with Tailwind CSS v4
│
└── Employee/                # Employee Self-Service Portal (React 19 + Vite)
    ├── src/
    │   ├── components/      # Live punch clock, announcement modals, status cards
    │   ├── features/        # Shared task board, daily work reporting
    │   ├── pages/           # Self-service pages (Dashboard, Leaves, Attendance, etc.)
    │   └── config/          # Employee routes and layout definitions
    └── vite.config.js       # Vite configuration with Tailwind CSS v4
```

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js (ES Modules), Express v5.2, Mongoose v8.2, MongoDB |
| **Authentication** | JWT (JSON Web Tokens) with dual support for HTTP-Only Secure Cookies and Bearer headers, bcryptjs |
| **Admin Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Recharts, GSAP |
| **Employee Frontend**| React 19, Vite 8, Tailwind CSS v4, Lucide React, GSAP |
| **Email & Security** | Nodemailer (SMTP), Helmet v8, Express Rate Limit, Multer (encrypted multipart uploads) |
| **Hosting** | Render (API), Firebase Hosting / Custom Domains (Frontends) |

---

## 🌐 Live Production URLs

- **Admin Portal:** [https://portal.script-x.in](https://portal.script-x.in) (Backup: [https://portalscriptx.web.app](https://portalscriptx.web.app))
- **Employee Portal:** [https://employee.script-x.in](https://employee.script-x.in) (Backup: [https://employeescriptx.web.app](https://employeescriptx.web.app))
- **Production API:** [https://scriptx-hrms.onrender.com](https://scriptx-hrms.onrender.com)

---

## 🛡 Admin Portal — Features & Field Documentation

The Admin Portal is the central command center for HR managers, department heads, and executives. Access to every module is strictly regulated via the Role-Based Access Control (RBAC) engine.

### 1. Overview & Dashboard
- **Route:** `/admin/dashboard`
- **Privilege Module:** `dashboard`
- **Key Features & Widgets:**
  - **Employee Attendance Gauge:** Displays real-time organizational attendance for the current month. The total days dynamically subtract Sundays and official holidays to show true business working days (e.g., `18 / 25 Days`). Includes a percentage radial gauge and timestamp of the latest punch-in.
  - **Task Overview Chart:** Real-time donut chart aggregating actual tasks across the system grouped by status: *Completed*, *In Progress*, and *Pending*.
  - **Finance Widget:** Highlights pending client invoices and upcoming scheduled payments due within 3 days. Displays an automated "No Dues Pending" status when accounts are clear.
  - **Actionable Notification Panels:**
    - Pending requests badge count (Leaves, WFH, General Requests) with one-click approval shortcuts.
    - Upcoming team birthdays & work anniversaries celebration feed.
    - Company holiday countdown list.
  - **Active Announcements Popup:** Automatically opens an urgent modal on page load whenever active announcements are broadcast to administrators.

---

### 2. Onboarding & Employee Lifecycle
- **Routes:** `/admin/departments`, `/admin/roles`, `/admin/employees`, `/admin/employees/new`, `/admin/employees/:id`, `/admin/relieving`, `/admin/relieved`
- **Privilege Module:** `onboarding`

#### A. Departments (`/admin/departments`)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `name` | String (Required, Unique) | Title of the department (e.g., Development, UI/UX Design, Digital Marketing, HR). |
| `status` | Select (`Active`, `Inactive`) | Status determining if new employees can be assigned. |

#### B. Roles (`/admin/roles`)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `name` | String (Required) | Job designation title (e.g., Senior Full Stack Developer, Content Strategist). |
| `department` | Dropdown (Required) | Foreign key link to existing active department. |
| `status` | Select (`Active`, `Inactive`) | Active operational status. |

#### C. Comprehensive Employee Onboarding Form (`/admin/employees/new` & `/:id/edit`)
Employees receive an auto-generated unique ID adhering to the corporate format: `SX-YYYY0001` (e.g., `SX-20260001`).

##### Step 1: Basic Information
- `name` *(Text, Required)*: Full official name of the employee.
- `email` *(Email, Required)*: Official company work email used for portal authentication.
- `password` *(Password, Required on Create)*: Initial portal password (minimum 8 characters).
- `phone` *(Tel, Required)*: Primary 10-digit mobile number.
- `personalEmail` *(Email, Optional)*: Secondary personal email address.
- `employeeType` *(Select, Required)*: `Employee`, `Intern`, `Freelancer`, `Part Time`.
- `experienceLevel` *(Select)*: `Fresher`, `Experienced`.
- `internDuration` *(Select, Conditional)*: Applicable for Interns/Freelancers (`3 Months`, `6 Months`, `12 Months`).
- `department` *(Select, Required)*: Assigned department.
- `role` *(Select, Required)*: Assigned role filtered dynamically by department.
- `shift` *(Select, Required)*: Assigned work shift timing.
- `dateOfJoining` *(Date, Required)*: Official date of joining.
- `confirmationDate` *(Date, Optional)*: Probation completion/confirmation date.

##### Step 2: Personal Information
- `dateOfBirth` *(Date)*: Birth date for record and anniversary automation.
- `gender` *(Select)*: `MALE`, `FEMALE`, `OTHER`.
- `maritalStatus` *(Select)*: `Single`, `Married`.
- `spouseName` *(Text, Conditional)*: Visible only if marital status is `Married`.
- `fatherName` *(Text)*: Father's full name.
- `motherName` *(Text)*: Mother's full name.
- `address` *(Textarea)*: Current residential address.
- `pincode` *(Text)*: 6-digit residential postal code.
- `permanentAddress` *(Textarea)*: Permanent hometown address.
- `permanentPincode` *(Text)*: 6-digit permanent postal code.
- `linkedIn` *(URL)*: LinkedIn profile link.
- `skills` *(Tag Input)*: Array of technical/professional skills.
- `driveLink` *(URL)*: Secure Google Drive folder URL for cloud portfolio/KYC docs.

##### Step 3: Statutory, ID, PF & ESI
- `panNo` *(Text)*: Permanent Account Number (PAN).
- `aadharNo` *(Text)*: 12-digit Government Aadhaar number.
- `passportNo` *(Text)*: International passport number.
- `passportExpiry` *(Date)*: Passport expiration date.
- `uanNo` *(Text)*: Universal Account Number (UAN) for Employee Provident Fund.
- `epfoAccountNumber` *(Text)*: EPFO member ID.
- `pfJoinDate` *(Date)*: Date enrolled into company PF scheme.
- `pfExpiryDate` *(Date)*: Date exited from PF scheme.
- `ipNumber` *(Text)*: Employees' State Insurance (ESI) Insurance Person (IP) number.
- `insuranceNo` *(Text)*: Group medical/term insurance policy ID.
- `insuranceDate` *(Date)*: Insurance policy effective date.

##### Step 4: Bank & Salary Details
- `paymentType` *(Select, Required)*: Mode of disbursement (`BANK`, `CASH`).
- `salaryAmount` *(Number)*: Monthly Gross CTC in INR (for permanent employees).
- `studentAmount` *(Number)*: Monthly stipend in INR (for interns and freelancers).
- `bank.accountNo` *(Text)*: Bank account number (shown if payment type is `BANK`).
- `bank.bankName` *(Text)*: Bank name (e.g., HDFC, SBI, ICICI).
- `bank.branch` *(Text)*: Specific branch name.
- `bank.ifscCode` *(Text)*: 11-character bank IFSC code.
- `bank.gpayNumber` *(Text)*: UPI / GPay phone number for emergency/direct payouts.

##### Step 5: Contact, Education & Experience Repeater
- `emergencyContacts` *(Array of Objects)*:
  - `fullName`: Contact person's name.
  - `contact`: 10-digit mobile number.
  - `relation`: `Father`, `Mother`, `Spouse`, `Sibling`, `Friend`.
- `education` *(Array of Objects)*:
  - `schoolName`: Institute/University name.
  - `departmentName`: Degree / Specialization.
  - `endYear`: Year of graduation.
- `experience` *(Array of Objects, shown if `Experienced`)*:
  - `jobTitle`: Previous designation.
  - `companyName`: Previous employer name.
  - `companyIndustry`: Industry domain.
  - `previousSalary`: Last drawn CTC.
  - `startWork` & `endWork`: Tenancy duration.
  - `responsibilities`: Key job description summary.

#### D. Employee Relieving & Relieved Management
- **Relieving List (`/admin/relieving`):** Tracks departing staff currently serving notice period. Captures resignation date, official last working day, handover status, asset return status, and exit interview clearance.
- **Relieved List (`/admin/relieved`):** Complete archive of past employees with final settlement clearance date, experience certificate status, and relieving letter generation.

---

### 3. Attendance & Shift Operations
- **Routes:** `/admin/shifts`, `/admin/attendance`, `/admin/attendance-add`, `/admin/attendance-tracker`, `/admin/attendance-monthly`, `/admin/attendance-overall`
- **Privilege Module:** `attendance`

#### A. Shifts Management (`/admin/shifts`)
- `name` *(Text, Required)*: Shift label (e.g., "Regular Shift A", "Night Shift").
- `fromTime` *(Time, Required)*: Shift start time (e.g., `10:00 AM`).
- `toTime` *(Time, Required)*: Shift end time (e.g., `07:00 PM`).
- `colorCode` *(Color Picker)*: UI badge color identifier.

#### B. Attendance Screens
- **Daily Attendance (`/admin/attendance`):** Live dashboard showing today's punch logs. Filter by date, shift, and department. Includes quick metric cards for Present, Absent, Half Day, WFH, and On Leave.
- **Add / Override Attendance (`/admin/attendance-add`):** Allows administrators to manually inject or rectify attendance records with punch times and audit remarks.
- **Attendance Tracker (`/admin/attendance-tracker`):** Visual monthly grid showing day-by-day status badges for every team member.
- **Monthly Attendance (`/admin/attendance-monthly`):** Deep inspection per employee detailing working days, attended days, permissions, late entries, and LOP counts.
- **Overall Attendance (`/admin/attendance-overall`):** High-level aggregate reports across departments with instant CSV data export.

---

### 4. Finance, Payroll & Accounting
- **Routes:** `/admin/finance/recurring`, `/admin/finance/payroll`, `/admin/finance/accounts`, `/admin/finance/income`, `/admin/finance/expenses`, `/admin/finance/payments`, `/admin/finance/bank-statement`, `/admin/finance/subscriptions`
- **Privilege Module:** `finance`

#### A. Automated Payroll System (`/admin/finance/payroll`)
- **Real-Time Dynamic Salary Calculation Engine:**
  - Dynamically calculates the month's total business working days by taking total days in the month and subtracting Sundays and company holidays:
    $$\text{Working Days} = \text{Days in Month} - \text{Sundays} - \text{Holidays}$$
  - Computes exact per-day compensation:
    $$\text{Per Day Salary} = \frac{\text{Monthly Gross CTC}}{\text{Working Days}}$$
  - Deducts Loss of Pay (LOP) based on actual unapproved absences, late login penalties, and missed daily task logs:
    $$\text{Net Pay} = \text{Monthly Gross} - (\text{Per Day Salary} \times \text{Total LOP Days})$$
- **Payroll Actions:**
  - Adjust manual bonus or extra deductions via `PayrollOverride`.
  - Mark salaries as `Paid` with payment date, transaction reference, and disbursement bank account.
  - One-click PDF Payslip generation and printing.

#### B. Accounting & Ledgers
- **Bank Accounts (`/admin/finance/accounts`):** Manages corporate accounts (Account Name, Bank Name, Account Number, IFSC, Account Type [Current, Savings, Cash], Current Balance).
- **Income Register (`/admin/finance/income`):** Tracks client inflows and non-invoice revenues (Date, Account, Category, Amount, Reference, Receipt attachment).
- **Expense Register (`/admin/finance/expenses`):** Tracks operational overheads, vendor payouts, office supplies, utilities, and team events with receipt uploads.
- **Client Scheduled Payments (`/admin/finance/payments`):** Tracks milestone receivables (`One Time`, `Monthly`, `Quarterly`, `Half Yearly`, `Yearly`) with payment reminders and overdue alerts.
- **Bank Statements (`/admin/finance/bank-statement`):** Unified financial statement view with running balance audit.
- **SaaS Subscriptions (`/admin/finance/subscriptions`):** Tracks recurring software costs (Figma, GitHub, AWS, Render, Workspace), billing dates, renewal alerts, and encrypted login credential vaults (`DATA_KEY`).

---

### 5. Projects, Task Board & Daily Reports
- **Routes:** `/admin/projects`, `/admin/task-board`, `/admin/tasks`, `/admin/tasks/:id`, `/admin/daily-reports`, `/admin/content-calendar`
- **Privilege Module:** `projects`

#### A. Projects (`/admin/projects`)
- `name` *(Text, Required)*: Title of the project.
- `client` *(Select)*: Linked corporate client.
- `manager` *(Select)*: Assigned Project Manager.
- `team` *(Multi-Select)*: Assigned employee contributors.
- `startDate` & `deadline` *(Date Range)*: Project execution timeline.
- `status` *(Select)*: `Not Started`, `In Progress`, `On Hold`, `Completed`.
- `priority` *(Select)*: `Low`, `Medium`, `High`, `Urgent`.
- `budget` & `currency` *(Number/Select)*: Total allocated financial budget.

#### B. Task Board & Kanban (`/admin/task-board` & `/admin/tasks/:id`)
- Drag-and-drop Kanban workflow across 4 states: **To Do**, **In Progress**, **In Review**, **Done**.
- **Task Fields:**
  - `title` *(Text)*: Descriptive task title.
  - `project` *(Select)*: Associated project.
  - `assignees` *(Multi-Select)*: Team members responsible.
  - `priority` *(Select)*: `Low`, `Medium`, `High`, `Urgent`.
  - `dueDate` *(Date)*: Target delivery deadline.
  - `description` *(Rich Text)*: Detailed task requirements.
  - `subtasks` *(Checklist Repeater)*: Granular sub-items with completion toggles.
  - `attachments` *(Files)*: Design assets, wireframes, and documentation.
  - `testerStatus` *(Select)*: Quality assurance verification status.
  - `comments` *(Audit Trail)*: Collaborative threaded feedback with timestamps.

#### C. Daily Work Reports (`/admin/daily-reports`)
- Centralized review feed of daily submissions filed by employees.
- Filterable by date, employee, and department to audit productivity and detect Task LOP triggers.

#### D. Content Calendar (`/admin/content-calendar`)
- Visual scheduling calendar mapping marketing campaigns, social media posts, blog releases, and creative deliverables.

---

### 6. Clients & Invoicing
- **Routes:** `/admin/clients`, `/admin/invoices`
- **Privilege Module:** `clients`

#### A. Client Directory (`/admin/clients`)
- `company` *(Text, Required)*: Client business name.
- `contactPerson` *(Text)*: Primary stakeholder contact.
- `email` & `phone` *(Contact)*: Invoicing and operational contacts.
- `gstNo` *(Text)*: Official GSTIN identification.
- `address` *(Textarea)*: Billing address.
- `currency` *(Select)*: Default invoicing currency (`INR`, `USD`, `EUR`, `GBP`).

#### B. Invoicing Engine (`/admin/invoices`)
- Auto-generated sequential invoice numbers: `SX-INV-YYYY-####`.
- Line items table: Description, Quantity, Unit Rate, GST Tax Rate %, Total Amount.
- Subtotal, Central GST (CGST), State GST (SGST), Integrated GST (IGST), Total Tax, Grand Total.
- Payment Status: `Draft`, `Sent`, `Paid`, `Overdue`, `Cancelled`.
- Print and PDF export ready with corporate bank payment instructions.

---

### 7. Leaves, WFH & Requests
- **Routes:** `/admin/leaves`, `/admin/leave-types`, `/admin/leave-options`, `/admin/wfh`, `/admin/requests`
- **Privilege Modules:** `leave`, `wfh`, `requests`
- **Leave Requests Review:** Approve or reject employee leave applications with managerial comments.
- **Leave Types Policy:** Configure Annual Quotas, Short Codes (CL, SL, EL, LOP), Paid/Unpaid status, and Carry-Forward rules.
- **WFH Approvals:** Review remote work requests with employee reason and task deliverables.
- **General Requests:** Resolve employee requests for hardware, ID reissuance, documents, or operational queries.

---

### 8. Announcements
- **Route:** `/admin/announcements`
- **Privilege Module:** `announcements`
- **Fields:**
  - `title` *(Text, Required)*: Announcement heading.
  - `message` *(Textarea, Required)*: Detailed notice body.
  - `date` *(Date)*: Announcement broadcast date.
  - `expiryDate` *(Date)*: Automatic expiration date.
  - `visibility` *(Select)*: `Everyone`, `Employees`, `Admins`.
  - `status` *(Select)*: `Active`, `Archived`.
- **System Impact:** Active announcements display a high-priority popup modal immediately upon dashboard load in both the Admin and Employee portals.

---

### 9. Privileges & Access Control (RBAC)
- **Route:** `/admin/privileges`
- **Privilege Module:** `privileges`
- Granular permission matrix across all 14 platform modules:
  `dashboard`, `finance`, `onboarding`, `attendance`, `leave`, `wfh`, `requests`, `projects`, `clients`, `announcements`, `privileges`, `assets`, `holidays`, `settings`.
- Restricts sidebar menus, route accessibility, and API execution based on assigned roles.

---

### 10. Asset Management
- **Route:** `/admin/assets`
- **Privilege Module:** `assets`
- **Categories & Sub-Categories:** Hardware, Laptops, Mobile Devices, Office Furniture, Network Gear.
- **Asset Fields:** Asset Name, Serial Number / Asset Tag, Category, Purchase Date, Purchase Price, Supplier / Invoice attachment, Status (`In Stock`, `Assigned`, `Damaged`, `Decommissioned`), Assigned Employee link, Assignment Date.

---

### 11. Holidays Management
- **Route:** `/admin/holidays`
- **Privilege Module:** `holidays`
- **Fields:** Holiday Title, Date, Day of Week, Type (`Mandatory`, `Optional`).
- Integrated into the core attendance and payroll logic to deduct non-working days from the monthly working days count.

---

### 12. Company Settings
- **Route:** `/admin/settings`
- **Privilege Module:** `settings`
- **Attendance Configuration:**
  - Shift grace period in minutes (e.g., 15 minutes grace).
  - Late login penalty threshold (e.g., 3 late logins = 0.5 day Loss of Pay).
  - Daily report submission cut-off time.
- **Company Workplace Policy:** Rich text guidelines and code of conduct published to all employees.

---

## 👨‍💻 Employee Portal — Features & Field Documentation

The Employee Portal is a self-service workspace designed for staff members to manage attendance, track assignments, submit daily logs, and inspect payroll calculations.

---

### 1. Authentication & Security
- **Route:** `/employee/login`
- **Fields:**
  - `Work Email` *(Email, Required)*: Registered company email address.
  - `Password` *(Password, Required)*: Secure user password.
  - `Remember Me` *(Checkbox)*: Persists login session token.
- Seamless redirection to the Admin portal if an administrator logs in accidentally.

---

### 2. Employee Dashboard
- **Route:** `/employee/dashboard`
- **Key Features & Widgets:**
  - **Live Punch Clock:** One-click **Punch In** and **Punch Out** with dynamic duration counter and shift adherence.
  - **Break Tracker:** **Break In** and **Break Out** recording with break timer.
  - **Today's Attendance Card:** Displays shift hours, first punch-in time, last punch-out time, total productive hours, and break duration.
  - **Monthly Quick Stats:**
    - Total Working Days in current month.
    - Days Present, Absent, and WFH.
    - Leaves taken this month.
    - Pending Tasks assigned to the employee.
  - **Active Announcements Popup Modal:** Automatically loads on page visit when an announcement is active, ensuring employees never miss critical notices.
  - **Focus Tasks List:** Top priority tasks assigned to the employee with due date countdown and direct link to the Kanban board.
  - **Upcoming Holidays Widget:** Chronological list of upcoming official paid days off.
  - **Birthdays & Anniversaries Feed:** Celebrates colleague milestones.

---

### 3. Daily Attendance Tracker
- **Route:** `/employee/attendance`
- **Features & Log Table:**
  - Full chronological list of daily attendance logs for the current pay period.
  - **Columns:** Date, Shift, Punch In, Punch Out, Break Time, Total Working Hours, Daily Status badge (`Present`, `Absent`, `Half Day`, `WFH`, `Holiday`, `Weekly Off`).
  - Shortcut button to open the comprehensive **Monthly Attendance & Salary Breakdown**.

---

### 4. Monthly Attendance & Transparent Salary Breakdown
- **Route:** `/employee/attendance-monthly`
- **Month & Year Selector:** Allows historical audit of previous months.

#### A. Attendance Summary Card
| Metric | Description |
| :--- | :--- |
| **Total Days** | Total calendar days in selected month (e.g., 30 days). |
| **Working Days** | Official business days (Month days minus Sundays and Holidays, e.g., 25 days). |
| **Present Days** | Count of days physically present in office. |
| **Work From Home** | Count of approved remote work days. |
| **Absent Days** | Unexcused absent days. |
| **Late Login** | Total days clocked in after shift grace period. |
| **Less Than 8 Hours** | Days where total productive hours were below the shift minimum. |
| **Holidays** | Official recognized holidays in that month. |
| **Weekly Offs** | Weekend rest days (Sundays). |

#### B. Leave & Other Details Card
| Metric | Description |
| :--- | :--- |
| **Permission** | Approved short-duration permissions count. |
| **Half Day** | Total half-day leaves recorded. |
| **LOP (Loss of Pay)** | Direct unapproved absence days deducted from salary. |
| **Late LOP** | Penalty days accrued from repeated late arrivals. |
| **Task LOP** | Penalty days accrued from missing daily work reports. |
| **Payable Days** | Net days eligible for salary disbursement: `Working Days - Total LOP`. |

#### C. Salary Structure Card (100% Transparent Formula)
- **Monthly Gross:** Full contractual CTC (e.g., `₹30,000.00`).
- **Payable Days:** Net attended and approved days.
- **Earned Salary:** Gross earned before tax/statutory deductions.
- **LOP Deduction:** Exact monetary amount deducted:
  $$\text{Deduction} = \frac{\text{Monthly Gross}}{\text{Working Days}} \times \text{Total LOP Days}$$
- **Net Pay:** Final take-home disbursement amount.
- **Attendance Rate Bar:** Visual percentage progress indicator of monthly adherence.
- **Export CSV:** One-click spreadsheet download of all attendance metrics.

---

### 5. Daily Work Reports
- **Route:** `/employee/daily-reports`
- **Submission Form:**
  - `Date` *(Date, Default: Today)*.
  - `Project` *(Dropdown, Required)*: Project worked on.
  - `Task Description` *(Textarea, Required)*: Detailed summary of features built or bugs resolved.
  - `Start Time` & `End Time` *(Time Selectors)*: Time window dedicated to the task.
  - `Status` *(Select)*: `Completed`, `In Progress`, `Blocked`.
  - `Remarks / Blockers` *(Text)*: Impediments or dependency notes.
- **Submission History:** Table of past reports with status indicators. Missing submissions flag automated Task LOP alerts.

---

### 6. Leave Applications
- **Route:** `/employee/leaves`
- **Leave Quota Widgets:** Real-time balances for Casual Leave (CL), Sick Leave (SL), and Earned Leave (EL).
- **Apply Leave Form:**
  - `Leave Type` *(Select, Required)*: CL, SL, EL, or LOP.
  - `Start Date` & `End Date` *(Date Range, Required)*.
  - `Duration` *(Select)*: `Full Day`, `First Half`, `Second Half`.
  - `Reason` *(Textarea, Required)*: Comprehensive justification.
  - `Supporting Documents` *(File Upload, Optional)*: Medical certificates or travel proofs.
- **Application History:** Tracks approval status (`Pending`, `Approved`, `Rejected`) and shows managerial review notes.

---

### 7. Work From Home (WFH) Requests
- **Route:** `/employee/wfh`
- **Request Form:**
  - `From Date` & `To Date` *(Date Range, Required)*.
  - `Reason & Deliverables` *(Textarea, Required)*: Remote work justification and planned work tasks.
- **History Table:** Live status tracking with approver feedback.

---

### 8. Tasks & Kanban Board
- **Routes:** `/employee/tasks`, `/employee/tasks/:id`
- **Interactive Kanban:** Columns for **To Do**, **In Progress**, **In Review**, **Done**.
- **Task Card Details:** Task Code, Priority indicator (`Urgent`, `High`, `Medium`, `Low`), Project label, Due date, Subtasks completion bar.
- **Task Detail View:**
  - Description and specifications.
  - Interactive subtask checkboxes (tick off items as you finish them).
  - File attachments viewer and uploader.
  - Comments thread to discuss roadblocks directly with team leads.

---

### 9. Content Calendar
- **Route:** `/employee/content-calendar`
- Monthly grid highlighting marketing releases, scheduled blog posts, social campaigns, and design delivery deadlines.

---

### 10. Employee Requests & Helpdesk
- **Route:** `/employee/requests`
- **Submission Fields:**
  - `Request Type` *(Select)*: Asset Request, Letter/NOC Request, Salary Inquiry, General Helpdesk.
  - `Subject` *(Text, Required)*: Short summary of the request.
  - `Description` *(Textarea, Required)*: Detailed requirements.
- **Tracking Feed:** Tracks status (`Pending`, `In Review`, `Resolved`, `Closed`) with admin response notes.

---

### 11. Company Policies & Protocols
- **Route:** `/employee/policy`
- Read-only knowledge base displaying official company policies, shift timings, code of conduct, remote work ethics, and data security standards.

---

### 12. Employee Profile Dossier
- **Route:** `/employee/profile`
- Displays the complete employee master record:
  - **Header:** Profile avatar, Full Name, Corporate ID (`SX-YYYY0001`), Designation, Department.
  - **Work Information:** Shift schedule, Date of Joining, Confirmation Date, Employment Type, Experience Level.
  - **Personal Details:** Personal Email, Phone Number, Date of Birth, Gender, Marital Status, Current Address, Permanent Address, LinkedIn profile, Skills tags.
  - **Bank & Statutory Data:** Bank Name, Account Number, Branch, IFSC, PAN Number, Aadhaar Number, UAN Number.
  - **Emergency Contacts:** Primary next-of-kin contact numbers and relations.
  - **Education & Experience Records:** Academic history and verified past work experience.

---

## 📐 Core Business Logic & Payroll Formula

### 1. Corporate Employee ID Auto-Generation
Employee IDs follow the format:
$$\mathbf{SX-YYYY0001}$$
Where:
- `SX-` is the corporate organization prefix.
- `YYYY` represents the current calendar year (e.g., `2026`).
- `0001` is a 4-digit sequential counter that increments automatically and prevents collisions across concurrent onboardings.

### 2. Standardized Payroll Calculation
The system calculates salary based on actual working days rather than a flat 30-day divisor:

1. **Calculate Net Working Days in Month:**
   $$\text{Working Days} = \text{Total Days in Month} - \text{Total Sundays} - \text{Total Official Holidays}$$
   *(Example for November 2026: 30 Total Days - 5 Sundays - 0 Holidays = 25 Working Days)*

2. **Calculate Daily Earning Rate:**
   $$\text{Per Day Salary} = \frac{\text{Monthly Gross CTC}}{\text{Working Days}}$$
   *(Example: ₹30,000 / 25 = ₹1,200.00 per working day)*

3. **Calculate Total Loss of Pay (LOP) Days:**
   $$\text{Total LOP Days} = \text{Unapproved Leaves} + \text{Late Login Penalties} + \text{Task LOP Penalties}$$
   *(Note: 3 late arrivals after grace period = 0.5 Day LOP)*

4. **Calculate Net Pay:**
   $$\text{LOP Deduction} = \text{Per Day Salary} \times \text{Total LOP Days}$$
   $$\text{Net Pay} = \text{Monthly Gross CTC} - \text{LOP Deduction}$$

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **MongoDB:** v6.0 or higher (Local or MongoDB Atlas)
- **Package Manager:** npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/ScriptXHrms/ScriptX_HRMS.git
cd ScriptX_HRMS
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Copy and configure environment variables
cp .env.example .env

# Initialize database baseline (creates first Admin, leave types, and policy text)
npm run setup -- admin@script-x.in YourStrongPassword123

# Start backend development server
npm run dev
```
Backend API will be live on: `http://localhost:5000`

### 3. Admin Portal Setup
```bash
cd ../Admin
npm install

# Start Vite development server
npm run dev
```
Admin Portal will be live on: `http://localhost:5173`

### 4. Employee Portal Setup
```bash
cd ../Employee
npm install

# Start Vite development server
npm run dev
```
Employee Portal will be live on: `http://localhost:5174`

---

## ⚙️ Environment Configuration

### Backend (`Backend/.env`)
```ini
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scriptx_hrms

# Generate via: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_at_least_48_bytes

# Generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DATA_KEY=your_32_byte_hex_encryption_key_for_subscriptions

# Whitelisted frontend URLs separated by commas
CLIENT_URL=http://localhost:5173,http://localhost:5174,https://portalscriptx.web.app,https://employeescriptx.web.app,https://portal.script-x.in,https://employee.script-x.in

COOKIE_SECURE=false

# Render keep-alive (Optional)
BACKEND_URL=

# SMTP Email Configuration (Optional for forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=ScriptX HRMS <no-reply@script-x.in>
```

### Admin Portal (`Admin/.env.development` / `.env.production`)
```ini
# Development
VITE_EMPLOYEE_URL=http://localhost:5174/employee/login

# Production
VITE_API_URL=https://scriptx-hrms.onrender.com
VITE_EMPLOYEE_URL=https://employee.script-x.in/employee/login
```

### Employee Portal (`Employee/.env.development` / `.env.production`)
```ini
# Development
VITE_ADMIN_URL=http://localhost:5173/admin/login

# Production
VITE_API_URL=https://scriptx-hrms.onrender.com
VITE_ADMIN_URL=https://portal.script-x.in/admin/login
```

---

## 🚢 Deployment Guide

### Backend (Render / VPS)
- Build Command: `npm install`
- Start Command: `npm start`
- Auto keep-alive script is baked into `server.js` using self-pinging to avoid cold-start delays on Render free instances.

### Frontends (Firebase Hosting / Vercel / Netlify)
Both `Admin` and `Employee` can be built and deployed independently:
```bash
# Build Admin
cd Admin
npm run build

# Build Employee
cd Employee
npm run build
```
Deploy the generated `dist/` folders to Firebase Hosting or your CDN of choice.

---

## 📄 License & Ownership
Copyright © 2026 ScriptX Private Limited. All rights reserved.  
Proprietary software developed for ScriptX internal operations and client enterprise deployments.
