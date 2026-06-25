const jwt = require('jsonwebtoken');
const { query } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requirePlan = (planLevel) => {
  return (req, res, next) => {
    try {
      const userId = req.user.id;
      const users = query(`SELECT plan FROM app_users WHERE id = '${userId}'`);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userPlan = users[0].plan || 'free';
      const plansList = ['free', 'starter', 'professional', 'agency'];
      
      const userLevel = plansList.indexOf(userPlan);
      const requiredLevel = plansList.indexOf(planLevel);
      
      if (userLevel === -1 || requiredLevel === -1 || userLevel < requiredLevel) {
        return res.status(403).json({ error: `This feature requires a ${planLevel} plan or higher.` });
      }
      
      req.user.plan = userPlan;
      next();
    } catch (error) {
      console.error('Plan check error:', error);
      res.status(500).json({ error: 'Failed to verify plan' });
    }
  };
};

module.exports = { authenticateToken, requirePlan, JWT_SECRET };
