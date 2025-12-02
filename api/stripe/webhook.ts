import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const STRIPE_PRODUCTS = {
  creator: { productId: process.env.STRIPE_CREATOR_PRODUCT_ID || 'prod_TWpQPE2VqDDpS4', credits: 1000 },
  agency: { productId: process.env.STRIPE_AGENCY_PRODUCT_ID || 'prod_TWpTYfXYByGs6q', credits: 5000 },
};

// Disable body parsing for webhook signature verification
export const config = { api: { bodyParser: false } };

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(buf.toString()) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const planId = session.metadata?.planId as 'creator' | 'agency';

      if (supabase && session.customer_email) {
        const { data: user } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.customer_email)
          .single();

        if (user) {
          const credits = STRIPE_PRODUCTS[planId]?.credits || 0;
          await supabase
            .from('profiles')
            .update({
              plan: planId,
              credits: user.credits + credits,
              stripe_customer_id: customerId,
            })
            .eq('id', user.id);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      if (supabase) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId);
      }
      break;
    }
  }

  res.json({ received: true });
}
