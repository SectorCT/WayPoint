# WayPoint Email Server

A secure email backend service for handling contact form submissions from the WayPoint website.

## Features

- ✅ Secure contact form processing
- ✅ Email validation and sanitization
- ✅ Rate limiting (5 requests per 15 minutes)
- ✅ CORS protection
- ✅ Professional email templates
- ✅ Auto-confirmation emails
- ✅ Error handling and logging

## Quick Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

**Option A: Automatic Setup**
```bash
node setup-env.js
```

**Option B: Manual Setup**
```bash
cp env.example .env
```

Then edit `server/.env` with your email configuration:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECIPIENT_EMAIL=your-email@gmail.com

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:5173
```

### 3. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS` (not your regular password!)

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

### 5. Test the Setup

Visit `http://localhost:3001/api/health` to verify the server is running.

## Alternative Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## API Endpoints

### POST `/api/contact`
Submit a contact form request.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "company": "Company Name",
  "phone": "+1 (555) 123-4567",
  "message": "I'm interested in a demo..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! Your demo request has been sent successfully."
}
```

### GET `/api/health`
Health check endpoint.

## Email Templates

The server sends two emails:

1. **Notification Email** (to you) - Contains all form data
2. **Confirmation Email** (to user) - Professional thank you message

## Security Features

- **Rate Limiting**: 5 requests per 15 minutes per IP
- **CORS Protection**: Only allows requests from specified origin
- **Input Validation**: Validates all form fields
- **Email Validation**: Ensures valid email format
- **Helmet**: Security headers
- **Error Handling**: Graceful error responses

## Frontend Integration

Update your contact form to send POST requests to `http://localhost:3001/api/contact`:

```javascript
const submitForm = async (formData) => {
  try {
    const response = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message
      console.log(result.message);
    } else {
      // Show error message
      console.error(result.message);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};
```

## Production Deployment

For production, consider:

1. **Environment Variables**: Use proper production values
2. **HTTPS**: Use SSL certificates
3. **Domain**: Update CORS_ORIGIN to your domain
4. **Email Service**: Consider using SendGrid, Mailgun, or AWS SES
5. **Process Manager**: Use PM2 or similar
6. **Reverse Proxy**: Use Nginx or Apache

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your Gmail app password
2. **CORS Errors**: Verify CORS_ORIGIN matches your frontend URL
3. **Rate Limited**: Wait 15 minutes or check your IP
4. **Email Not Received**: Check spam folder and email configuration

### Logs

Check server logs for detailed error information:

```bash
npm run dev
```

## Support

For issues or questions, check the logs or contact the development team.
