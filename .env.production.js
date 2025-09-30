# Server
PORT=3000
CLIENT_URL=https://yourdomain.com

# JWT Auth
JWT_SECRET=your-very-strong-production-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email com SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=hello@ecocosmetics.com
EMAIL_REPLY_TO=support@ecocosmetics.com

# DKIM e domínio (se necessário para SPF/DKIM/DMARC)
DOMAIN=yourdomain.com
DKIM_PRIVATE_KEY=your-private-key
DKIM_SELECTOR=default
