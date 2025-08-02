// utils/authMiddleware.js

// 🔐 Require login
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // Redirect to login if not authenticated
  return res.redirect('/login');
}

// 🔐 Require specific role (user, agent, admin)
function ensureRole(role) {
  return function (req, res, next) {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }

    // Optionally log the role mismatch for debugging
    console.warn(`Access denied. Required role: ${role}, Found: ${req.session?.user?.role}`);
    
    // Redirect to login if not authorized
    return res.redirect('/login');
  };
}

// 🌐 Export for use in routes
module.exports = {
  ensureAuth,
  ensureRole
};
