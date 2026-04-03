
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const customerRoutes = require('./routes/customerRoutes');
const userRoutes = require('./routes/userRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const masterRoutes = require('./routes/masterRoutes');
const configRoutes = require('./routes/configRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const targetRoutes = require('./routes/targetRoutes');
const logRoutes = require('./routes/logRoutes');
const commRoutes = require('./routes/communicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const dataRoutes = require('./routes/dataRoutes');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Security Headers
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:3000", // React frontend
          "http://localhost:5000", // Backend
          "ws://localhost:5000"    // WebSocket (if used)
        ],
      },
    },
  })
);

// Rate Limiting (Prevent Brute Force on Auth)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login requests per window
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});

// General Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routing Layer
app.use('/api/auth', authLimiter, authRoutes);

// Protected API Routes
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/leads', authMiddleware, leadRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/master', authMiddleware, masterRoutes);
app.use('/api/config', authMiddleware, configRoutes);
app.use('/api/quotes', authMiddleware, quoteRoutes);
app.use('/api/targets', authMiddleware, targetRoutes);
app.use('/api/logs', authMiddleware, logRoutes);
app.use('/api/communications', authMiddleware, commRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/vendors', authMiddleware, vendorRoutes);
app.use('/api/data', authMiddleware, dataRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Internal Server Exception' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`---------------------------------------------------`);
    console.log(`🚀 Lumina CRM Secure Server Live at port: ${PORT}`);
    console.log(`---------------------------------------------------`);
});
