import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import the User model
import User from './models/user.js';


import authRoutes from './modules/auth/index.js';
import manufacturingRoutes from './modules/manufacturing/index.js';
import tradingRoutes from './modules/trading/index.js';
import mediaRoutes from './modules/media/index.js';

// Load environment variables from .env
import dotenv from 'dotenv';
dotenv.config();



// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB

app.use((req, res, next) => {
  const start = Date.now(); // Track start time

  res.on('finish', () => {
    const duration = Date.now() - start; // Calculate response time
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next(); // Pass control to the next middleware
});

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// CRUD Routes
app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);
app.use('/manufacturing', manufacturingRoutes);
app.use('/trading', tradingRoutes);


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
