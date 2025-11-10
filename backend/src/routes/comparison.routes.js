const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Placeholder routes - will be implemented in Days 9-10
router.get('/compare', (req, res) => {
  res.status(501).json({ message: 'Compare contracts endpoint - Coming soon' });
});

module.exports = router;

