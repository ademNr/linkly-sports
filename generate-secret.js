// Quick script to generate NEXTAUTH_SECRET
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('\n✅ Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\n📝 Copy this value and add it to your .env.local file as:');
console.log(`NEXTAUTH_SECRET=${secret}\n`);

