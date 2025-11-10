const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Placeholder routes - will be implemented in Days 5-8
router.post('/:contractId/analyze', (req, res) => {
  res.status(501).json({ message: 'Analyze contract endpoint - Coming soon' });
});

router.get('/:contractId/clauses', (req, res) => {
  res.status(501).json({ message: 'Get clauses endpoint - Coming soon' });
});

router.get('/:contractId/summary', (req, res) => {
  res.status(501).json({ message: 'Get summary endpoint - Coming soon' });
});

module.exports = router;

