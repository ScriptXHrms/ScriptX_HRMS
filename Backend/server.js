import 'dotenv/config';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import { protect } from './src/middleware/auth.js';
import { errorHandler, notFoundHandler } from './src/middleware/error.js';
import attendanceRoutes from './src/routes/attendance.js';
import authRoutes from './src/routes/auth.js';
import dailyReportRoutes from './src/routes/dailyReports.js';
import dashboardRoutes from './src/routes/dashboard.js';
import employeeRoutes from './src/routes/employees.js';
import financeRoutes, { syncUnsyncedLedgers } from './src/routes/finance.js';
import leaveRoutes from './src/routes/leaves.js';
import masterRoutes from './src/routes/masters.js';
import payrollRoutes from './src/routes/payroll.js';
import requestRoutes from './src/routes/requests.js';
import taskRoutes from './src/routes/tasks.js';
import { startAutoLogout } from './src/utils/autoLogout.js';
import { dummyHandler, startDummyPing } from './src/dummy/dummy.js';

for (const key of ['JWT_SECRET', 'MONGO_URI']) {
  if (!process.env[key]) {
    console.error(`${key} is not set. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://portalscriptx.web.app',
  'https://portalscriptx.firebaseapp.com',
  'https://employeescriptx.web.app',
  'https://employeescriptx.firebaseapp.com',
  'https://portal.script-x.in',
  'https://employee.script-x.in',
  'https://script-x.in',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile)
      if (!origin) return callback(null, true);

      // Allow if origin is explicitly in allowedOrigins, or matches Firebase or localhost
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.web\.app$/.test(origin) ||
        /^https:\/\/.*\.firebaseapp\.com$/.test(origin) ||
        /^https:\/\/([^.]+\.)?script-x\.in$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Portal'],
  }),
);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/dummy', dummyHandler);
app.get('/dummy', dummyHandler);
app.use('/api/auth', authRoutes);

// Uploaded HR documents are private, so they sit behind the session too.
app.use('/uploads', protect, express.static(path.resolve('uploads')));

app.use('/api', protect);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', masterRoutes);

// In production this process also serves both built portals.
if (process.env.NODE_ENV === 'production') {
  for (const [route, folder] of [['/admin', '../Admin/dist'], ['/employee', '../Employee/dist']]) {
    const dist = path.resolve(folder);
    app.use(route, express.static(dist));
    app.get(new RegExp(`^${route}(/.*)?$`), (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.get('/', (req, res) => res.redirect('/admin/login'));
}

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

await connectDB();
await syncUnsyncedLedgers();
startAutoLogout();
startDummyPing();
app.listen(port, (error) => {
  // Express 5 hands listen failures, such as a port in use, to this callback.
  if (error) {
    console.error(`Could not start on port ${port}: ${error.message}`);
    process.exit(1);
  }
  console.log(`ScriptX HRMS API listening on http://localhost:${port}`);
});
