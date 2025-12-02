import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not configured - Stripe features will be disabled');
}
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Stripe product configuration
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

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Special handling for Stripe webhooks - needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);

// Validate API key is configured
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Error handler middleware
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
};

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detect text in image
app.post('/api/detect-text', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageData = cleanBase64(image);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze this image and extract all visible text strings.
                   Return ONLY a JSON array of strings.
                   Example: ["HOW TO", "GROW", "FAST"].
                   If no text is found, return [].`
          },
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "[]";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    next(error);
  }
});

// Enhance prompt
app.post('/api/enhance-prompt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Prompt Engineer for AI Image Generators.
      Rewrite the following simple user request into a highly detailed, descriptive prompt suitable for a high-end photorealistic model.

      User Request: "${prompt}"

      Instructions:
      - Add details about lighting (e.g., cinematic, rim lighting, softbox).
      - Add details about camera (e.g., 85mm lens, f/1.8, 4k).
      - Add details about expression and mood.
      - Keep it under 40 words.
      - Output ONLY the rewritten prompt string. No quotes.`,
    });

    res.json({ enhancedPrompt: response.text?.trim() || prompt });
  } catch (error) {
    next(error);
  }
});

// Analyze thumbnail
app.post('/api/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageData = cleanBase64(image);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are a YouTube Analytics expert and Graphic Design Auditor.
            Analyze the attached thumbnail image for "Click-Through Rate" (CTR) potential.

            Evaluate based on:
            1. Facial Expression & Emotion (Is it intense? Eye contact?)
            2. Text Readability (Contrast, size, font weight)
            3. Composition (Rule of thirds, clutter, focal point)
            4. Color Theory (Saturation, complementary colors)
            5. Curiosity Gap (Does it make you want to click?)

            Return a JSON object with this exact structure:
            {
              "score": number, // 0 to 100 integer
              "critique": "string", // A 1-sentence summary of the vibe
              "strengths": ["string", "string"], // Top 3 things done well
              "improvements": ["string", "string"] // Top 3 specific actionable fixes
            }`
          },
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    next(error);
  }
});

// Generate YouTube metadata
app.post('/api/metadata', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, context } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageData = cleanBase64(image);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are a world-class YouTube Strategist.

            TASK:
            Based on the attached thumbnail visual and the context: "${context || 'No context provided'}", generate high-CTR metadata.

            GUIDELINES:
            1. **Titles**: Provide 5 options using different viral psychological hooks.
            2. **Description**: First 2 lines must be compelling hooks.
            3. **Tags/Keywords**: Mix broad and specific tags.

            Return JSON:
            {
              "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
              "description": "Full video description...",
              "tags": ["tag1", "tag2", ...],
              "keywords": ["keyword1", "keyword2", ...]
            }`
          },
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.data,
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    next(error);
  }
});

// Generate thumbnail
app.post('/api/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inspirationImage, userImage, prompt, textReplacement, textStyle, aspectRatio, quality } = req.body;

    if (!inspirationImage || !userImage) {
      return res.status(400).json({ error: 'Both inspiration and user images are required' });
    }

    const inspiration = cleanBase64(inspirationImage);
    const user = cleanBase64(userImage);

    let textStyleInstruction = "";
    if (textReplacement && textStyle) {
      textStyleInstruction = `
         - Font Style: ${textStyle.font}
         - Text Color: ${textStyle.color}
         - Text Effect: ${textStyle.effect}`;
    }

    const textInstruction = textReplacement
      ? `CRITICAL - TEXT REPLACEMENT:
         - You MUST detect any text present in "Image 1" (Inspiration).
         - You MUST REPLACE that text with the new text: "${textReplacement}".
         ${textStyleInstruction}
         - Maintain the perspective and placement of the original text.`
      : `CRITICAL - TEXT PRESERVATION:
         - You MUST PRESERVE the text from "Image 1" exactly as it appears.`;

    const promptText = `
      ROLE: Expert Digital Artist & YouTuber specializing in photorealistic face swaps.

      TASK:
      Create a high-CTR YouTube thumbnail by performing a "Face Swap" and "Style Transfer".

      INPUTS:
      - IMAGE 1 (Style/Layout Reference): Defines composition, background, text, lighting, pose.
      - IMAGE 2 (Identity Reference): Defines the person's face/identity.

      CRITICAL INSTRUCTION - IDENTITY PRESERVATION:
      - The face in the final image MUST be the person from IMAGE 2.
      - DO NOT create a new face. DO NOT blend features.

      ${textInstruction}

      OUTPUT QUALITY:
      - Photorealistic, 8K, highly detailed.
      - Context: ${prompt || "Match the style and energy of the original thumbnail."}
    `;

    const imageSizeMap: Record<string, string> = {
      'standard': '1K',
      'high': '2K',
      'ultra': '4K'
    };

    const imageSize = imageSizeMap[quality || 'standard'];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: inspiration.mimeType,
              data: inspiration.data,
            },
          },
          {
            inlineData: {
              mimeType: user.mimeType,
              data: user.data,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "16:9",
          imageSize: imageSize,
        },
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return res.json({
            imageUrl: `data:image/png;base64,${part.inlineData.data}`
          });
        }
      }
    }

    res.status(500).json({ error: 'No image generated' });
  } catch (error) {
    next(error);
  }
});

// Generate video from thumbnail
app.post('/api/generate-video', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, prompt, aspectRatio } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageData = cleanBase64(image);

    let videoAspectRatio = '16:9';
    if (aspectRatio === '9:16') {
      videoAspectRatio = '9:16';
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic movement, high quality, 4k",
      image: {
        imageBytes: imageData.data,
        mimeType: imageData.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: videoAspectRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      return res.status(500).json({ error: 'Video generation failed: No URI returned' });
    }

    // Fetch the video and return as base64
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');

    res.json({
      videoUrl: `data:video/mp4;base64,${videoBase64}`
    });
  } catch (error) {
    next(error);
  }
});

// Helper function
function cleanBase64(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  return {
    mimeType: 'image/jpeg',
    data: dataUrl
  };
}

// ============================================
// STRIPE ENDPOINTS
// ============================================

// Create checkout session
app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { planId, successUrl, cancelUrl } = req.body;

    if (!planId || !['creator', 'agency'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID. Must be "creator" or "agency"' });
    }

    const productConfig = STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS];

    // Get the product from Stripe to find its default price
    const product = await stripe.products.retrieve(productConfig.productId);

    if (!product.default_price) {
      return res.status(400).json({ error: 'Product does not have a default price configured in Stripe' });
    }

    const priceId = typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price.id;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}?success=true&plan=${planId}`,
      cancel_url: cancelUrl || `${process.env.CORS_ORIGIN || 'http://localhost:3000'}?canceled=true`,
      metadata: {
        planId,
        credits: productConfig.credits.toString(),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription status by customer email or session ID
app.post('/api/stripe/subscription-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { sessionId, customerEmail } = req.body;

    if (sessionId) {
      // Get session and subscription details
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer'],
      });

      if (!session.subscription) {
        return res.json({ status: 'no_subscription' });
      }

      const subscription = session.subscription as Stripe.Subscription;

      return res.json({
        status: subscription.status,
        planId: session.metadata?.planId,
        credits: parseInt(session.metadata?.credits || '0'),
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }

    if (customerEmail) {
      // Find customer by email
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

      if (customers.data.length === 0) {
        return res.json({ status: 'no_customer' });
      }

      const customer = customers.data[0];

      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return res.json({ status: 'no_subscription' });
      }

      const subscription = subscriptions.data[0];

      // Determine plan from product
      let planId = 'free';
      let credits = 0;

      const productId = subscription.items.data[0]?.price?.product;
      if (productId === STRIPE_PRODUCTS.creator.productId) {
        planId = 'creator';
        credits = STRIPE_PRODUCTS.creator.credits;
      } else if (productId === STRIPE_PRODUCTS.agency.productId) {
        planId = 'agency';
        credits = STRIPE_PRODUCTS.agency.credits;
      }

      return res.json({
        status: subscription.status,
        planId,
        credits,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }

    res.status(400).json({ error: 'Either sessionId or customerEmail is required' });
  } catch (error) {
    next(error);
  }
});

// Create customer portal session (for managing subscription)
app.post('/api/stripe/create-portal-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { customerEmail, returnUrl } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No customer found with this email' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: returnUrl || process.env.CORS_ORIGIN || 'http://localhost:3000',
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook handler
app.post('/api/stripe/webhook', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(req.body.toString()) as Stripe.Event;
      console.warn('Webhook signature verification skipped - STRIPE_WEBHOOK_SECRET not set');
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', {
        sessionId: session.id,
        customerId: session.customer,
        planId: session.metadata?.planId,
        credits: session.metadata?.credits,
      });
      // In a production app, you would:
      // 1. Find/create the user in your database
      // 2. Update their plan and credits
      // 3. Send a confirmation email
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      // Handle plan changes, renewals, etc.
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription canceled:', {
        subscriptionId: subscription.id,
      });
      // Downgrade user to free plan
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment succeeded:', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountPaid: invoice.amount_paid,
      });
      // Credit monthly renewal
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed:', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
      });
      // Notify user, possibly downgrade after grace period
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Apply error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
