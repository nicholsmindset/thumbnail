/**
 * Stripe Service for handling subscription payments
 * Communicates with the backend Stripe endpoints
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = STRIPE_CONFIG.PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface SubscriptionStatus {
  status: string;
  planId?: string;
  credits?: number;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

interface PortalSessionResponse {
  url: string;
}

/**
 * Create a Stripe checkout session for a subscription plan
 */
export async function createCheckoutSession(
  planId: 'creator' | 'agency',
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planId,
      successUrl: successUrl || `${window.location.origin}?success=true&plan=${planId}`,
      cancelUrl: cancelUrl || `${window.location.origin}?canceled=true`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(planId: 'creator' | 'agency'): Promise<void> {
  try {
    const { url } = await createCheckoutSession(planId);

    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}

/**
 * Get subscription status by session ID (after successful checkout)
 */
export async function getSubscriptionStatusBySession(
  sessionId: string
): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_BASE_URL}/stripe/subscription-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get subscription status');
  }

  return response.json();
}

/**
 * Get subscription status by customer email
 */
export async function getSubscriptionStatusByEmail(
  customerEmail: string
): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_BASE_URL}/stripe/subscription-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get subscription status');
  }

  return response.json();
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSession(
  customerEmail: string,
  returnUrl?: string
): Promise<PortalSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/stripe/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerEmail,
      returnUrl: returnUrl || window.location.origin,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToCustomerPortal(customerEmail: string): Promise<void> {
  try {
    const { url } = await createPortalSession(customerEmail);

    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No portal URL returned');
    }
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
}

/**
 * Handle successful checkout - check URL params and update user profile
 */
export function handleCheckoutSuccess(): { success: boolean; planId?: string } {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success') === 'true';
  const planId = urlParams.get('plan') as 'creator' | 'agency' | null;

  if (success && planId) {
    // Clean up URL parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    return { success: true, planId };
  }

  return { success: false };
}

/**
 * Check if checkout was canceled
 */
export function handleCheckoutCanceled(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const canceled = urlParams.get('canceled') === 'true';

  if (canceled) {
    // Clean up URL parameters
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }

  return canceled;
}
