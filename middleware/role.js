const {protect} = require('./auth')

// Middleware to check for required roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user.role}' is not authorized to access this resource` });
    }
    next();
  };
};

module.exports = { authorize };
