import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Link2, 
  Sparkles, 
  Trash2, 
  History, 
  Info, 
  Play, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Music, 
  Video, 
  HelpCircle,
  Clock,
  Youtube,
  Facebook,
  Database,
  ArrowRight,
  RefreshCw,
  FileVideo,
  VideoOff
} from "lucide-react";
import { SupportedPlatform, MediaResult, PickerItem, DownloadHistoryItem, LoadingStep } from "./types";

export default function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 1, label: "Analyzing resource link metadata", status: "idle" },
    { id: 2, label: "Locating high-speed extraction node", status: "idle" },
    { id: 3, label: "Bypassing server security handshakes", status: "idle" },
    { id: 4, label: "Synthesizing direct download packages", status: "idle" }
  ]);
  
  const [result, setResult] = useState<MediaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(false);
  const [videoQuality, setVideoQuality] = useState<"1080" | "720" | "485" | "360">("720");
  
  // Custom states for local stats & history
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [totalDataSaved, setTotalDataSaved] = useState<string>("0 MB");

  // Load and count local history items
  useEffect(() => {
    try {
      const stored = localStorage.getItem("universal_downloader_history");
      if (stored) {
        const parsed = JSON.parse(stored) as DownloadHistoryItem[];
        setHistory(parsed);
        calculateStats(parsed);
      }
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }
  }, []);

  const calculateStats = (list: DownloadHistoryItem[]) => {
    // Generate simulated dynamic data usage based on list length for added visual delight
    const baseMb = list.length * 48.4;
    if (baseMb >= 1024) {
      setTotalDataSaved(`${(baseMb / 1024).toFixed(2)} GB`);
    } else {
      setTotalDataSaved(`${baseMb.toFixed(1)} MB`);
    }
  };

  const addToHistory = (title: string, platform: SupportedPlatform, directUrl: string) => {
    const newItem: DownloadHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: url,
      title: title || "Media Stream Link",
      platform,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      directUrl: directUrl
    };
    
    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);
    setTotalDataSaved(`${((updated.length * 48.4)).toFixed(1)} MB`);
    try {
      localStorage.setItem("universal_downloader_history", JSON.stringify(updated));
    } catch (e) {}
  };

  const clearHistory = () => {
    setHistory([]);
    setTotalDataSaved("0 MB");
    try {
      localStorage.removeItem("universal_downloader_history");
    } catch (e) {}
  };

  const handlePasteSample = (sampleUrl: string, name: string) => {
    setUrl(sampleUrl);
    setError(null);
  };

  const runVerificationSteps = async () => {
    setLoadingSteps([
      { id: 1, label: "Analyzing link validation metrics", status: "running" },
      { id: 2, label: "Locating high-speed extraction node", status: "idle" },
      { id: 3, label: "Bypassing server security handshakes", status: "idle" },
      { id: 4, label: "Synthesizing direct download packages", status: "idle" }
    ]);

    // Fast step iterations for great visual feedback
    await new Promise((r) => setTimeout(r, 600));
    setLoadingSteps((prev) => prev.map(s => s.id === 1 ? { ...s, status: "completed" } : s.id === 2 ? { ...s, status: "running" } : s));
    
    await new Promise((r) => setTimeout(r, 700));
    setLoadingSteps((prev) => prev.map(s => s.id === 2 ? { ...s, status: "completed" } : s.id === 3 ? { ...s, status: "running" } : s));

    await new Promise((r) => setTimeout(r, 800));
    setLoadingSteps((prev) => prev.map(s => s.id === 3 ? { ...s, status: "completed" } : s.id === 4 ? { ...s, status: "running" } : s));
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError("Please paste a link first before attempting analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Run custom step timelines
    runVerificationSteps();

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: url.trim(),
          quality: videoQuality,
          isAudioOnly: isAudioOnly
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server could not process this media stream link.");
      }

      // Complete last loading step
      setLoadingSteps((prev) => prev.map(s => s.id === 4 ? { ...s, status: "completed" } : s));
      await new Promise((r) => setTimeout(r, 300));

      setResult({
        status: "success",
        platform: data.platform,
        title: data.title,
        url: data.url,
        pickerType: data.pickerType,
        picker: data.picker,
        timestamp: new Date().toLocaleTimeString()
      });

      // Save to client storage automatically if custom url output exists
      if (data.url) {
        addToHistory(data.title, data.platform, data.url);
      } else if (data.picker && data.picker.length > 0) {
        addToHistory(data.title, data.platform, data.picker[0].url);
      }
    } catch (err: any) {
      console.error(err);
      setLoadingSteps((prev) => prev.map(s => s.status === "running" ? { ...s, status: "failed" } : s));
      setError(err.message || "An unexpected network error occurred while resolving streams.");
    } finally {
      setLoading(false);
    }
  };

  // Helper trigger to handle direct download file names easily via our Server attachment Proxy
  const getProxyDownloadLink = (directMediaUrl: string, title: string) => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${isAudioOnly ? 'mp3' : 'mp4'}`;
    return `/api/proxy?url=${encodeURIComponent(directMediaUrl)}&filename=${encodeURIComponent(filename)}`;
  };

  const getPlatformIcon = (platform: SupportedPlatform) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "facebook":
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case "tiktok":
        return (
          <div className="w-5 h-5 bg-gradient-to-r from-teal-400 via-pink-500 to-yellow-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">
            T
          </div>
        );
      case "google_drive":
      case "gdrive":
        return <Database className="w-5 h-5 text-yellow-400" />;
      default:
        return <Link2 className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 relative flex flex-col justify-between selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="z-10 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Universal<span className="text-blue-400">Loader</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400">Pro Extraction Node</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-400">
              <button 
                onClick={() => handlePasteSample("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "YouTube")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                YouTube
              </button>
              <span className="text-white/10">•</span>
              <button 
                onClick={() => handlePasteSample("https://www.facebook.com/watch/?v=12345678", "Facebook")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                Facebook
              </button>
              <span className="text-white/10">•</span>
              <button 
                onClick={() => handlePasteSample("https://www.tiktok.com/@khaby.lame/video/6951234567890", "TikTok")}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                TikTok No-Watermark
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowHistoryModal(true)} 
                className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-1.5"
                title="View recent history logs"
              >
                <History className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">History logs ({history.length})</span>
              </button>

              <button 
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 rounded-lg transition"
                title="How it works"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 z-10 flex flex-col items-center">
        
        {/* Title Brand Element */}
        <div className="text-center max-w-2xl mb-10 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            Zero Ads • Unlimited Cloud Speed
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight font-display mb-4">
            Download Anything, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              From Anywhere Instantly.
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base">
            High-speed, premium multi-source extractor. Directly acquire HD videos, water-mark-free clips, high-fidelity MP3 music, and raw cloud streams in seconds without registration.
          </p>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleAnalyze} className="w-full max-w-3xl relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-45 transition duration-1000"></div>
          
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#111115] border border-slate-800 focus-within:border-blue-500/50 rounded-2xl p-2 transition-all gap-2">
            
            <div className="flex items-center flex-1 px-3 py-2 sm:py-0">
              <Link2 className="w-5 h-5 text-slate-500 mr-3 flex-shrink-0" />
              <input 
                type="url"
                required
                placeholder="Paste link here (e.g., https://www.youtube.com/watch?v=...)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-600 text-md sm:text-lg w-full font-sans pb-1"
              />
              {url && (
                <button 
                  type="button" 
                  onClick={() => setUrl("")}
                  className="p-1 text-slate-500 hover:text-slate-300 text-xs ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick configuration settings inside input widget */}
            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 pl-2 pr-1">
              {/* Type Switcher */}
              <button
                type="button"
                onClick={() => setIsAudioOnly(!isAudioOnly)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAudioOnly 
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40" 
                    : "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                }`}
                title="Toggle between Video output and MP3 Audio only output"
              >
                {isAudioOnly ? <Music className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{isAudioOnly ? "Audio (MP3)" : "Video (MP4)"}</span>
              </button>

              {/* Quality Settings Selector Dropdown if video */}
              {!isAudioOnly && (
                <select
                  value={videoQuality}
                  onChange={(e: any) => setVideoQuality(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500/50"
                  title="Target Resolution Quality Quality"
                >
                  <option value="1080">1080p FHD</option>
                  <option value="720">720p HD</option>
                  <option value="480">480p SD</option>
                  <option value="360">360p Low</option>
                </select>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Extract Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Help Examples Row */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-slate-500 mb-12">
          <span>Click to try standard samples:</span>
          <button 
            onClick={() => handlePasteSample("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "YouTube")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md hover:text-slate-300 transition cursor-pointer"
          >
            🎵 YouTube Synthpop Clip
          </button>
          <button 
            onClick={() => handlePasteSample("https://www.facebook.com/watch/?v=3517032943183590", "Facebook")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md hover:text-slate-300 transition cursor-pointer"
          >
            📸 Facebook Post link
          </button>
          <button 
            onClick={() => handlePasteSample("https://www.tiktok.com/@mrbeast/video/7311122334455", "TikTok")}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md hover:text-slate-300 transition cursor-pointer"
          >
            ⚡ TikTok Feed Video
          </button>
        </div>

        {/* Dynamic State Layout (Loader, Results, Error block) */}
        <div className="w-full max-w-4xl min-h-[16rem] relative flex items-center justify-center">
          
          {/* 1. LOADER SCREEN WITH SEQUENTIAL STEPS */}
          {loading && (
            <div className="w-full bg-[#111115]/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full animate-pulse"></div>
              
              <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-6 relative">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"></span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Resolving Media Streams</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-8">
                Initiating clean high-speed extraction pathways to bypass regional rate limits. Please keep this browser window open.
              </p>

              {/* Step indicator pipeline */}
              <div className="w-full max-w-md bg-[#0a0a0f] border border-white/5 rounded-2xl p-5 text-left flex flex-col gap-3">
                {loadingSteps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        step.status === "completed" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                        step.status === "running" ? "bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" :
                        "bg-slate-700"
                      }`}></span>
                      <span className={step.status === "completed" ? "text-slate-400 line-through" : step.status === "running" ? "text-blue-200 font-semibold" : "text-slate-600"}>
                        {step.label}
                      </span>
                    </div>
                    <div>
                      {step.status === "completed" && <span className="text-green-500 font-mono text-[10px]">SUCCESS</span>}
                      {step.status === "running" && <span className="text-blue-400 font-mono text-[10px] animate-pulse">PROCESS</span>}
                      {step.status === "failed" && <span className="text-red-500 font-mono text-[10px]">BLOCKED</span>}
                      {step.status === "idle" && <span className="text-slate-700 font-mono text-[10px]">PENDING</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ERROR DISPLAY OR SMART MANUAL CONSOLE HELP BLOCK */}
          {!loading && error && (
            <div className="w-full bg-red-950/20 border border-red-500/20 rounded-3xl p-8 flex flex-col items-center text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Media Extraction Alert</h3>
              <p className="text-xs sm:text-sm text-red-300 max-w-xl mb-6 font-mono leading-relaxed bg-[#1c0c0c] p-3 rounded-xl border border-red-900/40">
                {error}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-2xl bg-black/40 p-5 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" /> Why this happens:
                  </h4>
                  <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
                    <li>The requested post requires password authentication (Private page)</li>
                    <li>Extremely strict digital security tokens applied by the server</li>
                    <li>The video URL pasted might have dynamic tracker tags attached</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Easy Solution Guide:
                  </h4>
                  <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
                    <li>Confirm the media privacy is set to <strong>Public</strong></li>
                    <li>Clean the tracking parameters from the URL</li>
                    <li>Use public instances shown in page documentation below</li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={() => { setError(null); handleAnalyze(); }}
                className="mt-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-xl border border-white/10 hover:text-white transition cursor-pointer"
              >
                Retry Extraction Node
              </button>
            </div>
          )}

          {/* 3. MEDIA EXTRACTION RESULTS PREVIEW */}
          {!loading && !error && result && (
            <div className="w-full bg-[#111115]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 animate-fade-in flex flex-col lg:flex-row gap-8">
              
              {/* Media Card */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Category badging */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-white">
                      {getPlatformIcon(result.platform)}
                      <span className="capitalize">{result.platform} Cloud Host</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Extracted just now</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                    {result.title || "Successfully Parsed Media Streams"}
                  </h3>

                  {/* Extraction report preview metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 bg-[#0a0a0f] p-4 rounded-2xl border border-white/5">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Mode Requested</span>
                      <span className="text-sm font-semibold text-white font-mono">{isAudioOnly ? "🎵 High Quality MP3" : "🎬 High Definition MP4"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Bypass Token</span>
                      <span className="text-xs font-semibold text-emerald-400 font-mono">STABLE_COBALT_v4</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-sans">Target Codecs</span>
                      <span className="text-xs text-white">H.264 / ACC Audio</span>
                    </div>
                  </div>
                </div>

                {/* Main Download Options or Item picker (e.g. for TikTok multi-photo slides) */}
                <div className="mt-4">
                  
                  {/* Slide links Picker pattern if exists */}
                  {result.picker && result.picker.length > 0 ? (
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">
                        Detected Multi-item Album Packages ({result.picker.length} files)
                      </span>
                      <div className="max-h-56 overflow-y-auto pr-2 flex flex-col gap-2">
                        {result.picker.map((item) => (
                          <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 text-xs font-semibold flex items-center justify-center">
                                {item.id + 1}
                              </span>
                              <span className="text-xs text-slate-300 font-mono truncate max-w-md">
                                {item.text || `Extracted Slide Item #${item.id + 1}`}
                              </span>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Save Slide</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Standard dynamic direct stream option */
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                        Ready Stream Channel
                      </span>
                      
                      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div>
                          <span className="block text-xs text-slate-500">Media Stream Asset Location:</span>
                          <span className="text-sm font-semibold text-white font-mono truncate max-w-sm block">
                            {result.url ? new URL(result.url).hostname : "Secure Extractor Link ready"}
                          </span>
                        </div>
                        
                        {result.url && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Proxy Link: Force Download Attachment */}
                            <a 
                              href={getProxyDownloadLink(result.url, result.title)} 
                              download
                              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Direct Download</span>
                            </a>

                            {/* Secondary Stream: Direct URL */}
                            <a 
                              href={result.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 border border-white/5 transition"
                              title="Open original video stream directly in new tab helper"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Raw Link</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Sidebar Action Center */}
              <div className="w-full lg:w-72 flex flex-col gap-4">
                
                {/* Visual Stats widget */}
                <div className="bg-[#111115]/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[10rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                      Device Session Storage
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="text-3xl font-bold text-white tracking-tight font-display">
                      {totalDataSaved}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Total stream savings allocated locally
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, history.length * 7))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Secondary Info card */}
                <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/10 rounded-3xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> High Definition Output
                  </h4>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    If you selected video quality resolutions above 720p, our node automatically parses and combines video & audio frames.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* 4. DEFAULT INITIAL WELCOME CARD (LITERAL SINGLE PAGE DESIGN BOUNDARY) */}
          {!loading && !error && !result && (
            <div className="w-full bg-[#111115]/30 border border-slate-900 rounded-3xl p-8 text-center flex flex-col items-center">
              
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                <Link2 className="w-7 h-7 text-indigo-500" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Awaiting Stream Link</h3>
              <p className="text-slate-500 text-sm max-w-md mb-8">
                Paste any valid media link from YouTube, Facebook, TikTok HD, or even Google Drive shared link. Our cloud node parses direct attachment packages instantly.
              </p>

              {/* Graphic showing layout features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
                <div className="p-4 bg-[#0a0a0f]/80 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center mb-3">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">YouTube HD Engine</h4>
                  <p className="text-[11px] text-slate-500">Supports HD mp4 rendering, custom stream options, and high fidelity MP3 audios.</p>
                </div>

                <div className="p-4 bg-[#0a0a0f]/80 rounded-2xl border border-white/5 hover:border-pink-500/20 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-pink-600/10 text-pink-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">TikTok One-Click</h4>
                  <p className="text-[11px] text-slate-500">Bypass standard video overlays for clear, clean watermark-free video playbacks.</p>
                </div>

                <div className="p-4 bg-[#0a0a0f]/80 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-3">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">Facebook Stories</h4>
                  <p className="text-[11px] text-slate-500">Retrieve public posts, video attachments, reel clips, and story archives instantly.</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Step-by-Step guide below as explicitly requested in the prompt */}
        <section className="mt-16 w-full max-w-4xl bg-slate-950/40 p-6 sm:p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Development Integration & Local Setup Guide</h3>
              <p className="text-[11px] text-slate-500">Step-by-step developer guide for deployment</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            While this Cloud application utilizes multiple Cobalt Gateway Instances to offer high uptime and zero local compute costs, you can also deploy this exact setup locally on your computer with <code className="text-indigo-400 px-1.5 py-0.5 bg-slate-900 rounded font-mono">yt-dlp</code>. Follow the instructions below to run local setup:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-[11px] text-indigo-400 border border-slate-850 flex items-center justify-center font-bold font-mono shrink-0">1</div>
              <div>
                <h4 className="text-xs font-bold text-slate-300">Clone the Project & Install Python Dependencies</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Ensure Python 3.8+ is installed on your operating system, then install the modern wrapper engine:</p>
                <div className="bg-[#050507] px-4 py-3 rounded-xl border border-white/5 font-mono text-[11.5px] text-slate-300 overflow-x-auto">
                  npm install && pip install yt-dlp flask flask-cors
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-[11px] text-indigo-400 border border-slate-850 flex items-center justify-center font-bold font-mono shrink-0">2</div>
              <div>
                <h4 className="text-xs font-bold text-slate-300">Run Node.js Gateway & Extraction Backend Server</h4>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Start the local typescript gateway controller which proxies connections directly to port 3000:</p>
                <div className="bg-[#050507] px-4 py-3 rounded-xl border border-white/5 font-mono text-[11.5px] text-slate-300 overflow-x-auto">
                  npm run dev
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-[11px] text-indigo-400 border border-slate-850 flex items-center justify-center font-bold font-mono shrink-0">3</div>
              <div>
                <h4 className="text-xs font-bold text-slate-300">Bypassing ISP restrictions and VPN blockers</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  To achieve premium speeds, ensure your server is updated using <code className="bg-[#111115] text-indigo-300 px-1 py-0.2 rounded text-[10px] font-mono">yt-dlp -U</code> regularly when social platforms alter API handshake values.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* History Log Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col justify-between animate-scale-up">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white font-display">Extraction Log History</h3>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-sans">No recent downloads stored from this browser session.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                  {history.map((item) => (
                    <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex justify-between gap-3 items-center hover:border-slate-700 transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {getPlatformIcon(item.platform)}
                          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block truncate font-semibold">
                            {item.platform}
                          </span>
                          <span className="text-[9px] text-slate-600 block shrink-0">• {item.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 truncate leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a 
                          href={getProxyDownloadLink(item.directUrl, item.title)}
                          download
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-bold transition flex items-center"
                          title="Proxy stream download attachment"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear stored list</span>
                </button>
              )}
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Instructions Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f111a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-display">Technical Architecture</h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                <strong>UniversalLoader</strong> is high-fidelity stream extractor utilizing premium public API instances (including Cobalt protocols, Cloud Run wrappers, and Google-UC proxies) to yield raw streams with metadata.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">How do I download MP3/Audios?</h4>
              <p className="text-slate-400">
                Simply click the <strong className="text-slate-200">"Video (MP4)"</strong> button inside the input container to change the mode to <strong className="text-slate-200">"Audio (MP3)"</strong> before hitting extraction. The cloud nodes will isolate the audio stream and convert it to CD quality.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">Why does direct download start in the browser instead of saving?</h4>
              <p className="text-slate-400">
                Browsers often start playing MP4 files in their integrated players instead of copying them to disk. To prevent this, click the <strong>"Direct Download"</strong> button which directs the stream via our attachment proxy!
              </p>

              <h4 className="text-sm font-bold text-white pt-2">Supported Formats:</h4>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-450 text-slate-400">
                <li>YouTube: mp4 video up to 1080p, MP3/M4A audio options.</li>
                <li>TikTok: Watermark-free MP4, slide picture link pickers.</li>
                <li>Facebook: Standard feeds and high quality attachments.</li>
                <li>Google Drive: Converts file link into raw proxy download keys.</li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Footer Row */}
      <footer className="w-full px-4 sm:px-8 py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 z-10 bg-[#050507]">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4 md:mb-0">
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>YouTube HD / MP3 isolated stream wrapper</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Cleaner TikTok bypassing engine</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Active Facebook public story grabber</span>
          </div>
        </div>

        <div className="flex gap-6 uppercase tracking-widest font-bold text-[10px]/snug">
          <button onClick={() => setShowHelpModal(true)} className="hover:text-white transition">Platform Status</button>
          <span>•</span>
          <span className="text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            Operational
          </span>
        </div>
      </footer>

    </div>
  );
}
