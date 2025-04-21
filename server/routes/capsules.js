import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import Capsule from '../models/Capsule.js';
import Media from '../models/Media.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
//
router.get('/me', authenticate, (req, res) => {
  res.json(req.user); // Just return user info
});

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images and videos
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  }
});

// Get all capsules for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const capsules = await Capsule.find({ user: req.user._id })
      .sort({ openDate: 1 })
      .lean();

    res.json(capsules);
  } catch (error) {
    console.error('Get capsules error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get a specific capsule by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    res.json(capsule);
  } catch (error) {
    console.error('Get capsule error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get media files for a specific capsule (only if it's openable)
router.get('/:id/media', authenticate, async (req, res) => {
  try {
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check if capsule is openable
    if (new Date(capsule.openDate) > new Date()) {
      return res.status(403).json({
        message: `This capsule will be available for viewing on ${capsule.openDate}`
      });
    }

    const media = await Media.find({
      capsuleId: capsule._id,
      user: req.user._id
    }).lean();

    res.json(media);
  } catch (error) {
    console.error('Get capsule media error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create a new capsule
router.post('/', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    const { title, message, openDate } = req.body;
    const files = req.files || [];
    

    // Create capsule
    const capsule = new Capsule({
      title,
      message: message || '',
      openDate,
      user: req.user._id,
      hasMessage: !!message && message.trim().length > 0,
      hasImages: files.some(file => file.mimetype.startsWith('image/')),
      hasVideos: files.some(file => file.mimetype.startsWith('video/'))
    });

    await capsule.save();

    // Save media files
    if (files.length > 0) {
      const mediaPromises = files.map(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';

        const media = new Media({
          capsuleId: capsule._id,
          filename: file.filename,
          originalFilename: file.originalname,
          fileType,
          path: `uploads/${file.filename}`,
          user: req.user._id
        });

        return media.save();
      });

      await Promise.all(mediaPromises);
    }

    res.status(201).json({
      message: 'Capsule created successfully',
      capsule
    });
  } catch (error) {
    console.error('Create capsule error:', error);

    // Delete uploaded files if an error occurs
    if (req.files && req.files.length > 0) {
      const deleteFiles = req.files.map(file =>
        fs.promises.unlink(file.path).catch(err => console.error(`Error deleting file: ${file.path}`, err))
      );
      await Promise.all(deleteFiles);
    }

    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete a capsule
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Find capsule
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Find and delete associated media files
    const media = await Media.find({
      capsuleId: capsule._id,
      user: req.user._id
    });

    // Delete physical files
    const deleteFiles = media.map(file =>
      fs.promises.unlink(path.join(__dirname, '../../', file.path)).catch(err => console.error(`Error deleting file ${file.path}:`, err))
    );
    await Promise.all(deleteFiles);

    // Delete media records from DB
    await Media.deleteMany({
      capsuleId: capsule._id,
      user: req.user._id
    });

    // Delete capsule
    await capsule.remove();

    res.json({ message: 'Capsule deleted successfully' });
  } catch (error) {
    console.error('Delete capsule error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
