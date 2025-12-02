
export interface FileWithPreview {
  file: File;
  preview: string;
  base64: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface TextStyle {
  font: string;
  color: string;
  effect: string;
}

export interface ImageFilter {
  brightness: number; // 100 is default
  contrast: number;   // 100 is default
  saturation: number; // 100 is default
}

export type QualityLevel = 'standard' | 'high' | 'ultra';

export interface ThumbnailRequest {
  inspirationImage: string; // Base64
  userImage: string; // Base64
  prompt: string;
  textReplacement?: string; // Optional text to replace original text with
  textStyle?: TextStyle;
  aspectRatio: string;
  quality: QualityLevel;
}

// --- NEW ANALYSIS TYPES ---
export interface AnalysisResult {
  score: number; // 0-100
  critique: string;
  strengths: string[];
  improvements: string[];
}

export interface YoutubeMetadataResult {
  titles: string[];
  description: string;
  tags: string[];
  keywords: string[];
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  inspirationImage?: string; // Base64 of the source inspiration
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  videoUrl?: string;
  quality?: QualityLevel;
  analysis?: AnalysisResult; // Store analysis if performed
  metadata?: YoutubeMetadataResult; // Store metadata if generated
  filters?: ImageFilter; // Store applied filters
}

export interface SavedTemplate {
  id: string;
  name: string;
  prompt: string;
}

// --- NEW TYPES FOR TOKEN SYSTEM ---

export type PlanType = 'free' | 'creator' | 'agency';

export interface UserProfile {
  credits: number;
  plan: PlanType;
  totalGenerations: number;
}

export const CREDIT_COSTS = {
  THUMBNAIL_STANDARD: 10,
  THUMBNAIL_HIGH: 15,
  THUMBNAIL_ULTRA: 25,
  VIDEO: 50,
  AUDIT: 5,
  METADATA: 5 // New Cost for Title/Desc Gen
};

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
    color: 'slate'
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '$19/mo',
    credits: 1000,
    features: ['~100 Thumbnails', 'Prioritized Generation', 'Commercial License', 'Video Beta Access'],
    color: 'indigo'
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$49/mo',
    credits: 5000,
    features: ['~500 Thumbnails', 'Highest Speed', 'Dedicated Support', 'Bulk Export'],
    color: 'purple'
  }
];
