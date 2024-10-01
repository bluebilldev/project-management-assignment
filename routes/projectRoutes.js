const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getUserProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createProject);

router.get('/', protect, getUserProjects);

router.get('/:projectId', protect, getProjectById);

router.put('/:projectId', protect, updateProject);

router.delete('/:projectId', protect, deleteProject);

module.exports = router;
