import React from 'react';
import { Clock, Trash2, Download, Video } from 'lucide-react';
import { HistoryItem, ImageFilter } from '../../types';

interface HistoryGalleryProps {
  history: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (url: string) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({
  history,
  selectedId,
  onSelect,
  onDelete,
  onDownload,
}) => {
  if (history.length === 0) return null;

  const getFilterStyle = (filters?: ImageFilter) => {
    if (!filters) return undefined;
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`,
    };
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        <Clock size={16} />
        <span className="text-sm font-semibold uppercase tracking-wider">History</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
              selectedId === item.id
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-transparent hover:border-slate-600'
            }`}
          >
            <img
              src={item.imageUrl}
              alt="Thumbnail history"
              className="w-full h-full object-cover"
              style={getFilterStyle(item.filters)}
            />

            {/* Video Indicator */}
            {item.videoUrl && (
              <div className="absolute top-1 right-1 p-1 bg-purple-600 rounded-full text-white shadow-lg">
                <Video size={10} />
              </div>
            )}

            {/* Hover Overlay for Delete */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => onDelete(item.id, e)}
                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item.imageUrl);
                }}
                className="p-1.5 bg-slate-700/80 hover:bg-slate-600 text-white rounded-full transition-colors"
                title="Download"
              >
                <Download size={14} />
              </button>
            </div>

            {selectedId === item.id && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;
