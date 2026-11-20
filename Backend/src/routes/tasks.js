import { Router } from 'express';
import { uploader } from '../middleware/upload.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  updateTaskTester,
  pauseTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
  addTaskDocument,
  deleteTaskDocument,
  addSubTask,
  updateSubTask,
  deleteSubTask,
} from '../controllers/tasks.controller.js';

const router = Router();
const upload = uploader('tasks');

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.put('/:id/status', updateTaskStatus);
router.put('/:id/tester', updateTaskTester);
router.put('/:id/pause', pauseTask);
router.delete('/:id', deleteTask);

// Comments
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', upload.array('files', 5), addTaskComment);

// Documents
router.post('/:id/documents', upload.single('file'), addTaskDocument);
router.delete('/:id/documents/:fileId', deleteTaskDocument);

// Sub tasks
router.post('/:id/subtasks', addSubTask);
router.put('/:id/subtasks/:subId', updateSubTask);
router.delete('/:id/subtasks/:subId', deleteSubTask);

export default router;
