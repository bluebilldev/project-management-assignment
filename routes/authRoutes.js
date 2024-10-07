const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');


//Setting 15 Min Rate Limiter
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts from this IP, try again after 15 Mins'
});

router.use(authLimiter);

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
