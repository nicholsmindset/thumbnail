// Import types from constants for internal use
import type {
  PlanType as PlanTypeImport,
  QualityLevel as QualityLevelImport,
} from './constants';

// Re-export constants for backwards compatibility
export {
  CREDIT_COSTS,
  PLANS,
  type PlanType,
  type PlanDetails,
  type QualityLevel,
  type SubscriptionStatus,
  type SubscriptionDetails,
  type BillingHistoryItem,
  SUBSCRIPTION_STATUS,
  DEFAULT_SUBSCRIPTION,
} from './constants';

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
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface ThumbnailRequest {
  inspirationImage: string; // Base64
  userImage: string; // Base64
  prompt: string;
  textReplacement?: string;
  textStyle?: TextStyle;
  aspectRatio: string;
  quality: QualityLevelImport;
}

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
  inspirationImage?: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  videoUrl?: string;
  quality?: QualityLevelImport;
  analysis?: AnalysisResult;
  metadata?: YoutubeMetadataResult;
  filters?: ImageFilter;
}

export interface SavedTemplate {
  id: string;
  name: string;
  prompt: string;
}

export interface UserProfile {
  credits: number;
  plan: PlanTypeImport;
  totalGenerations: number;
}
