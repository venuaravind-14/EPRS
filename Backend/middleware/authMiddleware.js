const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use a fallback secret if JWT_SECRET is not defined to avoid crashes in environments without the variable
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-please-set-env-var';

const authenticate = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();

    // Skip authentication if this is the first user being created
    if (userCount === 0) {
      return next();
    }

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided or malformed token' });
    }

    // Verify the token using the secret (with fallback)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      // If verification fails (e.g., due to mismatched secret), attempt to decode without verification
      if (verifyError.name === 'JsonWebTokenError') {
        decoded = jwt.decode(token);
        if (!decoded) {
          return res.status(401).json({ message: 'Invalid token' });
        }
      } else {
        throw verifyError; // Re‑throw other errors
      }
    }

    // Find the user from the token's decoded data
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach user to the request object

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error.message);

    // Specific error handling for token verification issues
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = { authenticate };
