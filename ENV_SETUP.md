# Environment Variables Setup Guide

This guide helps you configure all environment variables for the Pamarel Food Club application.

## Quick Start

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in each variable** with your actual credentials

3. **Never commit** `.env.local` to version control (it's already in `.gitignore`)

---

## Variable Categories & Setup Instructions

### 1. **DATABASE** 
- **Variable:** `MONGODB_URI`
- **What it is:** MongoDB connection string
- **How to get:**
  - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - Create a cluster
  - Click "Connect" and copy the connection string
  - Add database name: `pamarelFoodClub`
  - Replace `<username>` and `<password>` with your credentials
- **Example:** `mongodb+srv://user:pass@cluster0.abc123.mongodb.net/pamarelFoodClub?retryWrites=true&w=majority`
- **Local dev:** `mongodb://localhost:27017/pamarelFoodClub`

---

### 2. **AUTHENTICATION & SECURITY**
#### NEXTAUTH_SECRET
- **Purpose:** JWT signing secret for NextAuth sessions
- **How to generate:**
  ```bash
  openssl rand -base64 32
  ```
- **⚠️ Important:** Use different secrets for dev, staging, and production

#### NEXTAUTH_URL
- **Purpose:** Base URL of your application
- **Local development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

#### CRON_SECRET
- **Purpose:** Security key for scheduled jobs (`/api/cron/process-rewards`)
- **Note:** Validation is currently commented out, but should be enabled in production
- **Generate:** Any secure random string (can use `openssl rand -base64 32`)

---

### 3. **EMAIL SERVICE (Gmail)**
#### EMAIL_USER
- **Purpose:** Gmail account for sending transactional emails
- **What to use:** Your Gmail address (e.g., `noreply@yourapp.com`)

#### EMAIL_PASS
- **Purpose:** App-specific password for Gmail SMTP
- **⚠️ Important:** NOT your regular Gmail password
- **How to get:**
  1. Enable 2-Factor Authentication on your Google Account
  2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
  3. Select "Mail" and "Windows Computer"
  4. Copy the 16-character password generated
  5. Remove spaces and paste it here

---

### 4. **EMAILJS (Client-side Email)**
These are **public variables** (prefixed with `NEXT_PUBLIC_`) - safe for frontend.

#### Setup Steps:
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create a service (e.g., Gmail)
3. Create templates for:
   - Password reset emails
   - Contact form submissions
   - Stockist application notifications
4. Copy from EmailJS dashboard:
   - `Service ID` → `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `Template ID` (password reset) → `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `Template ID` (forms) → `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID2`
   - `Public Key` → `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

---

### 5. **CLOUDINARY (Image Uploads)**
Used for product images, user avatars, and file uploads.

#### Setup Steps:
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy:
   - **Cloud Name** → `CLOUD_NAME`
   - **API Key** → `CLOUD_PUB`
   - **API Secret** → `CLOUD_SECRET`

#### Usage in app:
- Image uploads in components
- User profile pictures
- Product images

---

### 6. **FLUTTERWAVE (Payment Processing)**
Primary payment provider for the app.

#### FLUTTERWAVE_SECRET_KEY
- **Purpose:** Main API key for payments, verification, and transactions
- **How to get:**
  1. Create account at [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
  2. Go to Settings → API Keys
  3. Copy your **Secret Key** (not public key)
- **Used for:**
  - Payment initialization
  - Transaction verification
  - Withdrawal processing
  - Bank lookup
  - Balance checks

#### FLUTTERWAVE_WITHDRAWAL_API_KEY
- **Purpose:** Specific API key for withdrawal operations
- **How to get:** Same as above, may be a separate key for withdrawals
- **Used for:** Processing cash withdrawals from user wallets

---

### 7. **APP CONFIGURATION**
#### NEXT_PUBLIC_APP_URL
- **Purpose:** Public URL used in password reset links and redirects
- **Local:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

---

## Important Security Notes

### 🔐 Do's
✅ Use strong, random strings for secrets (minimum 32 characters)
✅ Store sensitive values in `.env.local` (never in `.env.example`)
✅ Use app-specific passwords for Gmail (not your main password)
✅ Rotate secrets regularly in production
✅ Use different credentials for dev/staging/production

### 🚫 Don'ts
❌ Commit `.env.local` to git
❌ Share credentials in chat, email, or documentation
❌ Use the same secret across environments
❌ Use real customer payment keys in development (if possible, use test keys)
❌ Expose `CLOUD_SECRET` in frontend code

---

## Validation Checklist

Before deployment, verify:

- [ ] All required variables are set
- [ ] MongoDB connection works: `mongosh "your-connection-string"`
- [ ] Email credentials work (test with a test email)
- [ ] Cloudinary credentials are valid
- [ ] Flutterwave API keys are set and working
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] `.env.local` is in `.gitignore`
- [ ] All `NEXT_PUBLIC_*` variables don't contain secrets

---

## Troubleshooting

### "Cannot read property 'SECRET_KEY' of undefined"
→ Check that `FLUTTERWAVE_SECRET_KEY` is set in `.env.local`

### Email not sending
→ Verify `EMAIL_USER` and `EMAIL_PASS` are correct
→ Check that 2-FA and App Password are enabled in Gmail

### Image upload fails
→ Verify Cloudinary credentials in `.env.local`
→ Check CORS settings in Cloudinary dashboard

### NextAuth errors
→ Regenerate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
→ Ensure `NEXTAUTH_URL` matches your current domain

---

## Next Steps

1. Fill in `.env.local` with your credentials
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Test each feature that uses the environment variables
5. For production, set variables in your hosting platform's environment settings (Vercel, Heroku, etc.)

---

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Flutterwave API Reference](https://developer.flutterwave.com/reference)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api)
