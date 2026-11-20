import { Router } from 'express';
import { employeePortal, requireModule } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/admin', requireModule('dashboard'), dashboardController.getAdminDashboard);
router.get('/employee', employeePortal, dashboardController.getEmployeeDashboard);

export default router;
