# Email Notification Feature

This feature automatically sends email notifications to package recipients when their packages are marked as delivered.

## Features

- **Delivery Notifications**: Sends emails when packages are successfully delivered to recipients
- **Office Delivery Notifications**: Sends emails when packages are delivered to offices for pickup
- **Professional Email Templates**: Beautiful HTML email templates with company branding
- **Driver Information**: Includes driver name in notifications for better customer experience

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the server directory with the following email configuration:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_HOST_PASSWORD`

### 3. Alternative Email Providers

You can use other SMTP providers by changing the `EMAIL_HOST`:

- **Outlook/Hotmail**: `smtp-mail.outlook.com`
- **Yahoo**: `smtp.mail.yahoo.com`
- **Custom SMTP**: Your provider's SMTP server

### 4. Database Migration

Run the database migration to add the email field:

```bash
python manage.py makemigrations delivery
python manage.py migrate
```

## How It Works

### 1. Package Delivery Flow

1. Driver marks package as delivered using the mobile app
2. System automatically sends email to `package.recipientEmail`
3. Email includes package details and driver information

### 2. Office Delivery Flow

1. Driver delivers undelivered packages to office
2. System sends pickup notification to recipients
3. Email includes office location and pickup instructions

### 3. Email Templates

- **Delivery Notification**: `delivery/templates/delivery/email/delivery_notification.html`
- **Office Pickup**: `delivery/templates/delivery/email/office_delivery_notification.html`

## Testing

### Test Email Service

Run the test script to verify email functionality:

```bash
python test_email.py
```

**Note**: Update the test email address in `test_email.py` before running.

### Test with Real Data

1. Create a package with a valid email address
2. Mark it as delivered through the API
3. Check if the email is received

## API Changes

### Updated Endpoints

- `POST /delivery/packages_mark/` - Now accepts `driver_username` parameter
- `POST /delivery/office-delivery/` - Automatically sends pickup notifications

### Client Updates Required

Update client-side calls to include driver username:

```typescript
// Before
await markPackageAsDelivered(packageId);

// After
await markPackageAsDelivered(packageId, driverUsername);
```

## Error Handling

- Email failures don't prevent package delivery
- All email errors are logged for debugging
- System continues to function even if email service is down

## Customization

### Email Templates

Edit the HTML templates in `delivery/templates/delivery/email/` to:
- Change company branding
- Modify email content
- Update styling and colors

### Company Information

Update company details in `delivery/email_service.py`:
- Company name
- Contact information
- Business hours

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check email credentials and app passwords
2. **Connection Refused**: Verify SMTP server and port settings
3. **Templates Not Found**: Ensure template directory structure is correct

### Debug Mode

Enable debug logging in Django settings to see detailed email errors:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'delivery.email_service': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Security Considerations

- Never commit email credentials to version control
- Use environment variables for sensitive information
- Consider using dedicated email service accounts
- Implement rate limiting for email sending if needed

## Future Enhancements

- Email delivery tracking and analytics
- Customizable email templates per company
- SMS notifications as alternative
- Delivery confirmation emails
- Customer feedback collection
