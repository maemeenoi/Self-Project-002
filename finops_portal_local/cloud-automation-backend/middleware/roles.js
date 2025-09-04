/**
 * Middleware factory for role-based access control.  Pass in an array of
 * allowed roles and the middleware will ensure that the authenticated user
 * possesses one of those roles before allowing the request to proceed.
 *
 * Usage: app.get('/admin', authenticate, requireRoles(['admin']), handler)
 *
 * @param {Array<string>} roles - allowed roles
 */
function requireRoles(roles) {
  return function (req, res, next) {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = {
  requireRoles,
};