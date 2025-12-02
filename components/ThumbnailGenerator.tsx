
import React, { useState, useEffect } from 'react';
import { Sparkles, Download, AlertCircle, RefreshCw, Wand2, Clock, Trash2, Type, Save, Video, Eye, ThumbsUp, TrendingUp, AlertTriangle, CheckCircle2, ScanSearch, Gauge, Copy, Check, FileText, Hash, List, MonitorPlay, Sliders } from 'lucide-react';
import Header from './Header';
import ImageUploader from './ImageUploader';
import Dashboard from './Dashboard';
import GenerationModeSelector from './GenerationModeSelector';
import StyleSelector from './StyleSelector';
import { FileWithPreview, GenerationStatus, HistoryItem, SavedTemplate, TextStyle, UserProfile, CREDIT_COSTS, PlanDetails, QualityLevel, ImageFilter, GenerationMode, ThumbnailStyle } from '../types';
import { checkApiKey, selectApiKey, generateThumbnail, generateThumbnailFromPrompt, generateVideoFromThumbnail, detectTextInImage, analyzeThumbnail, generateYoutubeMetadata, enhancePrompt } from '../services/geminiService';

const DEFAULT_USER_PROFILE: UserProfile = {
  credits: 10, // Starts with exactly 1 free generation
  plan: 'free',
  totalGenerations: 0
};

const DEFAULT_FILTERS: ImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100
};

const ThumbnailGenerator: React.FC = () => {
  // User Profile & Credits
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Generation Mode
  const [generationMode, setGenerationMode] = useState<GenerationMode>('clone');

  const [inspirationImg, setInspirationImg] = useState<FileWithPreview | null>(null);
  const [userImg, setUserImg] = useState<FileWithPreview | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);

  // Prompt Mode Options
  const [thumbnailStyle, setThumbnailStyle] = useState<ThumbnailStyle>('dramatic');
  const [thumbnailText, setThumbnailText] = useState('');
  
  // Aspect Ratio & Quality
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState<QualityLevel>('standard');

  // Text Options State
  const [textMode, setTextMode] = useState<'keep' | 'change'>('keep');
  const [replacementText, setReplacementText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    font: 'Impact (Classic)',
    color: '#FFFFFF',
    effect: 'None'
  });
  const [isScanningText, setIsScanningText] = useState(false);
  const [detectedTexts, setDetectedTexts] = useState<string[]>([]);
  
  // Templates
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedInspiration, setCopiedInspiration] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ImageFilter>(DEFAULT_FILTERS);
  
  // Video State
  const [videoStatus, setVideoStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  // Analysis & Results UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'metadata' | 'mockup' | 'edit'>('mockup');
  
  // Metadata State
  const [metadataContext, setMetadataContext] = useState('');
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

  const [hasKey, setHasKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      // API Key Check
      const exists = await checkApiKey();
      setHasKey(exists);

      // Load User Profile
      const savedProfile = localStorage.getItem('thumbgen_user');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      // Load Templates
      const savedTemplates = localStorage.getItem('thumbgen_templates');
      if (savedTemplates) {
        try {
          setTemplates(JSON.parse(savedTemplates));
        } catch (e) { console.error(e); }
      }

      // Load History
      const savedHistory = localStorage.getItem('thumbgen_history');
      if (savedHistory) {
        try {
            const parsedHistory = JSON.parse(savedHistory);
            setHistory(parsedHistory);
            if (parsedHistory.length > 0) {
                setSelectedId(parsedHistory[0].id);
            }
        } catch (e) { console.error(e); }
      }
    };
    init();
  }, []);

  // Persist User Profile whenever it changes
  useEffect(() => {
    localStorage.setItem('thumbgen_user', JSON.stringify(userProfile));
  }, [userProfile]);

  // Persist History whenever it changes
  useEffect(() => {
    if (history.length > 0) {
        localStorage.setItem('thumbgen_history', JSON.stringify(history));
    }
  }, [history]);

  // Update filters when selection changes
  useEffect(() => {
    const item = history.find(i => i.id === selectedId);
    if (item) {
        setCurrentFilters(item.filters || DEFAULT_FILTERS);
    }
  }, [selectedId, history]);

  const saveTemplate = () => {
    if (!newTemplateName.trim() || !customPrompt.trim()) return;
    setIsSavingTemplate(true);
    
    // Simulate async save
    setTimeout(() => {
        const newTemplate: SavedTemplate = {
            id: Date.now().toString(),
            name: newTemplateName,
            prompt: customPrompt
        };
        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('thumbgen_templates', JSON.stringify(updated));
        setNewTemplateName('');
        setShowSaveTemplate(false);
        setIsSavingTemplate(false);
    }, 800);
  };

  const loadTemplate = (template: SavedTemplate) => {
    setCustomPrompt(template.prompt);
  };

  const handleConnect = async () => {
    try {
      await selectApiKey();
      setHasKey(true);
      setErrorMsg(null);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to connect API Key. Please try again.");
    }
  };

  const handleUpgrade = (plan: PlanDetails) => {
    // Simulate Purchase
    if (confirm(`Confirm upgrade to ${plan.name} for ${plan.price}? This will add ${plan.credits} credits.`)) {
        setUserProfile(prev => ({
            ...prev,
            plan: plan.id,
            credits: prev.credits + plan.credits
        }));
        alert("Purchase successful! Credits added.");
        setIsDashboardOpen(false);
    }
  };

  const getCurrentCost = (): number => {
    switch(quality) {
        case 'high': return CREDIT_COSTS.THUMBNAIL_HIGH;
        case 'ultra': return CREDIT_COSTS.THUMBNAIL_ULTRA;
        case 'standard': 
        default: return CREDIT_COSTS.THUMBNAIL_STANDARD;
    }
  };

  const deductCredits = (amount: number): boolean => {
      if (userProfile.credits < amount) {
          setIsDashboardOpen(true);
          return false;
      }
      setUserProfile(prev => ({
          ...prev,
          credits: prev.credits - amount,
          totalGenerations: prev.totalGenerations + 1
      }));
      return true;
  };

  const handleScanText = async () => {
    if (!hasKey) { await handleConnect(); return; }
    if (!inspirationImg) { setErrorMsg("Upload inspiration image first."); return; }
    
    setIsScanningText(true);
    setErrorMsg(null);
    try {
        const texts = await detectTextInImage(inspirationImg.base64);
        setDetectedTexts(texts);
        if (texts.length === 0) {
            setErrorMsg("No readable text detected.");
        }
    } catch (e) {
        console.error(e);
        setErrorMsg("Failed to scan text.");
    } finally {
        setIsScanningText(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!customPrompt.trim()) return;
    if (!hasKey) { await handleConnect(); return; }
    
    setIsEnhancingPrompt(true);
    try {
        const enhanced = await enhancePrompt(customPrompt);
        setCustomPrompt(enhanced);
    } catch(e) {
        console.error(e);
        setErrorMsg("Failed to enhance prompt.");
    } finally {
        setIsEnhancingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    if (!hasKey) {
      await handleConnect();
      return;
    }

    // Validation based on mode
    if (generationMode === 'clone') {
      if (!inspirationImg || !userImg) {
        setErrorMsg("Please upload both an inspiration thumbnail and your photo.");
        return;
      }
    } else {
      // Prompt mode
      if (!userImg) {
        setErrorMsg("Please upload your photo.");
        return;
      }
      if (!customPrompt.trim()) {
        setErrorMsg("Please describe the thumbnail you want to create.");
        return;
      }
    }

    // Credit Check
    const cost = getCurrentCost();
    if (!deductCredits(cost)) {
        setErrorMsg(`Insufficient credits. Requires ${cost} credits.`);
        return;
    }

    setErrorMsg(null);
    setStatus(GenerationStatus.GENERATING);

    try {
      let generatedUrl: string;

      if (generationMode === 'clone') {
        // Clone mode: use inspiration image
        generatedUrl = await generateThumbnail({
          inspirationImage: inspirationImg!.base64,
          userImage: userImg!.base64,
          prompt: customPrompt,
          textReplacement: textMode === 'change' ? replacementText : undefined,
          textStyle: textMode === 'change' ? textStyle : undefined,
          aspectRatio: aspectRatio,
          quality: quality
        });
      } else {
        // Prompt mode: generate from scratch
        generatedUrl = await generateThumbnailFromPrompt({
          userImage: userImg!.base64,
          prompt: customPrompt,
          thumbnailText: thumbnailText || undefined,
          textStyle: thumbnailText ? textStyle : undefined,
          aspectRatio: aspectRatio,
          quality: quality,
          style: thumbnailStyle
        });
      }

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        imageUrl: generatedUrl,
        inspirationImage: generationMode === 'clone' ? inspirationImg?.base64 : undefined,
        prompt: customPrompt || (generationMode === 'clone' ? "Style Copy" : "Prompt Generation"),
        timestamp: Date.now(),
        aspectRatio: aspectRatio,
        quality: quality,
        filters: DEFAULT_FILTERS
      };

      setHistory(prev => [newItem, ...prev]);
      setSelectedId(newItem.id);
      setStatus(GenerationStatus.SUCCESS);
      setActiveTab('mockup'); // Switch to preview tab on new generation
    } catch (error: any) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      // Refund credits on failure
      setUserProfile(prev => ({ ...prev, credits: prev.credits + cost, totalGenerations: prev.totalGenerations - 1 }));

      if (error.message && error.message.includes("Requested entity was not found")) {
          setHasKey(false);
          setErrorMsg("API Key invalid or expired. Please reconnect.");
      } else {
          setErrorMsg("Failed to generate thumbnail. Credits refunded.");
      }
    }
  };

  const handleFilterChange = (key: keyof ImageFilter, value: number) => {
      const updatedFilters = { ...currentFilters, [key]: value };
      setCurrentFilters(updatedFilters);
      
      // Update history item
      setHistory(prev => prev.map(item => 
          item.id === selectedId ? { ...item, filters: updatedFilters } : item
      ));
  };

  const handleGenerateVideo = async () => {
    const item = history.find(i => i.id === selectedId);
    if (!item) return;

    // Credit Check
    if (!deductCredits(CREDIT_COSTS.VIDEO)) {
        alert(`Video generation requires ${CREDIT_COSTS.VIDEO} credits. Please upgrade.`);
        return;
    }

    setVideoStatus(GenerationStatus.GENERATING);
    try {
        const videoUrl = await generateVideoFromThumbnail(item.imageUrl, item.prompt, item.aspectRatio);
        
        // Update history item with video url
        const updatedHistory = history.map(h => 
            h.id === item.id ? { ...h, videoUrl } : h
        );
        setHistory(updatedHistory);
        setVideoStatus(GenerationStatus.SUCCESS);
    } catch (e) {
        console.error(e);
        setVideoStatus(GenerationStatus.ERROR);
        setErrorMsg("Failed to generate video. Credits refunded.");
        // Refund
        setUserProfile(prev => ({ ...prev, credits: prev.credits + CREDIT_COSTS.VIDEO, totalGenerations: prev.totalGenerations - 1 }));
    }
  };

  const handleAnalysis = async () => {
    const item = history.find(i => i.id === selectedId);
    if (!item) return;
    if (item.analysis) return; // Already analyzed

    if (!deductCredits(CREDIT_COSTS.AUDIT)) {
        alert(`Audit requires ${CREDIT_COSTS.AUDIT} credits.`);
        return;
    }

    setIsAnalyzing(true);
    try {
        const analysis = await analyzeThumbnail(item.imageUrl);
        const updatedHistory = history.map(h => 
            h.id === item.id ? { ...h, analysis } : h
        );
        setHistory(updatedHistory);
    } catch (e) {
        console.error(e);
        setErrorMsg("Failed to analyze thumbnail. Credits refunded.");
        setUserProfile(prev => ({ ...prev, credits: prev.credits + CREDIT_COSTS.AUDIT }));
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleMetadataGeneration = async () => {
    const item = history.find(i => i.id === selectedId);
    if (!item) return;
    if (item.metadata) return; // Already exists

    if (!deductCredits(CREDIT_COSTS.METADATA)) {
      alert(`Metadata requires ${CREDIT_COSTS.METADATA} credits.`);
      return;
    }

    setIsGeneratingMetadata(true);
    try {
      const metadata = await generateYoutubeMetadata(item.imageUrl, metadataContext || "No context provided. Base it on the visual.");
      const updatedHistory = history.map(h => 
          h.id === item.id ? { ...h, metadata } : h
      );
      setHistory(updatedHistory);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate metadata. Credits refunded.");
      setUserProfile(prev => ({ ...prev, credits: prev.credits + CREDIT_COSTS.METADATA }));
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleDownload = (url: string, isVideo: boolean = false) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = isVideo ? `thumbgen-video-${Date.now()}.mp4` : `thumbgen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyInspiration = (inspirationBase64: string | undefined) => {
      if (!inspirationBase64) return;
      navigator.clipboard.writeText(inspirationBase64).then(() => {
          setCopiedInspiration(true);
          setTimeout(() => setCopiedInspiration(false), 2000);
      }).catch(err => {
          console.error("Failed to copy: ", err);
      });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    if (selectedId === id) {
      setSelectedId(newHistory.length > 0 ? newHistory[0].id : null);
    }
  };

  const selectedItem = history.find(item => item.id === selectedId) || (history.length > 0 ? history[0] : null);

  // Filter Styles
  const filterStyle = {
      filter: `brightness(${currentFilters.brightness}%) contrast(${currentFilters.contrast}%) saturate(${currentFilters.saturation}%)`
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 flex flex-col gap-10 pt-8 pb-20">
      <Header credits={userProfile.credits} onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Dashboard 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
        userProfile={userProfile}
        onUpgrade={handleUpgrade}
      />
      
      {/* Welcome / Intro Text */}
      <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">
            {generationMode === 'clone' ? 'Clone viral styles. Feature yourself.' : 'Create thumbnails from your imagination.'}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
            {generationMode === 'clone'
              ? 'Upload a reference thumbnail and a selfie. The AI replicates the lighting, text, and composition but swaps the identity with yours.'
              : 'Describe your perfect thumbnail and upload your photo. The AI will create it from scratch with your face.'}
            </p>
      </div>

      {/* Generation Mode Selector */}
      <div className="max-w-md mx-auto">
        <GenerationModeSelector
          mode={generationMode}
          onModeChange={setGenerationMode}
        />
      </div>

      {/* API Key Banner */}
      {!hasKey && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-full text-orange-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-orange-100">Action Required</h3>
              <p className="text-orange-200/80 text-sm">You need to connect a paid Google Cloud Project API key to use the Gemini 3 Pro model.</p>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-orange-400 underline mt-1 block">Read Billing Docs</a>
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap"
          >
            Connect API Key
          </button>
        </div>
      )}

      {/* Input Section */}
      {generationMode === 'clone' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUploader
            id="insp-upload"
            label="1. Inspiration Thumbnail"
            description="Upload a thumbnail you want to copy the style/layout from."
            image={inspirationImg}
            onImageChange={setInspirationImg}
            isLoading={isScanningText}
          />
          <ImageUploader
            id="user-upload"
            label="2. Your Face (Reference)"
            description="Upload a high-quality close-up of your face. Good lighting and looking at the camera works best."
            image={userImg}
            onImageChange={setUserImg}
            isLoading={false}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Photo Uploader for Prompt Mode */}
          <div className="max-w-md mx-auto">
            <ImageUploader
              id="user-upload-prompt"
              label="1. Your Face (Reference)"
              description="Upload a high-quality close-up of your face. This is the only image needed."
              image={userImg}
              onImageChange={setUserImg}
              isLoading={false}
            />
          </div>

          {/* Style Selector for Prompt Mode */}
          <StyleSelector
            selectedStyle={thumbnailStyle}
            onStyleChange={setThumbnailStyle}
          />
        </div>
      )}

      {/* Configuration Section */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Aspect Ratio */}
          <div>
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 block">3. Aspect Ratio</label>
              <div className="flex flex-wrap gap-4">
              {['16:9', '9:16', '4:3', '1:1'].map((ratio) => (
                  <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
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
                    if(q === 'high') cost = CREDIT_COSTS.THUMBNAIL_HIGH;
                    if(q === 'ultra') cost = CREDIT_COSTS.THUMBNAIL_ULTRA;
                    
                    return (
                      <button
                          key={q}
                          onClick={() => setQuality(q)}
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

        {/* Text Options - Clone Mode Only */}
        {generationMode === 'clone' && (
        <div className="border-t border-slate-700/50 pt-8">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Type size={16} className="text-indigo-400"/> 5. Text Options
          </label>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${textMode === 'keep' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-500 group-hover:border-slate-400'}`}>
                  {textMode === 'keep' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                </div>
                <input type="radio" className="hidden" checked={textMode === 'keep'} onChange={() => setTextMode('keep')} />
                <span className={textMode === 'keep' ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}>Keep Original Text</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${textMode === 'change' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-500 group-hover:border-slate-400'}`}>
                  {textMode === 'change' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                </div>
                <input type="radio" className="hidden" checked={textMode === 'change'} onChange={() => setTextMode('change')} />
                <span className={textMode === 'change' ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}>Change Text</span>
              </label>

              {/* Scan Button */}
                <button
                  onClick={handleScanText}
                  disabled={isScanningText || !inspirationImg}
                  className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ScanSearch size={14} />
                  {isScanningText ? 'Scanning...' : 'Scan Image for Text'}
                </button>
            </div>

            {/* Detected Text Chips */}
            {detectedTexts.length > 0 && textMode === 'change' && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="text-xs text-slate-500 w-full mb-1">Detected Text (Click to replace):</span>
                  {detectedTexts.map((text, idx) => (
                      <button
                          key={idx}
                          onClick={() => setReplacementText(text)}
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
                    onChange={(e) => setReplacementText(e.target.value)}
                    placeholder="Enter the new text..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>

                {/* Styling Options */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Font</label>
                  <select
                    value={textStyle.font}
                    onChange={(e) => setTextStyle({...textStyle, font: e.target.value})}
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
                    onChange={(e) => setTextStyle({...textStyle, effect: e.target.value})}
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
                          onChange={(e) => setTextStyle({...textStyle, color: e.target.value})}
                          className="h-9 w-12 bg-transparent cursor-pointer rounded overflow-hidden border border-slate-600"
                      />
                      <span className="text-sm text-slate-300 font-mono">{textStyle.color}</span>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Thumbnail Text - Prompt Mode Only */}
        {generationMode === 'prompt' && (
        <div className="border-t border-slate-700/50 pt-8">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Type size={16} className="text-purple-400"/> 3. Thumbnail Text (Optional)
          </label>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 'HOW I MADE $1M' or 'YOU WON'T BELIEVE THIS'"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500">
              Add text to overlay on your thumbnail. Leave empty for no text.
            </p>
          </div>
        </div>
        )}

        {/* Prompt & Templates */}
        <div className="border-t border-slate-700/50 pt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block">
                  {generationMode === 'clone' ? '6. Context & Details (Optional)' : '4. Describe Your Thumbnail'}
              </label>
              
              {/* Templates Dropdown */}
              {templates.length > 0 && (
                  <select 
                      onChange={(e) => {
                          const t = templates.find(temp => temp.id === e.target.value);
                          if(t) loadTemplate(t);
                      }}
                      className="bg-slate-800 border border-slate-600 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
                      defaultValue=""
                  >
                      <option value="" disabled>Load Template...</option>
                      {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                    type="text"
                    placeholder={generationMode === 'clone'
                      ? "e.g. 'Make me look shocked' or 'Add fire in background'"
                      : "e.g. 'Me looking shocked at my phone with money raining, neon city background'"
                    }
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancingPrompt || !customPrompt}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-400 hover:text-white hover:bg-purple-600 rounded-lg transition-colors"
                        title="Enhance Prompt with AI"
                    >
                        {isEnhancingPrompt ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    </button>
                  </div>

                  <button 
                      onClick={() => setShowSaveTemplate(!showSaveTemplate)}
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
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                      />
                      <button 
                          onClick={saveTemplate}
                          disabled={isSavingTemplate}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isSavingTemplate && <RefreshCw className="animate-spin" size={12}/>}
                          Save
                      </button>
                        <button 
                          onClick={() => setShowSaveTemplate(false)}
                          disabled={isSavingTemplate}
                          className="px-4 py-2 bg-transparent text-slate-400 hover:text-white text-sm font-medium transition-colors"
                      >
                          Cancel
                      </button>
                  </div>
              )}
              
              {/* Generate Button */}
              <button
              onClick={handleGenerate}
              disabled={status === GenerationStatus.GENERATING}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                  status === GenerationStatus.GENERATING
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:scale-[1.02]'
              }`}
              >
              {status === GenerationStatus.GENERATING ? (
                  <>
                  <RefreshCw className="animate-spin" /> Generating...
                  </>
              ) : (
                  <>
                  <Wand2 /> {generationMode === 'clone' ? 'Clone Thumbnail' : 'Create Thumbnail'} ({getCurrentCost()} Credits)
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

      {/* Result & History Section */}
      {selectedItem && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Main Result Viewer */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400" /> Result
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* Copy Inspiration URL */}
                {selectedItem.inspirationImage && (
                    <button
                        onClick={() => handleCopyInspiration(selectedItem.inspirationImage)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors"
                        title="Copy original inspiration image URL (Base64)"
                    >
                        {copiedInspiration ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        {copiedInspiration ? "Copied!" : "Copy Source URL"}
                    </button>
                )}

                {/* Video Generation Button */}
                {!selectedItem.videoUrl && (
                    <button
                      onClick={handleGenerateVideo}
                      disabled={videoStatus === GenerationStatus.GENERATING}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          videoStatus === GenerationStatus.GENERATING
                          ? 'bg-slate-800 text-slate-500 border-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30 hover:border-purple-500/50'
                      }`}
                    >
                      {videoStatus === GenerationStatus.GENERATING ? (
                          <RefreshCw className="animate-spin" size={18}/>
                      ) : (
                          <Video size={18} />
                      )}
                      {videoStatus === GenerationStatus.GENERATING ? 'Animating...' : `Animate (${CREDIT_COSTS.VIDEO} Cr)`}
                    </button>
                )}
                <button
                  onClick={() => handleDownload(selectedItem.imageUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-colors"
                >
                  <Download size={18} /> Save PNG
                </button>
              </div>
          </div>
          
          <div className="flex flex-col gap-6">
              {/* Image Display */}
              <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative group rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-700 bg-black flex-1">
                      <div className="w-full relative flex justify-center bg-black/50">
                          <img 
                              src={selectedItem.imageUrl} 
                              alt="Generated Thumbnail" 
                              className="max-h-[70vh] object-contain transition-all duration-300"
                              style={{ 
                                  aspectRatio: selectedItem.aspectRatio?.replace(':','/'),
                                  ...filterStyle 
                              }}
                          />
                      </div>
                  </div>

                  {/* Analysis & Metadata Side Panel */}
                  <div className="w-full md:w-80 flex flex-col gap-4">
                      {/* Tabs */}
                      <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                          <button
                            onClick={() => setActiveTab('mockup')}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                activeTab === 'mockup' 
                                ? 'bg-slate-700 text-white shadow' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                             <MonitorPlay size={14} /> Preview
                          </button>
                          <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                activeTab === 'edit' 
                                ? 'bg-slate-700 text-white shadow' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                             <Sliders size={14} /> Editor
                          </button>
                          <button
                            onClick={() => setActiveTab('audit')}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                activeTab === 'audit' 
                                ? 'bg-slate-700 text-white shadow' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                             <TrendingUp size={14} /> Audit
                          </button>
                          <button
                            onClick={() => setActiveTab('metadata')}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                activeTab === 'metadata' 
                                ? 'bg-slate-700 text-white shadow' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                             <List size={14} /> Meta
                          </button>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                          {activeTab === 'mockup' ? (
                            <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh]">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">YouTube Reality Check</h4>
                                
                                {/* Mockup Card */}
                                <div className="bg-[#0f0f0f] p-3 rounded-xl border border-slate-800">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                                        <img 
                                            src={selectedItem.imageUrl} 
                                            className="w-full h-full object-cover" 
                                            style={filterStyle}
                                            alt="Mockup"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
                                        <div className="space-y-1">
                                            <div className="h-4 bg-slate-800 w-48 rounded"></div>
                                            <div className="h-3 bg-slate-800 w-32 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Sidebar Mockup (Small) */}
                                <div className="bg-[#0f0f0f] p-3 rounded-xl border border-slate-800 flex gap-2">
                                     <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                                        <img 
                                            src={selectedItem.imageUrl} 
                                            className="w-full h-full object-cover" 
                                            style={filterStyle}
                                            alt="Mockup Small"
                                        />
                                    </div>
                                     <div className="space-y-1.5 flex-1">
                                            <div className="h-3 bg-slate-800 w-full rounded"></div>
                                            <div className="h-3 bg-slate-800 w-3/4 rounded"></div>
                                            <div className="h-2 bg-slate-800 w-1/2 rounded mt-2"></div>
                                     </div>
                                </div>
                                <p className="text-xs text-slate-500 text-center">
                                    Check text readability and contrast against dark backgrounds.
                                </p>
                            </div>
                          ) : activeTab === 'edit' ? (
                            <div className="p-5 space-y-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image Filters</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Brightness</span>
                                        <span>{currentFilters.brightness}%</span>
                                    </div>
                                    <input 
                                        type="range" min="50" max="150" 
                                        value={currentFilters.brightness} 
                                        onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Contrast</span>
                                        <span>{currentFilters.contrast}%</span>
                                    </div>
                                    <input 
                                        type="range" min="50" max="150" 
                                        value={currentFilters.contrast} 
                                        onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Saturation</span>
                                        <span>{currentFilters.saturation}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="200" 
                                        value={currentFilters.saturation} 
                                        onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setCurrentFilters(DEFAULT_FILTERS);
                                        // Update history to reset
                                        setHistory(prev => prev.map(i => i.id === selectedId ? { ...i, filters: DEFAULT_FILTERS } : i));
                                    }}
                                    className="text-xs text-slate-400 hover:text-white underline w-full text-center mt-4"
                                >
                                    Reset Filters
                                </button>
                            </div>
                          ) : activeTab === 'audit' ? (
                            !selectedItem.analysis ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                                  <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400">
                                      <TrendingUp size={32} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">AI Viral Audit</h3>
                                      <p className="text-slate-400 text-sm mt-1">Get a CTR prediction and actionable feedback.</p>
                                  </div>
                                  <button 
                                      onClick={handleAnalysis}
                                      disabled={isAnalyzing}
                                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                  >
                                      {isAnalyzing ? (
                                          <>
                                              <RefreshCw className="animate-spin" size={18} /> Analyzing...
                                          </>
                                      ) : (
                                          <>
                                              <Eye size={18} /> Audit ({CREDIT_COSTS.AUDIT} Credits)
                                          </>
                                      )}
                                  </button>
                                </div>
                            ) : (
                                <div className="p-5 overflow-y-auto max-h-[70vh]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            <TrendingUp className="text-green-400" size={20}/> Viral Score
                                        </h3>
                                        <div className={`text-2xl font-black ${
                                            selectedItem.analysis.score >= 80 ? 'text-green-400' : 
                                            selectedItem.analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            {selectedItem.analysis.score}/100
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-slate-700 h-2 rounded-full mb-4">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                selectedItem.analysis.score >= 80 ? 'bg-green-500' : 
                                                selectedItem.analysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${selectedItem.analysis.score}%` }}
                                        ></div>
                                    </div>

                                    <p className="text-sm text-slate-300 italic mb-6 border-l-2 border-slate-600 pl-3">
                                        "{selectedItem.analysis.critique}"
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <ThumbsUp size={12}/> Strengths
                                            </h4>
                                            <ul className="space-y-1">
                                                {selectedItem.analysis.strengths.map((s, i) => (
                                                    <li key={i} className="text-sm text-green-200/80 flex items-start gap-2">
                                                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500"/> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <AlertTriangle size={12}/> Needs Improvement
                                            </h4>
                                            <ul className="space-y-1">
                                                {selectedItem.analysis.improvements.map((s, i) => (
                                                    <li key={i} className="text-sm text-red-200/80 flex items-start gap-2">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"/> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                          ) : (
                            // Metadata Tab Content
                             !selectedItem.metadata ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                                  <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
                                      <FileText size={32} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">YouTube Metadata</h3>
                                      <p className="text-slate-400 text-sm mt-1">Generate SEO titles, description, and tags.</p>
                                  </div>
                                  <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    placeholder="Optional: Add context (e.g. 'Video about growing on Instagram')"
                                    rows={3}
                                    value={metadataContext}
                                    onChange={(e) => setMetadataContext(e.target.value)}
                                  />
                                  <button 
                                      onClick={handleMetadataGeneration}
                                      disabled={isGeneratingMetadata}
                                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                  >
                                      {isGeneratingMetadata ? (
                                          <>
                                              <RefreshCw className="animate-spin" size={18} /> Generating...
                                          </>
                                      ) : (
                                          <>
                                              <Wand2 size={18} /> Generate ({CREDIT_COSTS.METADATA} Credits)
                                          </>
                                      )}
                                  </button>
                                </div>
                             ) : (
                                <div className="p-5 overflow-y-auto max-h-[70vh] space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Type size={12}/> Viral Titles
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedItem.metadata.titles.map((title, i) => (
                                                <li key={i} className="text-sm bg-slate-900 p-2 rounded border border-slate-700 text-white hover:border-purple-500 cursor-pointer transition-colors"
                                                    onClick={() => navigator.clipboard.writeText(title)}
                                                    title="Click to copy"
                                                >
                                                    {title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <FileText size={12}/> Description
                                        </h4>
                                        <div className="bg-slate-900 p-3 rounded border border-slate-700 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                                            {selectedItem.metadata.description}
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(selectedItem.metadata!.description)}
                                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            <Copy size={12}/> Copy Description
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Hash size={12}/> Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedItem.metadata.tags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                         <button 
                                            onClick={() => navigator.clipboard.writeText(selectedItem.metadata!.tags.join(','))}
                                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            <Copy size={12}/> Copy Tags
                                        </button>
                                    </div>
                                </div>
                             )
                          )}
                      </div>
                  </div>
              </div>

              {/* Video Display (if exists) */}
              {selectedItem.videoUrl && (
                  <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-purple-500/30 bg-black">
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-200 text-xs font-bold uppercase flex items-center gap-2 backdrop-blur-md">
                          <Video size={12} /> Veo Video
                        </div>
                      <video 
                          src={selectedItem.videoUrl} 
                          controls 
                          autoPlay 
                          loop 
                          className="w-full max-h-[70vh]"
                      />
                      <div className="absolute bottom-4 right-4 z-10">
                          <button
                              onClick={() => handleDownload(selectedItem.videoUrl!, true)}
                              className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded border border-white/20 backdrop-blur-md flex items-center gap-1 transition-colors"
                          >
                              <Download size={12} /> Save MP4
                          </button>
                      </div>
                  </div>
              )}
          </div>

          {/* History Strip */}
          {history.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Clock size={16} />
                <span className="text-sm font-semibold uppercase tracking-wider">History</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                        setSelectedId(item.id);
                        setVideoStatus(GenerationStatus.IDLE); // Reset video status when switching
                    }}
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
                      style={{
                          filter: item.filters ? `brightness(${item.filters.brightness}%) contrast(${item.filters.contrast}%) saturate(${item.filters.saturation}%)` : undefined
                      }}
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
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item.imageUrl);
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
          )}
        </div>
      )}
    </div>
  );
};

export default ThumbnailGenerator;
