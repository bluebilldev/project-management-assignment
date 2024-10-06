const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  getProjectTasksById
} = require('../controllers/projectController');
const {
  createProjectValidation,
  projectIdValidation,
  validateRequest
} = require('../utils/validators')
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

router.post('/', protect, isAdmin, createProjectValidation, validateRequest, (req, res) => {
  createProject(req, res);
});

router.get('/', protect, getProjects);

router.get('/:id', protect, projectIdValidation, validateRequest, (req, res) => {
  getProjectById(req, res);
});

router.get('/:id/tasks', protect, projectIdValidation, validateRequest, (req, res) => {
  getProjectTasksById(req, res);
});

module.exports = router;
