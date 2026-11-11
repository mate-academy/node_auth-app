import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3005,
  clientHost: process.env.CLIENT_HOST ?? 'http://localhost:4200',
  databaseUrl: process.env.DATABASE_URL ?? '',
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  },
};
