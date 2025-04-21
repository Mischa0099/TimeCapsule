import nodemailer from 'nodemailer';
import Capsule from '../models/Capsule.js';
import User from '../models/User.js';

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASS || 'password'
    }
  });
};

// Send email notification
export const sendEmailNotification = async (user, capsule) => {
  try {
    const transporter = createTransporter();
    
    const emailContent = {
      from: `"TimeCapsule" <${process.env.EMAIL_FROM || 'noreply@timecapsule.app'}>`,
      to: user.email,
      subject: `Your Time Capsule "${capsule.title}" is Now Available!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #6366f1; text-align: center;">Your Time Capsule is Ready!</h1>
          
          <p>Hello ${user.name},</p>
          
          <p>Great news! Your time capsule "<strong>${capsule.title}</strong>" is now available to open.</p>
          
          <p>You created this time capsule on ${new Date(capsule.createdAt).toLocaleDateString()} and set it to be opened today.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsule/${capsule._id}" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Open Your Time Capsule
            </a>
          </div>
          
          <p>Take a moment to revisit your memories and rediscover what you preserved for your future self.</p>
          
          <p>Best regards,<br>The TimeCapsule Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(emailContent);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
};

// Check for capsules ready to be opened and send notifications
export const checkAndSendNotifications = async () => {
  try {
    const now = new Date();
    
    // Find capsules that are ready to be opened and haven't had notifications sent
    const readyCapsules = await Capsule.find({
      openDate: { $lte: now },
      notificationSent: false
    });
    
    console.log(`Found ${readyCapsules.length} capsules ready for notifications`);
    
    for (const capsule of readyCapsules) {
      // Get user info
      const user = await User.findById(capsule.user);
      
      if (!user) {
        console.log(`User not found for capsule ${capsule._id}`);
        continue;
      }
      
      // Skip if user has disabled email notifications
      if (!user.notificationPreferences.email) {
        console.log(`User ${user._id} has disabled email notifications`);
        
        // Mark as notified anyway
        capsule.notificationSent = true;
        await capsule.save();
        continue;
      }
      
      // Send email notification
      const emailSent = await sendEmailNotification(user, capsule);
      
      if (emailSent) {
        console.log(`Notification sent for capsule ${capsule._id} to user ${user.email}`);
        
        // Update capsule to mark notification as sent
        capsule.notificationSent = true;
        await capsule.save();
      }
    }
    
    return `Processed ${readyCapsules.length} notifications`;
  } catch (error) {
    console.error('Check notifications error:', error);
    throw error;
  }
};