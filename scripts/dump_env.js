
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const secret = process.env.AUTH_SECRET || '';

fs.writeFileSync('scripts/env_dump.txt', `DATABASE_URL=${dbUrl}\nAUTH_SECRET=${secret}`);
