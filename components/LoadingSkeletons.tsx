import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] rounded ${className}`}
    style={{
      animation: 'shimmer 1.5s infinite',
    }}
  />
);

/**
 * Skeleton for thumbnail cards in the history grid
 */
export const ThumbnailSkeleton: React.FC = () => (
  <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
    <Skeleton className="w-full h-full" />
  </div>
);

/**
 * Skeleton for the main image preview
 */
export const ImagePreviewSkeleton: React.FC = () => (
  <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
    <div className="aspect-video w-full">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * Skeleton for the history gallery
 */
export const HistoryGallerySkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ThumbnailSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for upload area
 */
export const UploadSkeleton: React.FC = () => (
  <div className="h-64 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 p-6">
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
);

/**
 * Skeleton for analysis panel
 */
export const AnalysisSkeleton: React.FC = () => (
  <div className="p-5 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Skeleton className="h-16 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

/**
 * Skeleton for metadata panel
 */
export const MetadataSkeleton: React.FC = () => (
  <div className="p-5 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-16 rounded-full" />
      ))}
    </div>
  </div>
);

/**
 * Full page loading skeleton
 */
export const PageLoadingSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-10 w-40" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>

    {/* Upload area skeletons */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <UploadSkeleton />
      <UploadSkeleton />
    </div>

    {/* Config skeleton */}
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-8">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>

    {/* Results skeleton */}
    <ImagePreviewSkeleton />
    <HistoryGallerySkeleton />
  </div>
);

/**
 * Inline loading spinner
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg className="w-full h-full text-indigo-500" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Add shimmer keyframes to global styles
const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-shimmer-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
  }
}

export default {
  Skeleton,
  ThumbnailSkeleton,
  ImagePreviewSkeleton,
  HistoryGallerySkeleton,
  UploadSkeleton,
  AnalysisSkeleton,
  MetadataSkeleton,
  PageLoadingSkeleton,
  LoadingSpinner,
};
