// Credit System
export const CREDIT_COSTS = {
  THUMBNAIL_STANDARD: 10,
  THUMBNAIL_HIGH: 15,
  THUMBNAIL_ULTRA: 25,
  VIDEO: 50,
  AUDIT: 5,
  METADATA: 5,
} as const;

// Plan Configuration
export type PlanType = 'free' | 'creator' | 'agency';

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: string;
  credits: number;
  features: string[];
  color: string;
}

export const PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '$0',
    credits: 10,
    features: ['1 Free Generation', 'Standard Quality', 'Public Access'],
    color: 'slate',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '$19/mo',
    credits: 1000,
    features: [
      '~100 Thumbnails',
      'Prioritized Generation',
      'Commercial License',
      'Video Beta Access',
    ],
    color: 'indigo',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$49/mo',
    credits: 5000,
    features: ['~500 Thumbnails', 'Highest Speed', 'Dedicated Support', 'Bulk Export'],
    color: 'purple',
  },
];

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: '.jpg,.jpeg,.png,.webp',
} as const;

// Image Filter Defaults
export const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
} as const;

export const FILTER_RANGES = {
  brightness: { min: 50, max: 150 },
  contrast: { min: 50, max: 150 },
  saturation: { min: 0, max: 200 },
} as const;

// Timing Constants (in milliseconds)
export const TIMING = {
  TEMPLATE_SAVE_DELAY: 800,
  COPY_NOTIFICATION_DURATION: 2000,
  VIDEO_POLLING_INTERVAL: 5000,
  DEBOUNCE_DELAY: 300,
} as const;

// Aspect Ratios
export const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '9:16'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

// Quality Levels
export const QUALITY_LEVELS = ['standard', 'high', 'ultra'] as const;
export type QualityLevel = (typeof QUALITY_LEVELS)[number];

export const QUALITY_CONFIG: Record<QualityLevel, { cost: number; label: string }> = {
  standard: { cost: CREDIT_COSTS.THUMBNAIL_STANDARD, label: 'Standard' },
  high: { cost: CREDIT_COSTS.THUMBNAIL_HIGH, label: 'High Quality' },
  ultra: { cost: CREDIT_COSTS.THUMBNAIL_ULTRA, label: 'Ultra HD' },
} as const;

// Gemini Model Configuration
export const GEMINI_MODELS = {
  TEXT: 'gemini-2.5-flash',
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview',
} as const;

export const VIDEO_CONFIG = {
  DEFAULT_RESOLUTION: '720p',
  MAX_POLLING_ATTEMPTS: 60, // 5 minutes with 5s polling interval
} as const;

// Score Thresholds
export const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  USER: 'thumbgen_user',
  HISTORY: 'thumbgen_history',
  TEMPLATES: 'thumbgen_templates',
  SUBSCRIPTION: 'thumbgen_subscription',
} as const;

// UI Constants
export const UI = {
  MAX_HISTORY_ITEMS: 50,
  THUMBNAIL_PREVIEW_HEIGHT: '70vh',
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// Subscription Details Interface
export interface SubscriptionDetails {
  status: SubscriptionStatus;
  currentPlan: PlanType;
  startDate: number; // timestamp
  currentPeriodEnd: number; // timestamp
  cancelAtPeriodEnd: boolean;
  billingHistory: BillingHistoryItem[];
}

export interface BillingHistoryItem {
  id: string;
  date: number; // timestamp
  amount: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
}

// Default subscription for new users
export const DEFAULT_SUBSCRIPTION: SubscriptionDetails = {
  status: 'trialing',
  currentPlan: 'free',
  startDate: Date.now(),
  currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  cancelAtPeriodEnd: false,
  billingHistory: [],
};

// API Configuration
export const API_CONFIG = {
  MAX_DESCRIPTION_HOOK_LENGTH: 150,
  MAX_RETRIES: 3,
} as const;

// Text Style Options
export const FONT_OPTIONS = ['Bold Impact', 'Modern Sans', 'Handwritten', 'Retro', 'Minimal'] as const;
export const EFFECT_OPTIONS = ['None', 'Glow', 'Shadow', 'Outline', '3D'] as const;

export type FontOption = (typeof FONT_OPTIONS)[number];
export type EffectOption = (typeof EFFECT_OPTIONS)[number];
