const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./lib/logger');
const { connectDB } = require('./lib/database');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authenticate } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./api/routes/auth');
const clientRoutes = require('./api/routes/clients');
const caseRoutes = require('./api/routes/cases');
const timeEntryRoutes = require('./api/routes/timeEntries');
const documentRoutes = require('./api/routes/documents');
const invoiceRoutes = require('./api/routes/invoices');
const expenseRoutes = require('./api/routes/expenses');
const userRoutes = require('./api/routes/users');
const reportRoutes = require('./api/routes/reports');
const searchRoutes = require('./api/routes/search');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', authenticate, clientRoutes);
app.use('/api/cases', authenticate, caseRoutes);
app.use('/api/time-entries', authenticate, timeEntryRoutes);
app.use('/api/documents', authenticate, documentRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/search', authenticate, searchRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 