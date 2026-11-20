import { Router } from 'express';
import { employeePortal, requireModule } from '../middleware/access.js';
import {
  getMyRequests,
  createMyRequest,
  cancelMyRequest,
  getAdminRequests,
  updateRequestStatus,
  deleteRequest,
} from '../controllers/requests.controller.js';

const router = Router();

/* ---- Employee ---- */
router.get('/me', employeePortal, getMyRequests);
router.post('/me', employeePortal, createMyRequest);
router.post('/me/:id/cancel', employeePortal, cancelMyRequest);

/* ---- Admin ---- */
router.get('/', requireModule('requests'), getAdminRequests);
router.put('/:id/status', requireModule('requests', 'manage'), updateRequestStatus);
router.delete('/:id', requireModule('requests', 'manage'), deleteRequest);

export default router;
