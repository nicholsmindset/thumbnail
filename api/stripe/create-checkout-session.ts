import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const STRIPE_PRODUCTS = {
  creator: {
    productId: process.env.STRIPE_CREATOR_PRODUCT_ID || 'prod_TWpQPE2VqDDpS4',
    credits: 1000,
  },
  agency: {
    productId: process.env.STRIPE_AGENCY_PRODUCT_ID || 'prod_TWpTYfXYByGs6q',
    credits: 5000,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, successUrl, cancelUrl } = req.body;

    if (!planId || !['creator', 'agency'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const productConfig = STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS];

    // Get the product from Stripe to find its default price
    const product = await stripe.products.retrieve(productConfig.productId);

    if (!product.default_price) {
      return res.status(400).json({ error: 'Product does not have a default price' });
    }

    const priceId = typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price.id;

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${baseUrl}?success=true&plan=${planId}`,
      cancel_url: cancelUrl || `${baseUrl}?canceled=true`,
      metadata: {
        planId,
        credits: productConfig.credits.toString(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Checkout error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
