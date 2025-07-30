const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ msg: 'Token invalid' });
  }
};

const admin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ msg: 'Admin only' });
  next();
};

module.exports = { auth, admin };
