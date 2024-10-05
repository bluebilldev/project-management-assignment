const User = require('../models/User');
const Task = require('../models/Task');

// Middleware to check for required roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied.` });
    }
    next();
  };
};

// Middleware to check if the logged in user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (error) {
    res.status(500).send('Server error');
  }
};

module.exports = { authorize, isAdmin };
