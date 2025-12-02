// Import types for use in this file
import type {
  PlanType as PlanTypeImport,
  QualityLevel as QualityLevelImport,
  ThumbnailStyle as ThumbnailStyleImport,
} from './constants';

// Re-export constants for backwards compatibility
export {
  CREDIT_COSTS,
  PLANS,
  type PlanType,
  type PlanDetails,
  type QualityLevel,
  type ThumbnailStyle,
  type ThumbnailStyleConfig,
} from './constants';

// Local type aliases for use within this file
type QualityLevel = QualityLevelImport;
type ThumbnailStyle = ThumbnailStyleImport;
type PlanType = PlanTypeImport;

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

// Generation modes
export type GenerationMode = 'clone' | 'prompt';

// Original style-cloning request (requires inspiration image)
export interface ThumbnailRequest {
  inspirationImage: string; // Base64
  userImage: string; // Base64
  prompt: string;
  textReplacement?: string;
  textStyle?: TextStyle;
  aspectRatio: string;
  quality: QualityLevel;
}

// New prompt-based generation request (no inspiration needed)
export interface PromptThumbnailRequest {
  userImage: string; // Base64 - the person's face
  prompt: string; // Detailed description of the thumbnail
  thumbnailText?: string; // Optional text to overlay on thumbnail
  textStyle?: TextStyle;
  aspectRatio: string;
  quality: QualityLevel;
  style?: ThumbnailStyle; // Pre-defined style options
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
  quality?: QualityLevel;
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
  plan: PlanType;
  totalGenerations: number;
}
