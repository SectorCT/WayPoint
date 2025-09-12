const fs = require('fs');
const path = require('path');

// Create .env file from env.example
const envExamplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  try {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created .env file from env.example');
    console.log('📝 Please edit server/.env with your email configuration');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
} else {
  console.log('⚠️  .env file already exists');
}

console.log('\n📧 Email Setup Instructions:');
console.log('1. Edit server/.env file with your email settings');
console.log('2. For Gmail: Use App Password (not regular password)');
console.log('3. Enable 2-Factor Authentication first');
console.log('4. Generate App Password: Google Account > Security > App passwords');
console.log('5. Run: npm install && npm start');
