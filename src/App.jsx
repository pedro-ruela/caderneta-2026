import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Upload, Share2, CheckCircle2, XCircle, Copy, RefreshCw, Trophy, Users, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStickerData, TEAM_NAMES } from './services/dataService';
import Papa from 'papaparse';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const App = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('match'); // Default to Match/Trade
  const [pricePerPack, setPricePerPack] = useState(1.20);
  const [stickersPerPack, setStickersPerPack] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Visitor Data (Key: "TEAM-NO", Value: { team, number, owned, duplicated })
  const [visitorStickers, setVisitorStickers] = useState({});
  const [pastedData, setPastedData] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchStickerData();
      setStickers(data);
    } catch (error) {
      console.error('Failed to load stickers:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = stickers.length;
    if (total === 0) return { total: 0, owned: 0, missing: 0, duplicated: 0, perc: 0 };
    
    const owned = Object.keys(visitorStickers).length;
    const missing = total - owned;
    const duplicatedCount = Object.values(visitorStickers).reduce((acc, s) => acc + s.duplicated, 0);
    const perc = ((owned / total) * 100).toFixed(1);
    
    return { total, owned, missing, duplicated: duplicatedCount, perc };
  }, [stickers, visitorStickers]);

  const filteredStickers = useMemo(() => {
    return stickers.filter(s => {
      const visitorData = visitorStickers[`${s.team}-${s.number}`];
      const isOwned = !!visitorData;
      const hasDups = visitorData?.duplicated > 0;

      const matchesSearch = s.number.includes(searchQuery) || s.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'owned' && isOwned) || 
        (filterStatus === 'missing' && !isOwned) || 
        (filterStatus === 'duplicated' && hasDups);
      
      return matchesSearch && matchesStatus;
    });
  }, [stickers, searchQuery, filterStatus, visitorStickers]);

  const parseTextToStickers = (text) => {
    const regex = /([A-Z]{3})\s*(\d+)/gi;
    let match;
    const result = {};
    
    while ((match = regex.exec(text)) !== null) {
      const team = match[1].toUpperCase();
      const number = match[2];
      const id = `${team}-${number}`;
      
      if (result[id]) {
        result[id].duplicated += 1;
      } else {
        result[id] = { team, number, owned: true, duplicated: 0 };
      }
    }
    return result;
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    setPastedData(text);
    const parsed = parseTextToStickers(text);
    setVisitorStickers(parsed);
  };

  const toggleVisitorSticker = (team, number) => {
    const id = `${team}-${number}`;
    setVisitorStickers(prev => {
      const next = { ...prev };
      if (next[id]) {
        if (next[id].duplicated > 0) {
          next[id].duplicated -= 1;
        } else {
          delete next[id];
        }
      } else {
        next[id] = { team, number, owned: true, duplicated: 0 };
      }
      return next;
    });
    
    // Update pasted data text area to reflect changes (optional, but good for sync)
    // For now we just keep them separate or rebuild from state
  };

  const tradeMatches = useMemo(() => {
    const visitorList = Object.values(visitorStickers);
    if (visitorList.length === 0) return { iHaveYouNeed: [], youHaveINeed: [] };
    
    const youHaveINeed = visitorList.filter(v => {
      const ownerSticker = stickers.find(s => s.team === v.team && s.number === v.number);
      return ownerSticker && !ownerSticker.owned;
    });

    const iHaveYouNeed = stickers.filter(s => {
      const isDuplicated = s.duplicated > 0;
      const visitorHasIt = visitorStickers[`${s.team}-${s.number}`];
      return isDuplicated && !visitorHasIt;
    });

    return { iHaveYouNeed, youHaveINeed };
  }, [stickers, visitorStickers]);

  const downloadTemplate = () => {
    // Requirements: Team, Number, Owned (True/False), Duplicated Qty
    const data = stickers.map(s => {
      const visitorData = visitorStickers[`${s.team}-${s.number}`];
      return {
        'Team': s.team,
        'Number': s.number,
        'Owned': visitorData ? 'TRUE' : 'FALSE',
        'Duplicated Qty': visitorData ? visitorData.duplicated : 0
      };
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'world_cup_2026_tracker_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMessage('Template downloaded! Fill it and upload back.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTradeMessage = () => {
    const iHave = tradeMatches.iHaveYouNeed.map(s => `${s.team} ${s.number}`).join(', ');
    const youHave = tradeMatches.youHaveINeed.map(s => `${s.team} ${s.number}`).join(', ');
    
    return `Olá! Vi no teu tracker que temos cromos para trocar. 🤝\n\nEu tenho para ti: ${iHave || 'Nenhum neste momento'}\nTu tens para mim: ${youHave || 'Nenhum neste momento'}\n\nVamos falar?`;
  };

  const copyTradeSummary = () => {
    const message = getTradeMessage();
    navigator.clipboard.writeText(message);
    setToastMessage('Trade summary copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const shareApp = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('Link copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">WC 2026 Tracker</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Community Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-2xl font-black text-primary">{stats.perc}%</span>
              <div className="w-32 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.perc}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            <button 
              onClick={shareApp}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative group"
            >
              <Share2 className="w-5 h-5" />
              <span className="absolute -bottom-8 right-0 text-[10px] bg-card px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Share Tracker</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Stickers', value: stats.total, icon: LayoutGrid, color: 'text-blue-400' },
            { label: 'Owned', value: stats.owned, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Missing', value: stats.missing, icon: XCircle, color: 'text-red-400' },
            { label: 'Duplicated', value: stats.duplicated, icon: Copy, color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-4 rounded-2xl flex items-center gap-4 card-hover border border-white/5"
            >
              <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Tabs */}
        <div className="flex p-1 bg-secondary rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('match')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'match' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Trade & Compare
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'inventory' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Collection Progress
          </button>
          <button 
            onClick={() => setActiveTab('duplicates')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'duplicates' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Copy className="w-4 h-4" />
            Available Duplicates
          </button>
          <button 
            onClick={() => setActiveTab('investment')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'investment' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Trophy className="w-4 h-4" />
            Investimento
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'match' ? (
            <motion.div
              key="match"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Visitor Input */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-6 rounded-2xl space-y-6 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Your Collection
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tell us what you have to find matches.
                      </p>
                    </div>
                    <button 
                      onClick={downloadTemplate}
                      className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD TEMPLATE
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option 1: Manual Paste</label>
                      <textarea 
                        placeholder="Type or paste (e.g. ARG 1, ARG 2, BRA 10...)"
                        value={pastedData}
                        onChange={handlePaste}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl p-4 h-40 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground italic">
                        Tip: Typing "ARG 1" twice counts as a duplicate.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option 2: Interactive Grid</label>
                      <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 h-40 overflow-y-auto scrollbar-hide">
                        <div className="space-y-4">
                          {Object.entries(stickers.reduce((acc, s) => {
                            if (!acc[s.team]) acc[s.team] = [];
                            acc[s.team].push(s);
                            return acc;
                          }, {})).map(([team, teamStickers]) => (
                            <div key={team} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-primary/70 tracking-widest">{team}</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {teamStickers.map(s => {
                                  const isSelected = visitorStickers[`${s.team}-${s.number}`];
                                  return (
                                    <button
                                      key={`grid-${s.id}`}
                                      onClick={() => toggleVisitorSticker(s.team, s.number)}
                                      className={cn(
                                        "w-7 h-9 rounded-md text-[9px] font-black flex items-center justify-center transition-all relative",
                                        isSelected 
                                          ? "bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/20" 
                                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                      )}
                                    >
                                      {s.number}
                                      {isSelected?.duplicated > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-white text-primary text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                                          {isSelected.duplicated}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <label className="w-full bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10 mt-2">
                        <Upload className="w-4 h-4" />
                        Option 3: Upload CSV
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            Papa.parse(file, {
                              header: true,
                              complete: (results) => {
                                const parsed = {};
                                results.data.forEach(r => {
                                  const team = (r.Team || r.SEL)?.toUpperCase();
                                  const number = (r.Number || r.NO);
                                  const owned = r.Owned?.toLowerCase() === 'true';
                                  const dups = parseInt(r['Duplicated Qty'] || r.Duplicate) || 0;
                                  
                                  if (team && number && owned) {
                                    parsed[`${team}-${number}`] = { team, number, owned: true, duplicated: dups };
                                  }
                                });
                                setVisitorStickers(parsed);
                                setToastMessage('Collection uploaded successfully!');
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                              }
                            });
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Match Results */}
                <div className="glass p-6 rounded-2xl space-y-6 border border-white/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      Comparison Engine
                    </h3>
                    <button 
                      onClick={copyTradeSummary}
                      disabled={Object.keys(visitorStickers).length === 0}
                      className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Trade Message
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        I HAVE WHAT YOU NEED ({tradeMatches.iHaveYouNeed.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tradeMatches.iHaveYouNeed.length > 0 ? (
                          tradeMatches.iHaveYouNeed.map(s => (
                            <span key={s.id} className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary">
                              {s.team} {s.number}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Add your collection to find matches.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        YOU HAVE WHAT I NEED ({tradeMatches.youHaveINeed.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tradeMatches.youHaveINeed.length > 0 ? (
                          tradeMatches.youHaveINeed.map(v => (
                            <span key={`${v.team}-${v.number}`} className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] font-bold text-green-400">
                              {v.team} {v.number}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No overlaps found yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact & Info */}
              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 shadow-xl shadow-primary/5">
                  <h3 className="text-lg font-bold mb-2">Let's Swap! 🤝</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Found some matches? Contact me via LinkedIn or Email and let's complete our albums together!
                  </p>
                  
                  <div className="space-y-3">
                    <a 
                      href="https://www.linkedin.com/in/fghenriques/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                    >
                      <Share2 className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                    <a 
                      href={`mailto:fghenriques99@outlook.com?subject=Troca de Cromos - Mundial 2026&body=${encodeURIComponent(getTradeMessage())}`}
                      className="w-full bg-secondary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      Direct Email
                    </a>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                      <p className="text-xs font-medium text-primary">fghenriques99@outlook.com</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                      <p className="text-sm font-bold">Lisbon, Portugal 🇵🇹</p>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Simple Workflow
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { step: 1, text: "Enter your owned stickers via paste, grid, or CSV." },
                      { step: 2, text: "Compare mutual needs in the engine results." },
                      { step: 3, text: "Copy the pre-filled message and reach out!" },
                    ].map(item => (
                      <li key={item.step} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold">{item.step}</span>
                        <p className="text-xs text-muted-foreground leading-snug">{item.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search team or number..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none text-sm font-medium"
                >
                  <option value="all">All Stickers</option>
                  <option value="owned">Owned</option>
                  <option value="missing">Missing</option>
                  <option value="duplicated">Duplicated</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredStickers.map((s) => {
                    const visitorData = visitorStickers[`${s.team}-${s.number}`];
                    const isOwned = !!visitorData;
                    const dups = visitorData?.duplicated || 0;

                    return (
                      <div 
                        key={s.id}
                        className={cn(
                          "aspect-[3/4] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden",
                          isOwned 
                            ? "bg-green-500/10 border-green-500/30 text-green-400" 
                            : "bg-secondary/50 border-white/5 text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px] font-black tracking-tighter opacity-70">{s.team}</span>
                        <span className="text-lg font-black leading-none">{s.number}</span>
                        {dups > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                            +{dups}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search team or number..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none text-sm font-medium"
                >
                  <option value="all">All Stickers</option>
                  <option value="owned">Owned</option>
                  <option value="missing">Missing</option>
                  <option value="duplicated">Duplicated</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredStickers.map((s) => {
                    const visitorData = visitorStickers[`${s.team}-${s.number}`];
                    const isOwned = !!visitorData;
                    const dups = visitorData?.duplicated || 0;

                    return (
                      <div 
                        key={s.id}
                        className={cn(
                          "aspect-[3/4] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden",
                          isOwned 
                            ? "bg-green-500/10 border-green-500/30 text-green-400" 
                            : "bg-secondary/50 border-white/5 text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px] font-black tracking-tighter opacity-70">{s.team}</span>
                        <span className="text-lg font-black leading-none">{s.number}</span>
                        {dups > 0 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                            +{dups}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'duplicates' ? (
            <motion.div
              key="duplicates"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-6">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Copy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2">Available for Trade</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    These are the stickers I have more than one of. If you see something you need, reach out!
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                  {Object.values(visitorStickers).filter(v => v.duplicated > 0).map(v => (
                    <div key={`dup-${v.team}-${v.number}`} className="px-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl flex flex-col items-center gap-1 min-w-[80px]">
                      <span className="text-[10px] font-black text-muted-foreground">{v.team}</span>
                      <span className="text-xl font-black text-primary">{v.number}</span>
                      <span className="text-[9px] font-bold bg-primary/10 px-2 py-0.5 rounded-full text-primary">+{v.duplicated}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="investment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configuração</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold block mb-2">Preço por Saqueta (€)</label>
                      <input 
                        type="number" 
                        step="0.05"
                        value={pricePerPack}
                        onChange={(e) => setPricePerPack(parseFloat(e.target.value) || 0)}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-2">Stickers por Saqueta</label>
                      <input 
                        type="number" 
                        value={stickersPerPack}
                        onChange={(e) => setStickersPerPack(parseInt(e.target.value) || 1)}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { 
                      label: 'Total Gasto (Est.)', 
                      value: `${((stats.owned + stats.duplicated) / stickersPerPack * pricePerPack).toFixed(2)}€`, 
                      desc: 'Com base nos stickers que tens',
                      color: 'text-primary' 
                    },
                    { 
                      label: 'Saquetas Compradas', 
                      value: Math.ceil((stats.owned + stats.duplicated) / stickersPerPack), 
                      desc: 'Estimativa total',
                      color: 'text-blue-400' 
                    },
                    { 
                      label: 'Saquetas em Falta', 
                      value: Math.ceil(stats.missing / stickersPerPack), 
                      desc: 'Melhor cenário (sem duplas)',
                      color: 'text-orange-400' 
                    },
                    { 
                      label: 'Custo p/ Completar', 
                      value: `${(Math.ceil(stats.missing / stickersPerPack) * pricePerPack).toFixed(2)}€`, 
                      desc: 'Investimento mínimo necessário',
                      color: 'text-green-400' 
                    },
                  ].map(item => (
                    <div key={item.label} className="glass p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className={cn("text-3xl font-black", item.color)}>{item.value}</p>
                      <p className="text-[10px] text-muted-foreground italic">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/5">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Análise de Eficiência
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Taxa de Duplicados</p>
                    <div className="text-3xl font-black text-primary">
                      {((stats.duplicated / (stats.owned + stats.duplicated || 1)) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Dos stickers que compraste, estes são repetidos.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Valor em Trocas</p>
                    <div className="text-3xl font-black text-green-400">
                      {((stats.duplicated / stickersPerPack) * pricePerPack).toFixed(2)}€
                    </div>
                    <p className="text-xs text-muted-foreground">Valor "preso" em duplicados que podes trocar.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Stickers p/ Saqueta Real</p>
                    <div className="text-3xl font-black text-blue-400">
                      {((stats.owned / (Math.ceil((stats.owned + stats.duplicated) / stickersPerPack) || 1))).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Média de cromos novos por cada saqueta.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto p-12 text-center space-y-4 border-t border-white/5">
        <div className="flex justify-center gap-6 text-muted-foreground">
          <a href="https://www.linkedin.com/in/fghenriques/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors font-bold text-xs">LinkedIn</a>
          <a href="mailto:fghenriques99@outlook.com" className="hover:text-primary transition-colors font-bold text-xs">Support</a>
          <span className="text-xs font-bold">•</span>
          <span className="text-xs font-bold">2026 World Cup Edition</span>
        </div>
        <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest">Premium Sticker Tracker &copy; 2026</p>
      </footer>
    </div>
  );
};

export default App;
