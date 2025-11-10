require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { connectDatabase } = require('./database/connection');
const { connectRedis } = require('./config/redis');
const authRoutes = require('./routes/auth.routes');
const contractRoutes = require('./routes/contract.routes');
const clauseRoutes = require('./routes/clause.routes');
const analysisRoutes = require('./routes/analysis.routes');
const comparisonRoutes = require('./routes/comparison.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/clauses', clauseRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/comparison', comparisonRoutes);

app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

async function startServer() {
  try {
    await connectDatabase();
    logger.info('✅ Database connected');

    await connectRedis();
    logger.info('✅ Redis connected');

    app.listen(PORT, () => {
      logger.info(`🚀 LexLens Backend running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 