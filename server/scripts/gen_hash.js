import bcrypt from 'bcrypt';
const a = await bcrypt.hash('AdminPassword123!', 12);
const m = await bcrypt.hash('MahasiswaPassword123!', 12);
console.log('ADMIN:' + a);
console.log('MHS:' + m);
