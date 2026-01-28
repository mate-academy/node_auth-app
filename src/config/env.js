import 'dotenv/config';

function getEnv(name, defaultValue) {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

export const env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: Number(getEnv('PORT', 3000)),

  DATABASE_URL: getEnv('DATABASE_URL'),

  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),

  APP_URL: getEnv('APP_URL'),

  SMTP_HOST: getEnv('SMTP_HOST'),
  SMTP_PORT: Number(getEnv('SMTP_PORT', 587)),
  SMTP_USER: getEnv('SMTP_USER'),
  SMTP_PASS: getEnv('SMTP_PASS'),
};
