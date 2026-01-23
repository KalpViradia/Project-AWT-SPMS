
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Dotenv error:', result.error);
}

console.log('DATABASE_URL=' + (process.env.DATABASE_URL || ''));
console.log('AUTH_SECRET=' + (process.env.AUTH_SECRET || ''));
