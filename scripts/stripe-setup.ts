/**
 * Stripe Setup Script
 * Run with: npx tsx scripts/stripe-setup.ts
 *
 * This script verifies your Stripe products and prices are configured correctly.
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required.');
  console.error('   Set it in your .env file or run: STRIPE_SECRET_KEY=sk_... npx tsx scripts/stripe-setup.ts');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PRODUCTS = {
  creator: 'prod_TWpQPE2VqDDpS4',
  agency: 'prod_TWpTYfXYByGs6q',
};

async function main() {
  console.log('🔍 Verifying Stripe Configuration...\n');

  try {
    // Verify each product
    for (const [planName, productId] of Object.entries(PRODUCTS)) {
      console.log(`📦 Checking ${planName.toUpperCase()} Plan (${productId})...`);

      const product = await stripe.products.retrieve(productId);
      console.log(`   ✅ Product: ${product.name}`);
      console.log(`   📝 Description: ${product.description || 'No description'}`);
      console.log(`   🏷️  Active: ${product.active ? 'Yes' : 'No'}`);

      if (product.default_price) {
        const priceId = typeof product.default_price === 'string'
          ? product.default_price
          : product.default_price.id;

        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        const interval = price.recurring?.interval || 'one-time';

        console.log(`   💰 Default Price: $${amount}/${interval}`);
        console.log(`   🔑 Price ID: ${priceId}`);
      } else {
        console.log(`   ⚠️  No default price set! You need to create a price for this product.`);
      }
      console.log('');
    }

    // List all prices for these products
    console.log('📋 All Prices for Your Products:\n');

    const prices = await stripe.prices.list({
      limit: 20,
      active: true,
    });

    const relevantPrices = prices.data.filter(
      price => Object.values(PRODUCTS).includes(price.product as string)
    );

    if (relevantPrices.length === 0) {
      console.log('⚠️  No prices found for your products!');
      console.log('   You need to create prices in the Stripe Dashboard.\n');
    } else {
      for (const price of relevantPrices) {
        const productName = Object.entries(PRODUCTS).find(
          ([, id]) => id === price.product
        )?.[0] || 'Unknown';

        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        const interval = price.recurring?.interval || 'one-time';

        console.log(`   ${productName.toUpperCase()}: $${amount}/${interval} (${price.id})`);
      }
    }

    console.log('\n✅ Stripe configuration check complete!');

  } catch (error: unknown) {
    const stripeError = error as { code?: string; type?: string; message?: string };
    if (stripeError.code === 'resource_missing') {
      console.error(`❌ Product not found: ${stripeError.message}`);
      console.error('   Make sure the product IDs are correct in your Stripe Dashboard.');
    } else if (stripeError.code === 'api_key_expired' || stripeError.type === 'StripeAuthenticationError') {
      console.error('❌ Invalid API key. Please check your STRIPE_SECRET_KEY.');
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error:', errorMessage);
    }
    process.exit(1);
  }
}

main();
