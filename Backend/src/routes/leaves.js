import { Router } from 'express';
import { employeePortal } from '../middleware/access.js';
import { uploader } from '../middleware/upload.js';
import {
  getMyLeaves,
  applyLeave,
  cancelMyLeave,
  getAdminLeaves,
  createAdminLeave,
  getLeaveReport,
  updateLeaveStatus,
  deleteLeave,
} from '../controllers/leaves.controller.js';

const router = Router();
const upload = uploader('leaves');

/* ---- Employee ---- */
router.get('/me', employeePortal, getMyLeaves);
router.post('/apply', employeePortal, upload.single('attachment'), applyLeave);
router.post('/me/:id/cancel', employeePortal, cancelMyLeave);

/* ---- Admin ---- */
router.get('/', getAdminLeaves);
router.post('/admin', createAdminLeave);
router.get('/report', getLeaveReport);
router.put('/:id/status', updateLeaveStatus);
router.delete('/:id', deleteLeave);

export default router;
