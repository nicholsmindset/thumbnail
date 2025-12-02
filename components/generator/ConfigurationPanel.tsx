import React from 'react';
import {
  RefreshCw,
  Wand2,
  Type,
  Save,
  ScanSearch,
  Sparkles,
  Gauge,
  AlertCircle,
} from 'lucide-react';
import { QualityLevel, TextStyle, SavedTemplate } from '../../types';
import { CREDIT_COSTS } from '../../constants';

interface ConfigurationPanelProps {
  // Aspect Ratio
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;

  // Quality
  quality: QualityLevel;
  onQualityChange: (quality: QualityLevel) => void;

  // Text Options
  textMode: 'keep' | 'change';
  onTextModeChange: (mode: 'keep' | 'change') => void;
  replacementText: string;
  onReplacementTextChange: (text: string) => void;
  textStyle: TextStyle;
  onTextStyleChange: (style: TextStyle) => void;
  detectedTexts: string[];
  isScanningText: boolean;
  onScanText: () => void;
  hasInspirationImage: boolean;

  // Prompt & Templates
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  isEnhancingPrompt: boolean;
  onEnhancePrompt: () => void;
  templates: SavedTemplate[];
  onLoadTemplate: (template: SavedTemplate) => void;
  showSaveTemplate: boolean;
  onToggleSaveTemplate: () => void;
  newTemplateName: string;
  onTemplateNameChange: (name: string) => void;
  isSavingTemplate: boolean;
  onSaveTemplate: () => void;

  // Generate
  isGenerating: boolean;
  onGenerate: () => void;
  currentCost: number;

  // Error
  errorMsg: string | null;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  textMode,
  onTextModeChange,
  replacementText,
  onReplacementTextChange,
  textStyle,
  onTextStyleChange,
  detectedTexts,
  isScanningText,
  onScanText,
  hasInspirationImage,
  customPrompt,
  onPromptChange,
  isEnhancingPrompt,
  onEnhancePrompt,
  templates,
  onLoadTemplate,
  showSaveTemplate,
  onToggleSaveTemplate,
  newTemplateName,
  onTemplateNameChange,
  isSavingTemplate,
  onSaveTemplate,
  isGenerating,
  onGenerate,
  currentCost,
  errorMsg,
}) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-8">
      {/* Aspect Ratio & Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Aspect Ratio */}
        <div>
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 block">
            3. Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-4">
            {['16:9', '9:16', '4:3', '1:1'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => onAspectRatioChange(ratio)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  aspectRatio === ratio
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Level */}
        <div>
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge size={16} /> 4. Quality Level
          </label>
          <div className="flex flex-wrap gap-3">
            {(['standard', 'high', 'ultra'] as QualityLevel[]).map((q) => {
              let cost = CREDIT_COSTS.THUMBNAIL_STANDARD;
              if (q === 'high') cost = CREDIT_COSTS.THUMBNAIL_HIGH;
              if (q === 'ultra') cost = CREDIT_COSTS.THUMBNAIL_ULTRA;

              return (
                <button
                  key={q}
                  onClick={() => onQualityChange(q)}
                  className={`flex flex-col items-start px-4 py-2 rounded-lg text-sm border transition-all ${
                    quality === q
                      ? 'bg-purple-600/20 text-purple-200 border-purple-500 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <span className="font-bold capitalize">{q}</span>
                  <span className="text-[10px] opacity-70">{cost} Credits</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Text Options */}
      <div className="border-t border-slate-700/50 pt-8">
        <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Type size={16} className="text-indigo-400" /> 5. Text Options
        </label>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  textMode === 'keep'
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-500 group-hover:border-slate-400'
                }`}
              >
                {textMode === 'keep' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
              </div>
              <input
                type="radio"
                className="hidden"
                checked={textMode === 'keep'}
                onChange={() => onTextModeChange('keep')}
              />
              <span
                className={
                  textMode === 'keep'
                    ? 'text-white font-medium'
                    : 'text-slate-400 group-hover:text-slate-300'
                }
              >
                Keep Original Text
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  textMode === 'change'
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-500 group-hover:border-slate-400'
                }`}
              >
                {textMode === 'change' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <input
                type="radio"
                className="hidden"
                checked={textMode === 'change'}
                onChange={() => onTextModeChange('change')}
              />
              <span
                className={
                  textMode === 'change'
                    ? 'text-white font-medium'
                    : 'text-slate-400 group-hover:text-slate-300'
                }
              >
                Change Text
              </span>
            </label>

            {/* Scan Button */}
            <button
              onClick={onScanText}
              disabled={isScanningText || !hasInspirationImage}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScanSearch size={14} />
              {isScanningText ? 'Scanning...' : 'Scan Image for Text'}
            </button>
          </div>

          {/* Detected Text Chips */}
          {detectedTexts.length > 0 && textMode === 'change' && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
              <span className="text-xs text-slate-500 w-full mb-1">
                Detected Text (Click to replace):
              </span>
              {detectedTexts.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => onReplacementTextChange(text)}
                  className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs text-slate-300 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-500 transition-all"
                >
                  "{text}"
                </button>
              ))}
            </div>
          )}

          {textMode === 'change' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="col-span-1 md:col-span-2 relative">
                <input
                  type="text"
                  value={replacementText}
                  onChange={(e) => onReplacementTextChange(e.target.value)}
                  placeholder="Enter the new text..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Type
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>

              {/* Styling Options */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Font</label>
                <select
                  value={textStyle.font}
                  onChange={(e) => onTextStyleChange({ ...textStyle, font: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Impact (Classic)</option>
                  <option>Sans-serif (Modern)</option>
                  <option>Serif (Elegant)</option>
                  <option>Brush (Handwritten)</option>
                  <option>Futuristic</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Effect</label>
                <select
                  value={textStyle.effect}
                  onChange={(e) => onTextStyleChange({ ...textStyle, effect: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>None</option>
                  <option>Drop Shadow</option>
                  <option>Thick Outline</option>
                  <option>Neon Glow</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textStyle.color}
                    onChange={(e) => onTextStyleChange({ ...textStyle, color: e.target.value })}
                    className="h-9 w-12 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-600"
                  />
                  <span className="text-sm text-slate-300 font-mono">{textStyle.color}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt & Templates */}
      <div className="border-t border-slate-700/50 pt-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block">
            6. Context & Details (Optional)
          </label>

          {/* Templates Dropdown */}
          {templates.length > 0 && (
            <select
              onChange={(e) => {
                const t = templates.find((temp) => temp.id === e.target.value);
                if (t) onLoadTemplate(t);
              }}
              className="bg-slate-800 border border-slate-600 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Load Template...
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. 'Make me look shocked' or 'Add fire in background'"
                value={customPrompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={onEnhancePrompt}
                disabled={isEnhancingPrompt || !customPrompt}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors"
                title="Enhance Prompt with AI"
              >
                {isEnhancingPrompt ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            </div>

            <button
              onClick={onToggleSaveTemplate}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-indigo-300 rounded-xl transition-colors"
              title="Save Prompt as Template"
            >
              <Save size={20} />
            </button>
          </div>

          {/* Save Template Inline Form */}
          {showSaveTemplate && (
            <div className="flex gap-2 items-center bg-slate-800 p-3 rounded-lg border border-slate-600 animate-in fade-in slide-in-from-top-1">
              <input
                type="text"
                placeholder="Template Name (e.g., 'Shocked Face')"
                value={newTemplateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
              />
              <button
                onClick={onSaveTemplate}
                disabled={isSavingTemplate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingTemplate && <RefreshCw className="animate-spin" size={12} />}
                Save
              </button>
              <button
                onClick={onToggleSaveTemplate}
                disabled={isSavingTemplate}
                className="px-4 py-2 bg-transparent text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isGenerating
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:scale-[1.02]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Wand2 /> Generate Thumbnail ({currentCost} Credits)
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
