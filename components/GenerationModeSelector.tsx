import React from 'react';
import { Copy, Wand2 } from 'lucide-react';
import { GenerationMode } from '../types';

interface GenerationModeSelectorProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700">
      <button
        onClick={() => onModeChange('clone')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
          mode === 'clone'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <Copy size={18} />
        <span>Clone Style</span>
      </button>
      <button
        onClick={() => onModeChange('prompt')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
          mode === 'prompt'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <Wand2 size={18} />
        <span>Create from Prompt</span>
      </button>
    </div>
  );
};

export default GenerationModeSelector;
