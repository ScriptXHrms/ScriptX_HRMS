import { Router } from 'express';
import { requireModule } from '../middleware/auth.js';
import {
  getPayroll,
  updatePayrollOverride,
  deletePayrollOverride,
  markPayrollPaid,
} from '../controllers/payroll.controller.js';

const router = Router();
const view = requireModule('finance');
const manage = requireModule('finance', 'manage');

router.get('/', view, getPayroll);
router.put('/override', manage, updatePayrollOverride);
router.delete('/override/:id', manage, deletePayrollOverride);
router.post('/mark-paid', manage, markPayrollPaid);

export default router;
