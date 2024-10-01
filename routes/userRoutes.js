const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { registerUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');


//@route Post /users
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    registerUser(req, res);
  });

// @route   PUT /users/:id
router.put('/:id', protect, updateUserProfile);

module.exports = router;
