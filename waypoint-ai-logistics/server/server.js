const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://192.168.0.109:8080',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.'
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email template
const createEmailTemplate = (formData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #F39358; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">WayPoint AI Logistics</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #F39358; padding-bottom: 10px;">
          Contact Information
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #F39358; margin-bottom: 10px;">Personal Details</h3>
          <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #F39358;">${formData.email}</a></p>
          ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
        </div>
        
        ${formData.company ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #F39358; margin-bottom: 10px;">Company Information</h3>
          <p><strong>Company:</strong> ${formData.company}</p>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #F39358; margin-bottom: 10px;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #F39358; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">${formData.message}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p>This message was sent from the WayPoint AI Logistics contact form.</p>
          <p>Submitted on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;
};

// Validation function
const validateContactData = (data) => {
  const errors = [];
  
  if (!data.firstName || !data.firstName.trim()) {
    errors.push('First name is required');
  }
  
  if (!data.lastName || !data.lastName.trim()) {
    errors.push('Last name is required');
  }
  
  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.message || !data.message.trim()) {
    errors.push('Message is required');
  }
  
  return errors;
};

// Contact form endpoint
app.post('/api/contact', limiter, async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate input
    const validationErrors = validateContactData(formData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }
    
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing');
      return res.status(500).json({
        success: false,
        message: 'Email service is temporarily unavailable. Please try again later.'
      });
    }
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Email service error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Email service is temporarily unavailable. Please try again later.'
      });
    }
    
    // Email options
    const mailOptions = {
      from: `"WayPoint Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      html: createEmailTemplate(formData),
      text: `
        New Contact Form Submission - WayPoint AI Logistics
        
        Name: ${formData.firstName} ${formData.lastName}
        Email: ${formData.email}
        ${formData.phone ? `Phone: ${formData.phone}` : ''}
        ${formData.company ? `Company: ${formData.company}` : ''}
        
        Message:
        ${formData.message}
        
        Submitted on: ${new Date().toLocaleString()}
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });
    
  } catch (error) {
    console.error('Email sending error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'WayPoint Email Service is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WayPoint AI Logistics Email Service',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WayPoint Email Server running on port ${PORT}`);
  console.log(`📧 Email service configured for: ${process.env.EMAIL_USER}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`📝 Contact form endpoint: http://localhost:${PORT}/api/contact`);
});

module.exports = app;
