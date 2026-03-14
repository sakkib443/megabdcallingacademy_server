import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(config.database_url as string);
  isConnected = true;
  console.log('🗄️  Database connected successfully');
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
