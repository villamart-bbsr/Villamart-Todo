const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.getAllTasks);
router.get('/status/:status', auth, taskController.getTasksByStatus);
router.get('/admin/dashboard', auth, taskController.getAdminDashboard);
router.put('/:taskId/status', auth, taskController.updateTaskStatus);
router.put('/:taskId', auth, taskController.updateTask);
router.put('/:taskId/assign', auth, taskController.assignTask);
router.put('/:taskId/points/:pointIdx/tick', auth, taskController.tickPoint);
router.put('/:taskId/points/:pointIdx/untick', auth, taskController.untickPoint);
router.post('/:taskId/files', auth, taskController.addFileToTask);
router.delete('/:taskId', auth, taskController.deleteTask);

module.exports = router;
