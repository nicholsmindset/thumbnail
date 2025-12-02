import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { HistoryItem, ImageFilter, AnalysisResult, YoutubeMetadataResult } from '../types';
import { STORAGE_KEYS, DEFAULT_FILTERS, UI } from '../constants';

export interface UseHistoryReturn {
  history: HistoryItem[];
  selectedId: string | null;
  selectedItem: HistoryItem | undefined;
  currentFilters: ImageFilter;
  setSelectedId: (id: string | null) => void;
  addHistoryItem: (item: HistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  updateHistoryItem: (id: string, updates: Partial<HistoryItem>) => void;
  updateFilters: (filters: Partial<ImageFilter>) => void;
  resetFilters: () => void;
  clearHistory: () => void;
}

/**
 * Custom hook for managing thumbnail history with localStorage persistence
 */
export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  const [selectedId, setSelectedIdInternal] = useState<string | null>(
    () => history[0]?.id ?? null
  );
  const [currentFilters, setCurrentFilters] = useState<ImageFilter>(DEFAULT_FILTERS);

  /**
   * Get the currently selected history item
   */
  const selectedItem = useMemo(
    () => history.find((item) => item.id === selectedId),
    [history, selectedId]
  );

  /**
   * Set selected item and update filters accordingly
   */
  const setSelectedId = useCallback(
    (id: string | null) => {
      setSelectedIdInternal(id);
      if (id) {
        const item = history.find((i) => i.id === id);
        setCurrentFilters(item?.filters || DEFAULT_FILTERS);
      }
    },
    [history]
  );

  /**
   * Add a new history item
   */
  const addHistoryItem = useCallback(
    (item: HistoryItem) => {
      setHistory((prev) => {
        const updated = [item, ...prev].slice(0, UI.MAX_HISTORY_ITEMS);
        return updated;
      });
      setSelectedIdInternal(item.id);
      setCurrentFilters(item.filters || DEFAULT_FILTERS);
    },
    [setHistory]
  );

  /**
   * Remove a history item
   */
  const removeHistoryItem = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        // If we removed the selected item, select the first remaining item
        if (selectedId === id) {
          const nextSelected = updated[0]?.id ?? null;
          setSelectedIdInternal(nextSelected);
          if (nextSelected) {
            const nextItem = updated.find((i) => i.id === nextSelected);
            setCurrentFilters(nextItem?.filters || DEFAULT_FILTERS);
          }
        }
        return updated;
      });
    },
    [selectedId, setHistory]
  );

  /**
   * Update a history item (e.g., add analysis or metadata)
   */
  const updateHistoryItem = useCallback(
    (id: string, updates: Partial<HistoryItem>) => {
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [setHistory]
  );

  /**
   * Update filters for current selection
   */
  const updateFilters = useCallback(
    (filters: Partial<ImageFilter>) => {
      setCurrentFilters((prev) => {
        const updated = { ...prev, ...filters };
        // Also update the history item
        if (selectedId) {
          setHistory((prevHistory) =>
            prevHistory.map((item) =>
              item.id === selectedId ? { ...item, filters: updated } : item
            )
          );
        }
        return updated;
      });
    },
    [selectedId, setHistory]
  );

  /**
   * Reset filters to defaults
   */
  const resetFilters = useCallback(() => {
    setCurrentFilters(DEFAULT_FILTERS);
    if (selectedId) {
      setHistory((prevHistory) =>
        prevHistory.map((item) =>
          item.id === selectedId ? { ...item, filters: DEFAULT_FILTERS } : item
        )
      );
    }
  }, [selectedId, setHistory]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedIdInternal(null);
    setCurrentFilters(DEFAULT_FILTERS);
  }, [setHistory]);

  return {
    history,
    selectedId,
    selectedItem,
    currentFilters,
    setSelectedId,
    addHistoryItem,
    removeHistoryItem,
    updateHistoryItem,
    updateFilters,
    resetFilters,
    clearHistory,
  };
}

export default useHistory;
