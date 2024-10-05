const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  getProjectTasksById
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { check, validationResult } = require('express-validator');


const projectValidation = [
  check('name', 'Please include a project name').exists(),
  check('description', 'Please include a project description').exists(),
  check('deadline', 'Please include a valid project deadline in DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY format')
  .exists()
  .matches(/^(\d{2}[-\/]\d{2}[-\/](\d{4}|\d{2}))$/)
  .withMessage('Invalid deadline format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY'),
];

const projectIdValidation = [
  check('id')
    .exists()
    .withMessage('Please include a valid project id')
    .isMongoId()
    .withMessage('Invalid project id format')
]

router.post('/', protect, isAdmin, projectValidation, (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => {
      return { message: error.msg };
    });
    return res.status(400).json({ errors: formattedErrors });
  }

  // Call the controller function to create the project
  createProject(req, res);
});

router.get('/', protect, getProjects);

router.get('/:id', protect, projectIdValidation, (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => {
      return { message: error.msg };
    });
    return res.status(400).json({ errors: formattedErrors });
  }

  getProjectById(req, res);
});

router.get('/:id/tasks', protect, projectIdValidation, (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => {
      return { message: error.msg };
    });
    return res.status(400).json({ errors: formattedErrors });
  }

  getProjectTasksById(req, res);
});

module.exports = router;
