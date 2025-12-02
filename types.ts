// Re-export constants for backwards compatibility
export {
  CREDIT_COSTS,
  PLANS,
  type PlanType,
  type PlanDetails,
  type QualityLevel,
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
  quality: QualityLevel;
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
