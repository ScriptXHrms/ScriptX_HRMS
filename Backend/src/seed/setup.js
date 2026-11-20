/**
 * Prepares an empty database for real use: the first admin, company settings,
 * leave types and policy text. It only adds what is missing and never deletes,
 * so unlike `npm run seed` it is safe on any database.
 *
 *   npm run setup -- admin@company.com StrongPassword
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AdminUser, getSettings, LeaveType, Protocol } from '../models/index.js';
import { LEAVE_TYPES } from './baseline.js';
import { POLICIES } from './policies.js';

const [email, password] = process.argv.slice(2);

await mongoose.connect(process.env.MONGO_URI);
await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
console.log(`Setting up ${mongoose.connection.name}…`);

if (await AdminUser.exists({})) {
  console.log('An admin account already exists, so none was created.');
} else {
  if (!email || String(password ?? '').length < 8) {
    console.error('No admin account yet. Run: npm run setup -- admin@company.com StrongPassword (at least 8 characters)');
    await mongoose.disconnect();
    process.exit(1);
  }
  await AdminUser.create({ name: 'Admin', fullName: 'ScriptX Admin', email, password: await bcrypt.hash(password, 10) });
  console.log(`Admin account created: ${email}`);
}

await getSettings();
await Promise.all(LEAVE_TYPES.map((type) => LeaveType.updateOne({ shortCode: type.shortCode }, { $setOnInsert: type }, { upsert: true })));
await Promise.all(POLICIES.map((policy) => Protocol.updateOne({ key: policy.key }, { $setOnInsert: policy }, { upsert: true })));

await mongoose.disconnect();
console.log('Done.');
