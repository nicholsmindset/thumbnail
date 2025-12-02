import { useState, useCallback, useMemo } from 'react';
import { HistoryItem } from '../types';

export interface UseBatchOperationsReturn {
  // Selection state
  selectedIds: Set<string>;
  isSelectionMode: boolean;
  selectAll: boolean;

  // Selection actions
  toggleSelectionMode: () => void;
  toggleSelect: (id: string) => void;
  selectAllItems: () => void;
  deselectAll: () => void;
  invertSelection: () => void;

  // Batch actions
  batchDelete: () => HistoryItem[];
  batchDownload: () => Promise<void>;
  batchExportAsZip: () => Promise<void>;

  // Computed values
  selectedCount: number;
  hasSelection: boolean;
}

/**
 * Custom hook for managing batch operations on history items
 */
export function useBatchOperations(
  history: HistoryItem[],
  onHistoryChange: (newHistory: HistoryItem[]) => void
): UseBatchOperationsReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  const selectAll = history.length > 0 && selectedCount === history.length;

  /**
   * Toggle selection mode on/off
   */
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Exiting selection mode - clear selections
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  /**
   * Toggle selection of a single item
   */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /**
   * Select all items
   */
  const selectAllItems = useCallback(() => {
    setSelectedIds(new Set(history.map((item) => item.id)));
  }, [history]);

  /**
   * Deselect all items
   */
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Invert selection
   */
  const invertSelection = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      history.forEach((item) => {
        if (!prev.has(item.id)) {
          next.add(item.id);
        }
      });
      return next;
    });
  }, [history]);

  /**
   * Delete selected items and return them (for undo)
   */
  const batchDelete = useCallback((): HistoryItem[] => {
    const deletedItems = history.filter((item) => selectedIds.has(item.id));
    const remainingItems = history.filter((item) => !selectedIds.has(item.id));

    onHistoryChange(remainingItems);
    setSelectedIds(new Set());
    setIsSelectionMode(false);

    return deletedItems;
  }, [history, selectedIds, onHistoryChange]);

  /**
   * Download selected items individually
   */
  const batchDownload = useCallback(async (): Promise<void> => {
    const selectedItems = history.filter((item) => selectedIds.has(item.id));

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const link = document.createElement('a');
      link.href = item.imageUrl;
      link.download = `thumbgen-${item.id}-${i + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Small delay between downloads to avoid browser blocking
      if (i < selectedItems.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }, [history, selectedIds]);

  /**
   * Export selected items as a ZIP file
   */
  const batchExportAsZip = useCallback(async (): Promise<void> => {
    const selectedItems = history.filter((item) => selectedIds.has(item.id));

    // Dynamically import JSZip (should be added as a dependency)
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];

        // Convert data URL to blob
        const response = await fetch(item.imageUrl);
        const blob = await response.blob();

        // Add to zip with meaningful filename
        const timestamp = new Date(item.timestamp).toISOString().split('T')[0];
        zip.file(`thumbnail-${timestamp}-${i + 1}.png`, blob);

        // Also add video if exists
        if (item.videoUrl) {
          const videoResponse = await fetch(item.videoUrl);
          const videoBlob = await videoResponse.blob();
          zip.file(`video-${timestamp}-${i + 1}.mp4`, videoBlob);
        }
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumbgen-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to individual downloads if JSZip not available
      console.warn('JSZip not available, falling back to individual downloads');
      await batchDownload();
    }
  }, [history, selectedIds, batchDownload]);

  return {
    selectedIds,
    isSelectionMode,
    selectAll,
    toggleSelectionMode,
    toggleSelect,
    selectAllItems,
    deselectAll,
    invertSelection,
    batchDelete,
    batchDownload,
    batchExportAsZip,
    selectedCount,
    hasSelection,
  };
}

export default useBatchOperations;
