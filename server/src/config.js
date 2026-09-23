import 'dotenv/config';
const test = process.env.NODE_ENV === 'test';
const config = {
  port: Number(process.env.PORT || 3000),
  databasePath: process.env.DATABASE_PATH || './database/ledgerly.db',
  jwtSecret: process.env.JWT_SECRET || (test ? 'test-secret-that-is-at-least-32-characters' : ''),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};
if (!test && config.jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
export default config;
