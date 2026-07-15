/**
 * CK Studio full-stack server.
 * Render preview configuration: serves the Vite build and exposes API routes.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const distPath = path.resolve(process.cwd(), 'dist');

// Stripe requires the exact raw request body for signature verification.
// This route must be registered before express.json().
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!signature || !webhookSecret || !stripeSecretKey) {
    return res.status(503).json({ error: 'Stripe webhook is not configured.' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeSecretKey);
    const event = stripe.webhooks.constructEvent(req.body, signature as string, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;
      console.log(`[Stripe Webhook] Verified checkout completion for payment: ${paymentId ?? 'unknown'}`);
      // Production TODO: validate the amount/currency and update Supabase server-side.
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Error]', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured:
      process.env.VITE_ENABLE_SUPABASE === 'true' && Boolean(process.env.VITE_SUPABASE_URL),
    stripeCheckoutEnabled:
      process.env.ENABLE_STRIPE_CHECKOUT === 'true' && Boolean(process.env.STRIPE_SECRET_KEY),
    time: new Date().toISOString(),
  });
});

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  // Disabled by default because the current client sends the amount directly.
  // Enable only after the server reads and validates payment details from Supabase.
  if (process.env.ENABLE_STRIPE_CHECKOUT !== 'true') {
    return res.status(503).json({
      error: 'Stripe checkout is disabled in this preview deployment.',
      code: 'STRIPE_CHECKOUT_DISABLED',
    });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const { paymentId, amount, description, successUrl, cancelUrl } = req.body ?? {};
  const numericAmount = Number(amount);

  if (!stripeSecretKey) {
    return res.status(503).json({ error: 'Stripe is not configured.' });
  }

  if (!paymentId || !Number.isFinite(numericAmount) || numericAmount <= 0 || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'Invalid checkout request.' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'twd',
            product_data: { name: description || 'CK Studio contract payment' },
            unit_amount: Math.round(numericAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
      cancel_url: cancelUrl,
      metadata: { paymentId },
    });

    return res.json({ id: session.id, url: session.url, isMock: false });
  } catch (error: any) {
    console.error('[Stripe Error]', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/stripe/create-payment-link', (_req, res) => {
  res.status(501).json({ error: 'Payment-link creation is not implemented.' });
});

app.get('/api/payments/:id/status', (req, res) => {
  res.status(501).json({
    paymentId: req.params.id,
    status: 'verification_not_implemented',
    error: 'Payment status must be verified from Stripe or Supabase server-side.',
  });
});

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(distPath, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CK Studio] Listening on http://0.0.0.0:${PORT}`);
});
