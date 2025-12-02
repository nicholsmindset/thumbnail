import React, { useState, useMemo } from 'react';
import {
  SplitSquareVertical,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  ThumbsUp,
  BarChart3,
  Shuffle,
} from 'lucide-react';
import { HistoryItem, AnalysisResult } from '../types';

interface ABTestingPanelProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onAnalyze?: (imageUrl: string) => Promise<AnalysisResult>;
}

interface ComparisonPair {
  thumbnailA: HistoryItem;
  thumbnailB: HistoryItem;
  winnerVotes: { A: number; B: number };
}

const ABTestingPanel: React.FC<ABTestingPanelProps> = ({
  history,
  isOpen,
  onClose,
  onAnalyze,
}) => {
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [comparisonHistory, setComparisonHistory] = useState<ComparisonPair[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    A?: AnalysisResult;
    B?: AnalysisResult;
  }>({});
  const [userPick, setUserPick] = useState<'A' | 'B' | null>(null);

  const thumbnailA = useMemo(
    () => history.find((item) => item.id === selectedA),
    [history, selectedA]
  );
  const thumbnailB = useMemo(
    () => history.find((item) => item.id === selectedB),
    [history, selectedB]
  );

  // Get available thumbnails for selection (excluding already selected)
  const availableForA = useMemo(
    () => history.filter((item) => item.id !== selectedB),
    [history, selectedB]
  );
  const availableForB = useMemo(
    () => history.filter((item) => item.id !== selectedA),
    [history, selectedA]
  );

  /**
   * Randomly select two thumbnails for comparison
   */
  const randomSelect = () => {
    if (history.length < 2) return;

    const shuffled = [...history].sort(() => Math.random() - 0.5);
    setSelectedA(shuffled[0].id);
    setSelectedB(shuffled[1].id);
    setAnalysisResults({});
    setUserPick(null);
  };

  /**
   * Run AI analysis on both thumbnails
   */
  const runAnalysis = async () => {
    if (!thumbnailA || !thumbnailB || !onAnalyze) return;

    setIsAnalyzing(true);
    setAnalysisResults({});

    try {
      const [resultA, resultB] = await Promise.all([
        onAnalyze(thumbnailA.imageUrl),
        onAnalyze(thumbnailB.imageUrl),
      ]);

      setAnalysisResults({ A: resultA, B: resultB });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Record user's pick
   */
  const pickWinner = (pick: 'A' | 'B') => {
    setUserPick(pick);

    if (thumbnailA && thumbnailB) {
      setComparisonHistory((prev) => [
        ...prev,
        {
          thumbnailA,
          thumbnailB,
          winnerVotes: {
            A: pick === 'A' ? 1 : 0,
            B: pick === 'B' ? 1 : 0,
          },
        },
      ]);
    }
  };

  /**
   * Get the AI recommended winner
   */
  const aiWinner = useMemo(() => {
    if (!analysisResults.A || !analysisResults.B) return null;
    if (analysisResults.A.score > analysisResults.B.score) return 'A';
    if (analysisResults.B.score > analysisResults.A.score) return 'B';
    return 'tie';
  }, [analysisResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <SplitSquareVertical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">A/B Testing</h2>
              <p className="text-slate-400 text-sm">Compare thumbnails side-by-side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Selection Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={randomSelect}
              disabled={history.length < 2}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Shuffle size={18} />
              Random Pair
            </button>

            {thumbnailA && thumbnailB && onAnalyze && (
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <BarChart3 size={18} />
                {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
              </button>
            )}
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbnail A */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                    A
                  </span>
                  Variant A
                </h3>
                {analysisResults.A && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      analysisResults.A.score >= 80
                        ? 'bg-green-500/20 text-green-400'
                        : analysisResults.A.score >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    Score: {analysisResults.A.score}
                  </span>
                )}
              </div>

              {/* Image selector or preview */}
              {thumbnailA ? (
                <div
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    userPick === 'A'
                      ? 'border-green-500 ring-2 ring-green-500/30'
                      : aiWinner === 'A'
                      ? 'border-purple-500'
                      : 'border-slate-700'
                  }`}
                >
                  {userPick === 'A' && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <Trophy size={12} /> Your Pick
                    </div>
                  )}
                  {aiWinner === 'A' && (
                    <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <BarChart3 size={12} /> AI Pick
                    </div>
                  )}
                  <img
                    src={thumbnailA.imageUrl}
                    alt="Variant A"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              ) : (
                <ThumbnailSelector
                  items={availableForA}
                  onSelect={setSelectedA}
                  label="Select Variant A"
                />
              )}

              {/* Pick button */}
              {thumbnailA && thumbnailB && !userPick && (
                <button
                  onClick={() => pickWinner('A')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ThumbsUp size={18} />
                  Pick A as Winner
                </button>
              )}

              {/* Analysis details */}
              {analysisResults.A && (
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-slate-300 italic">"{analysisResults.A.critique}"</p>
                  <div className="flex flex-wrap gap-1">
                    {analysisResults.A.strengths.slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-xl font-black text-white">
                VS
              </div>
            </div>

            {/* Thumbnail B */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm">
                    B
                  </span>
                  Variant B
                </h3>
                {analysisResults.B && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      analysisResults.B.score >= 80
                        ? 'bg-green-500/20 text-green-400'
                        : analysisResults.B.score >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    Score: {analysisResults.B.score}
                  </span>
                )}
              </div>

              {thumbnailB ? (
                <div
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    userPick === 'B'
                      ? 'border-green-500 ring-2 ring-green-500/30'
                      : aiWinner === 'B'
                      ? 'border-purple-500'
                      : 'border-slate-700'
                  }`}
                >
                  {userPick === 'B' && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <Trophy size={12} /> Your Pick
                    </div>
                  )}
                  {aiWinner === 'B' && (
                    <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded flex items-center gap-1">
                      <BarChart3 size={12} /> AI Pick
                    </div>
                  )}
                  <img
                    src={thumbnailB.imageUrl}
                    alt="Variant B"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              ) : (
                <ThumbnailSelector
                  items={availableForB}
                  onSelect={setSelectedB}
                  label="Select Variant B"
                />
              )}

              {thumbnailA && thumbnailB && !userPick && (
                <button
                  onClick={() => pickWinner('B')}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ThumbsUp size={18} />
                  Pick B as Winner
                </button>
              )}

              {analysisResults.B && (
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-slate-300 italic">"{analysisResults.B.critique}"</p>
                  <div className="flex flex-wrap gap-1">
                    {analysisResults.B.strengths.slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Winner announcement */}
          {userPick && (
            <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 border border-green-500/30 rounded-xl p-6 text-center animate-in zoom-in duration-300">
              <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                You picked Variant {userPick}!
              </h3>
              {aiWinner && aiWinner !== 'tie' && (
                <p className="text-slate-300">
                  AI recommendation:{' '}
                  <span className={aiWinner === userPick ? 'text-green-400' : 'text-orange-400'}>
                    Variant {aiWinner}
                    {aiWinner === userPick ? ' (Matches!)' : ' (Different)'}
                  </span>
                </p>
              )}
              <button
                onClick={() => {
                  setSelectedA(null);
                  setSelectedB(null);
                  setUserPick(null);
                  setAnalysisResults({});
                }}
                className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Start New Comparison
              </button>
            </div>
          )}

          {/* Comparison History */}
          {comparisonHistory.length > 0 && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Comparison History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonHistory.slice(-6).map((pair, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
                    <img
                      src={pair.thumbnailA.imageUrl}
                      alt="A"
                      className={`w-16 h-10 object-cover rounded ${
                        pair.winnerVotes.A > 0 ? 'ring-2 ring-green-500' : 'opacity-50'
                      }`}
                    />
                    <span className="text-slate-500 font-bold">vs</span>
                    <img
                      src={pair.thumbnailB.imageUrl}
                      alt="B"
                      className={`w-16 h-10 object-cover rounded ${
                        pair.winnerVotes.B > 0 ? 'ring-2 ring-green-500' : 'opacity-50'
                      }`}
                    />
                    <Trophy
                      size={16}
                      className={`ml-auto ${
                        pair.winnerVotes.A > 0 ? 'text-blue-400' : 'text-orange-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Thumbnail selector sub-component
 */
const ThumbnailSelector: React.FC<{
  items: HistoryItem[];
  onSelect: (id: string) => void;
  label: string;
}> = ({ items, onSelect, label }) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 4;
  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < items.length - visibleCount;

  if (items.length === 0) {
    return (
      <div className="aspect-video bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center">
        <p className="text-slate-500 text-sm">No thumbnails available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-slate-800 rounded-full border border-slate-600 text-white"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="grid grid-cols-4 gap-2 overflow-hidden">
          {items.slice(scrollIndex, scrollIndex + visibleCount).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
            >
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => setScrollIndex((i) => Math.min(items.length - visibleCount, i + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-slate-800 rounded-full border border-slate-600 text-white"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ABTestingPanel;
