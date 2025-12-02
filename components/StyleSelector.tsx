import React from 'react';
import { ThumbnailStyle } from '../types';
import { THUMBNAIL_STYLES } from '../constants';
import { Check } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: ThumbnailStyle | undefined;
  onStyleChange: (style: ThumbnailStyle) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Thumbnail Style
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {THUMBNAIL_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              {/* Color indicator */}
              <div
                className="w-full h-2 rounded-full mb-2"
                style={{ backgroundColor: style.previewColor }}
              />

              {/* Style name */}
              <div className="font-medium text-sm text-white">
                {style.name}
              </div>

              {/* Description */}
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                {style.description}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelector;
