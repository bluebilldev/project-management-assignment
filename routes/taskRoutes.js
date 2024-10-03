const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTasksGroupedByUser,
  getTasksGroupedByPriority,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// @route   POST /api/tasks
router.post('/', protect, createTask);

// @route   GET /api/tasks?
router.get('/', protect, getTasks);

// @route   GET /api/groupedByUser
router.get('/groupedByUser', protect, getTasksGroupedByUser);

// @route   GET /api/groupedByUser
router.get('/groupedByPriority', protect, getTasksGroupedByPriority);

// @route   PUT /api/tasks/:taskId
router.put('/:taskId', protect, updateTask);

// @route   DELETE /api/tasks/:taskId
router.delete('/:taskId', protect, deleteTask);

module.exports = router;
