const { check, validationResult, query } = require('express-validator');

const createTaskValidation = [
    check('title', 'Please include a task title').exists(),
    check('description', 'Please include a task description').exists(),
    check('status', 'Please include a task status')
        .exists()
        .isIn(['To Do', 'In Progress', 'Completed'])
        .withMessage('Invalid task status'),
    check('priority', 'Please include a task priority').exists(),
    check('dueDate', 'Please include a valid project deadline in DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY format')
        .exists()
        .matches(/^(\d{2}[-\/]\d{2}[-\/](\d{4}|\d{2}))$/)
        .withMessage('Invalid deadline format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY'),
    check('projectId')
        .exists()
        .withMessage('Please include a valid project id')
        .isMongoId()
        .withMessage('Invalid project id format'),
    check('assignedUser')
        .exists()
        .withMessage('Please include a valid assigned user id')
        .isMongoId()
        .withMessage('Invalid user id format'),
    check('label').optional()    
];

const taskIdValidation = [
    check('id')
        .exists()
        .withMessage('Please include a valid task id')
        .isMongoId()
        .withMessage('Invalid task id format')
]

const taskQueryValidation = [
    check('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page number must be a positive integer'),
    check('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Limit must be a positive integer'),
    query('project')
        .optional()
        .isMongoId()
        .withMessage('Invalid project id format'),

    query('user')
        .optional()
        .isMongoId()
        .withMessage('Invalid user id format'),

    query('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Completed'])
        .withMessage('Invalid task status'),

    query('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Invalid task priority type'),

    query('startDate')
        .optional()
        .matches(/^(\d{2}[-\/]\d{2}[-\/](\d{4}|\d{2}))$/)
        .withMessage('Invalid dueDate format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY'),

    query('endDate')
        .optional()
        .matches(/^(\d{2}[-\/]\d{2}[-\/](\d{4}|\d{2}))$/)
        .withMessage('Invalid dueDate format, use DD/MM/YYYY, DD-MM-YYYY, DD-MM-YY, or DD/MM/YY'),

    query('overdue')
        .optional()
        .isBoolean()
        .withMessage('Overdue must be a boolean value'),
];

//Project Route Validations
const createProjectValidation = [
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


const validateRequest = (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => {
            return { message: error.msg };
        });
        return res.status(400).json({ errors: formattedErrors });
    }
    next();
};

module.exports = {
    createTaskValidation,
    taskIdValidation,
    taskQueryValidation,
    createProjectValidation,
    projectIdValidation,
    validateRequest
}