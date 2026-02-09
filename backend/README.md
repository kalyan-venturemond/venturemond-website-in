# Backend Deployment Instructions

This backend handles the contact form submission and email sending.
It supports **Zoho Mail (SMTP)** and **Resend API** (as a fallback or primary via HTTPS).

## Environment Variables Required
The following environment variables must be set on the production server (e.g., EC2, Railway, DigitalOcean):

```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database Connection
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Email Configuration (Zoho SMTP Recommended)
SMTP_HOST=smtp.zoho.in        # Use .com if .in fails
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hello@venturemond.com
SMTP_PASS=qFkJPckCfYSO          # Real Password Provided Securely

# (Optional) Resend API Configuration
# If SMTP is blocked (e.g., Free Tier cloud hosting), set this variable to force usage of Resend API:
# RESEND_API_KEY=re_123456789...
```

## Deployment Steps
1. Clone the repository.
2. Navigate to `backend/`.
3. Run `npm install --omit=dev`.
4. Create a `.env` file with the variables above.
5. Start the server: `node server.js` (or use PM2: `pm2 start server.js`).
