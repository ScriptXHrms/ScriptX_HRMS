import { Router } from 'express';
import { employeePortal, requireModule } from '../middleware/auth.js';
import * as attendanceController from '../controllers/attendance.controller.js';

const router = Router();
const view = requireModule('attendance');
const manage = requireModule('attendance', 'manage');

/* ---- Employee: punch in / out ---- */
router.get('/me/today', employeePortal, attendanceController.getTodayAttendance);
router.post('/mark', employeePortal, attendanceController.markAttendance);
router.get('/me/month', employeePortal, attendanceController.getMyMonth);

/* ---- Admin ---- */
router.get('/daily', view, attendanceController.getDaily);
router.get('/tracker', view, attendanceController.getTracker);
router.get('/monthly', view, attendanceController.getMonthly);
router.get('/overall', view, attendanceController.getOverall);
router.get('/admin-marks', view, attendanceController.getAdminMarks);
router.post('/admin-mark', manage, attendanceController.createAdminMark);
router.put('/:id', manage, attendanceController.updateAttendance);
router.delete('/:id', manage, attendanceController.deleteAttendance);

export default router;
