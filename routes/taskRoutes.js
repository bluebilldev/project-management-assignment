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
const { createTaskValidation, taskIdValidation, taskQueryValidation, validateRequest } = require('../utils/validators')
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const redisCache = require('../middleware/redisCache')

// @route POST /tasks
router.post('/', protect, createTaskValidation, validateRequest, (req, res) => {
  createTask(req, res);
});

// @route   GET /tasks?
router.get('/', protect, redisCache, taskQueryValidation, validateRequest, (req, res) => {
  getTasks(req, res);
});

// @route   GET /groupedByUser (ADMIN ONLY)
router.get('/groupedByUser', protect, isAdmin, getTasksGroupedByUser);

// @route   GET /groupedByUser
router.get('/groupedByPriority', protect, getTasksGroupedByPriority);

// @route   PUT /tasks/:id
router.put('/:id', protect, taskIdValidation, validateRequest, (req, res) => {
  updateTask(req, res);
});

// @route   DELETE /tasks/:id
router.delete('/:id', protect, taskIdValidation, validateRequest, (req, res) => {
  deleteTask(req, res);
});

module.exports = router;
