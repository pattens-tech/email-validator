# Stripe Configuration Guide

## Overview
This document describes the Stripe configuration for the Email Validator application.

## Configuration Summary

### ✅ Stripe Keys Configured

**Backend API (Server-side)**
- **Location**: `api/create-checkout-session.js`
- **Configuration**: Uses environment variable `STRIPE_SECRET_KEY`
- **Key Format**: `sk_test_XXXXXXXXXX...` (stored in Vercel environment variables)

**Frontend (Client-side)**
- **Location**: `index.html` (line 759)
- **Configuration**: Publishable key (safe for client-side)
- **Key Format**: `pk_test_XXXXXXXXXX...` (can be publicly visible)

## Environment Variables

### Vercel Deployment

The application uses the following environment variable in Vercel:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**Note**: The actual secret key is stored securely in Vercel and should never be committed to source control.

### Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key from the Stripe Dashboard
   - **Environment**: Production, Preview, Development (all)
4. Click **Save**
5. Redeploy your application for changes to take effect

## API Endpoint Details

### `/api/create-checkout-session`

**Purpose**: Creates a Stripe Checkout session for purchasing email validation reports

**Method**: POST

**Request Body**:
```json
{
  "emails": [
    { "email": "test@example.com", "status": "Valid" },
    { "email": "invalid@test.com", "status": "Invalid" }
  ]
}
```

**Response** (Success - 200):
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Response** (Error - 400):
```json
{
  "error": "Invalid email data"
}
```

**Response** (Error - 500):
```json
{
  "error": "Failed to create checkout session"
}
```

## Stripe Product Configuration

- **Product Name**: Email Validation Report
- **Price**: £9.99 (999 pence)
- **Currency**: GBP (British Pounds)
- **Payment Methods**: Card
- **Mode**: Payment (one-time)

## Security Features

### Headers
All API responses include:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Input Validation
- Validates email data structure
- Sanitizes email objects
- Filters out invalid entries
- Requires non-empty arrays

### Supported Methods
- `POST`: Create checkout session
- `OPTIONS`: CORS preflight

## Testing

All Stripe integration tests are passing (13/13):

```bash
npm test -- __tests__/api/create-checkout-session.test.js
```

**Test Coverage**:
- HTTP method validation (OPTIONS, GET, POST)
- Request validation
- Email data sanitization
- Security headers
- Stripe API integration
- Error handling

## Local Development

For local development:

1. Create a `.env.local` file in the project root (not committed to git)
2. Add your Stripe secret key:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   ```
3. Run with `vercel dev` to test locally

```bash
npm install
vercel dev
```

**Note**: The `.env.local` file is gitignored and should never be committed to source control.

## Production Checklist

- [x] Stripe publishable key configured in `index.html`
- [x] Stripe secret key environment variable set in Vercel
- [x] API endpoint implemented and tested
- [x] Security headers configured
- [x] Error handling implemented
- [x] CORS configured for cross-origin requests
- [x] All tests passing

## Key Validation

To verify your Stripe configuration:
1. Both keys should share the same account ID prefix
2. Publishable key should start with `pk_test_` (test mode) or `pk_live_` (production)
3. Secret key should start with `sk_test_` (test mode) or `sk_live_` (production)
4. Both keys must be from the same Stripe account

## Switching to Production

When ready for production:

1. Obtain production keys from Stripe dashboard:
   - Production publishable key (starts with `pk_live_`)
   - Production secret key (starts with `sk_live_`)

2. Update frontend (`index.html`):
   ```javascript
   const stripe = Stripe('pk_live_YOUR_PRODUCTION_KEY');
   ```

3. Update Vercel environment variable:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY
   ```

4. Redeploy application

## Support

For Stripe-related issues:
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Documentation: https://stripe.com/docs
- Test Mode: Currently using test keys (no real charges)
