const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const { check, validationResult } = require('express-validator');


const loginValidation =
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ]

router.post('/login', loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => {
      return { message: error.msg };
    });
    return res.status(400).json({ errors: formattedErrors });
  }
  loginUser(req, res);
});

module.exports = router;
