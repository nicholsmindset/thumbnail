import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { SavedTemplate } from '../types';
import { STORAGE_KEYS, TIMING } from '../constants';

export interface UseTemplatesReturn {
  templates: SavedTemplate[];
  showSaveTemplate: boolean;
  newTemplateName: string;
  isSavingTemplate: boolean;
  setShowSaveTemplate: (show: boolean) => void;
  setNewTemplateName: (name: string) => void;
  saveTemplate: (prompt: string) => void;
  loadTemplate: (template: SavedTemplate, setPrompt: (prompt: string) => void) => void;
  deleteTemplate: (id: string) => void;
}

/**
 * Custom hook for managing prompt templates with localStorage persistence
 */
export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useLocalStorage<SavedTemplate[]>(
    STORAGE_KEYS.TEMPLATES,
    []
  );
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  /**
   * Save a new template
   */
  const saveTemplate = useCallback(
    (prompt: string) => {
      if (!newTemplateName.trim() || !prompt.trim()) return;

      setIsSavingTemplate(true);

      // Simulate async save with delay for UX feedback
      setTimeout(() => {
        const newTemplate: SavedTemplate = {
          id: Date.now().toString(),
          name: newTemplateName.trim(),
          prompt: prompt.trim(),
        };
        setTemplates((prev) => [...prev, newTemplate]);
        setNewTemplateName('');
        setShowSaveTemplate(false);
        setIsSavingTemplate(false);
      }, TIMING.TEMPLATE_SAVE_DELAY);
    },
    [newTemplateName, setTemplates]
  );

  /**
   * Load a template into the prompt input
   */
  const loadTemplate = useCallback(
    (template: SavedTemplate, setPrompt: (prompt: string) => void) => {
      setPrompt(template.prompt);
    },
    []
  );

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    },
    [setTemplates]
  );

  return {
    templates,
    showSaveTemplate,
    newTemplateName,
    isSavingTemplate,
    setShowSaveTemplate,
    setNewTemplateName,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  };
}

export default useTemplates;
