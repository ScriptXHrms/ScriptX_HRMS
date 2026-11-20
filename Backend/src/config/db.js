import mongoose from 'mongoose';

// Give up on an unreachable database in seconds rather than half a minute, and prefer IPv4,
// which avoids slow connects to Atlas on some Windows networks.
const OPTIONS = { serverSelectionTimeoutMS: 10000, family: 4 };

const stamp = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set. Copy .env.example to .env first.');
  // A dropped connection (laptop asleep, Wi-Fi change) makes requests wait until it comes back; log it so slow pages can be traced.
  mongoose.connection.on('disconnected', () => console.warn(`[${stamp()}] MongoDB disconnected. Requests wait until it reconnects.`));
  mongoose.connection.on('reconnected', () => console.log(`[${stamp()}] MongoDB reconnected.`));
  await mongoose.connect(uri, OPTIONS);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
