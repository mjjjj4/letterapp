# Stripe and Resend Setup Guide

## Stripe Setup

### 1. Create a Stripe Account
- Go to https://stripe.com
- Sign up for a free account
- Verify your email

### 2. Get Your API Keys
- Go to **Developers** → **API Keys**
- You'll see two keys:
  - `Publishable Key` (starts with `pk_`)
  - `Secret Key` (starts with `sk_`)
- Add these to your `.env.local`:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
  STRIPE_SECRET_KEY=sk_...
  ```

### 3. Create a Product (Optional - for reference)
The app creates Stripe sessions dynamically, but you can create a product in Stripe Dashboard:
- Go to **Products** → **Add Product**
- Name: "Capsule Sealing"
- Price: $19.00
- This is optional since the code uses dynamic pricing

### 4. Set Up Webhook
Webhooks allow Stripe to notify your app when payments succeed.

#### Local Testing (Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook signing secret (starts with `whsec_`)
4. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Production (Vercel)

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `https://your-vercel-app.vercel.app/api/webhooks/stripe`
4. Events to send: `checkout.session.completed`
5. Copy the signing secret
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Resend Setup

### 1. Create a Resend Account
- Go to https://resend.com
- Sign up for free
- Verify your email

### 2. Get Your API Key
- Go to **API Keys**
- Create a new API key
- Add to `.env.local`:
  ```
  RESEND_API_KEY=re_...
  ```

### 3. Configure Sender Email
- By default, Resend uses `onboarding@resend.dev`
- To use a custom domain, verify it in Resend dashboard
- The app currently sends from `noreply@theletter.app`
- You can change this in `/pages/api/webhooks/stripe.js`

---

## Environment Variables

Create a `.env.local` file in your project root:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Resend
RESEND_API_KEY=re_...

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For Vercel production:
```
NEXT_PUBLIC_BASE_URL=https://your-vercel-app.vercel.app
```

---

## Testing the Payment Flow

### Local Testing
1. Run `npm run dev`
2. Create a capsule and click "Seal & Pay"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future date for expiration
5. Use any CVC (e.g., 123)
6. Check your browser console for logs

### With Webhook Testing
1. Run Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Complete payment
3. Check Supabase to verify capsule status changed to "sealed"
4. Check Resend logs for confirmation email

---

## Payment Flow

1. User clicks "Seal & Pay" on capsule details
2. Redirected to `/capsule/[id]/seal` page
3. User reviews capsule and clicks "Proceed to Payment"
4. API call to `/api/checkout-session` creates Stripe session
5. User redirected to Stripe Checkout
6. Payment processed
7. Redirect to `/capsule/[id]/success`
8. Stripe webhook fires `checkout.session.completed`
9. Capsule status updated to "sealed" in Supabase
10. Confirmation email sent via Resend

---

## Troubleshooting

### Webhook not triggering?
- Check Stripe webhook logs in Dashboard
- Verify webhook signing secret is correct
- Ensure endpoint URL is correct for Vercel

### Email not sending?
- Check Resend API key is correct
- Verify email format in logs
- Check Resend dashboard for failed emails

### Stripe test cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`
- Docs: https://stripe.com/docs/testing

---

## Next Steps

1. Set up Stripe account and get API keys
2. Set up Resend account and get API key
3. Update `.env.local` with all credentials
4. Test payment flow locally with Stripe CLI
5. Deploy to Vercel
6. Update Vercel environment variables
7. Configure Stripe webhook for production URL
