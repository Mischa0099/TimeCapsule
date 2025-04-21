import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import schedule from 'node-schedule';

// Route imports
import authRoutes from './routes/auth.js';
import capsuleRoutes from './routes/capsules.js';

// Service import (for scheduled jobs)
import { checkAndSendNotifications } from './services/notificationService.js';

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving (optional media, like uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes (important: define BEFORE wildcard route)
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error caught by global handler:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Serve React frontend (after all API routes)
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // Schedule a job to check notifications every hour
    schedule.scheduleJob('0 * * * *', async () => {
      try {
        await checkAndSendNotifications(); // Implemented in your service
        console.log('🔔 Notification job completed');
      } catch (error) {
        console.error('❌ Notification job error:', error);
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });
