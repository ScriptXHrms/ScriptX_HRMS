import { Router } from 'express';
import * as dailyReportsController from '../controllers/dailyReports.controller.js';

const router = Router();

router.get('/', dailyReportsController.getDailyReports);
router.post('/', dailyReportsController.createDailyReport);
router.put('/:id', dailyReportsController.updateDailyReport);
router.delete('/:id', dailyReportsController.deleteDailyReport);

export default router;
