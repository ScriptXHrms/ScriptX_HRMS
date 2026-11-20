import { Router } from 'express';
import { employeePortal, requireModule } from '../middleware/auth.js';
import { uploader } from '../middleware/upload.js';
import * as employeesController from '../controllers/employees.controller.js';

const router = Router();
const view = requireModule('onboarding');
const manage = requireModule('onboarding', 'manage');
const documentUpload = uploader('employees');

/* ---- The signed-in employee ---- */
router.get('/me/profile', employeePortal, employeesController.getMyProfile);

/* ---- Admin ---- */
router.get('/', view, employeesController.getEmployees);
router.get('/:id', view, employeesController.getEmployeeById);
router.post('/', manage, employeesController.createEmployee);
router.put('/:id', manage, employeesController.updateEmployee);
router.delete('/:id', manage, employeesController.deleteEmployee);
router.post('/:id/password', manage, employeesController.changeEmployeePassword);
router.post('/:id/photo', manage, documentUpload.single('file'), employeesController.uploadEmployeePhoto);
router.post('/:id/documents', manage, documentUpload.single('file'), employeesController.uploadEmployeeDocuments);
router.delete('/:id/documents/:groupId/:fileId', manage, employeesController.deleteEmployeeDocument);

/* ---- Relieving ---- */
router.post('/:id/relieving', manage, employeesController.startRelieving);
router.put('/:id/relieving/checklist', manage, employeesController.updateRelievingChecklist);
router.post('/:id/relieved', manage, employeesController.completeRelieving);
router.post('/:id/reactivate', manage, employeesController.reactivateEmployee);

export default router;
