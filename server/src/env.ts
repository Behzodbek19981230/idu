import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`.env da ${name} ko'rsatilmagan`);
  }

  return value;
}

export const env = {
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://idu:idu@localhost:5432/idu'
  ),

  port: Number(process.env.PORT ?? 4000),

  clientOrigin:
    process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',

  jwtSecret: required(
    'JWT_SECRET',
    'dev-secret-ozgartiring'
  ),

  adminLogin: process.env.ADMIN_LOGIN ?? 'admin',

  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
};