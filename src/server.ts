import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

// ─── Vercel Serverless: Cache connection across warm invocations ───
let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };
    cached.promise = mongoose
      .connect(config.database_url as string, opts)
      .then((m) => {
        console.log('🗄️  Database connected successfully');
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// For local development
const PORT = config.port || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// For Vercel serverless
export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
