import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`.env da ${name} ko'rsatilmagan`);
  }

  return value;
}

/**
 * CORS uchun ruxsat etilgan domenlar. Vergul bilan ajratiladi, oxiridagi `/` kesiladi
 * (brauzer Origin sarlavhasini hech qachon `/` bilan yubormaydi — eng ko'p uchraydigan xato).
 * `*` yozilsa — barcha domenlarga ruxsat.
 */
function parseOrigins(raw: string): string[] | '*' {
  const list = raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return list.includes('*') ? '*' : list;
}

export const env = {
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://idu:idu@localhost:5432/idu'
  ),

  port: Number(process.env.PORT ?? 6000),

  clientOrigins: parseOrigins(
    process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  ),

  jwtSecret: required(
    'JWT_SECRET',
    'dev-secret-ozgartiring'
  ),

  adminLogin: process.env.ADMIN_LOGIN ?? 'admin',

  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
};