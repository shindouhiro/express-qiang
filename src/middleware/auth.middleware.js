const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (allowedUserTypes) => {
  return (req, res, next) => {
    if (!allowedUserTypes.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
  };
}; 
