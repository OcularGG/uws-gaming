const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate a secure random password
const password = crypto.randomBytes(16).toString('base64').replace(/[+/=]/g, '').substring(0, 12) + '@1A';
console.log('Generated secure password:', password);

// Hash the password
const hashedPassword = bcrypt.hashSync(password, 12);
console.log('Hashed password:', hashedPassword);

// Output SQL update statement
console.log('\nSQL Update Statement:');
console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@krakengaming.org';`);
