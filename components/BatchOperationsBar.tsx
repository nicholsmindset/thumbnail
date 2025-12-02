import React from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  Download,
  X,
  FolderDown,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';

interface BatchOperationsBarProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  selectAll: boolean;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onBatchDelete: () => void;
  onBatchDownload: () => void;
  onBatchExportZip: () => void;
}

const BatchOperationsBar: React.FC<BatchOperationsBarProps> = ({
  isSelectionMode,
  selectedCount,
  totalCount,
  selectAll,
  onToggleSelectionMode,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onBatchDelete,
  onBatchDownload,
  onBatchExportZip,
}) => {
  if (!isSelectionMode) {
    return (
      <button
        onClick={onToggleSelectionMode}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
        title="Select multiple items"
      >
        <CheckSquare size={16} />
        Select
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-xl animate-in slide-in-from-top-2 duration-200">
      {/* Selection info */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-600">
        <span className="text-sm text-indigo-200">
          <span className="font-bold">{selectedCount}</span>
          <span className="text-slate-400"> of {totalCount} selected</span>
        </span>
      </div>

      {/* Selection actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={selectAll ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title={selectAll ? 'Deselect all' : 'Select all'}
        >
          {selectAll ? <Square size={14} /> : <CheckCheck size={14} />}
          {selectAll ? 'None' : 'All'}
        </button>

        <button
          onClick={onInvertSelection}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title="Invert selection"
        >
          <RotateCcw size={14} />
          Invert
        </button>
      </div>

      {/* Batch actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1 pl-3 border-l border-slate-600">
          <button
            onClick={onBatchDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-indigo-300 hover:text-white hover:bg-indigo-600 rounded transition-colors"
            title="Download selected"
          >
            <Download size={14} />
            Download ({selectedCount})
          </button>

          <button
            onClick={onBatchExportZip}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-indigo-300 hover:text-white hover:bg-indigo-600 rounded transition-colors"
            title="Export as ZIP"
          >
            <FolderDown size={14} />
            ZIP
          </button>

          <button
            onClick={onBatchDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-300 hover:text-white hover:bg-red-600 rounded transition-colors"
            title="Delete selected"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Exit selection mode */}
      <button
        onClick={onToggleSelectionMode}
        className="ml-auto p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        title="Exit selection mode"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default BatchOperationsBar;
