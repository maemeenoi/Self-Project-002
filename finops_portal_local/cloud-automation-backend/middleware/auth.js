const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

/**
 * Middleware to verify that a request contains a valid JWT.  If valid the
 * decoded token is attached to req.user and the request is passed along.
 * Otherwise an unauthorized error is returned.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed token' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Create a JWT for a user payload.  This function centralizes token
 * generation so that the secret and expiration are defined in one place.
 *
 * @param {Object} payload - object to encode into the token
 * @returns {string} JWT
 */
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

module.exports = {
  authenticate,
  createToken,
};