import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/scripts/makeAdmin.js <email>');
    process.exit(1);
  }
  await connectToDatabase();
  const user = await User.findOneAndUpdate({ email }, { $set: { isAdmin: true } }, { new: true });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  console.log('Promoted to admin:', { id: user._id.toString(), email: user.email });
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });


