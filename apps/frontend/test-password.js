// Test admin login credentials
const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'admin123';
  const hashedPassword = '$2b$12$LQv3c1yqBw2LdBmRTr/LIed.uTx5qQNhpqnhQ.w8e/vJ2D0vMlY.q';

  console.log('Testing admin password...');
  console.log('Plain password:', plainPassword);
  console.log('Hashed password:', hashedPassword);

  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password is valid:', isValid);

  // Also test a new hash
  const newHash = await bcrypt.hash(plainPassword, 12);
  console.log('New hash:', newHash);
  const newValid = await bcrypt.compare(plainPassword, newHash);
  console.log('New hash is valid:', newValid);
}

testPassword().catch(console.error);
