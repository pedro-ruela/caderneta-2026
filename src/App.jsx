import { useState, useEffect, useMemo } from 'react';
import {
  Search, Download, Upload, Share2, CheckCircle2, XCircle,
  Copy, RefreshCw, Trophy, Users, LayoutGrid, AlertCircle,
  BarChart3, Trash2, TrendingUp, GitFork, BookOpen, CheckSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStickerData, TEAM_NAMES } from './services/dataService';
import { config } from './config';
import translations from './i18n';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitialLang = () => {
  const saved = localStorage.getItem('lang');
  if (saved === 'en' || saved === 'pt') return saved;
  return navigator.language?.startsWith('pt') ? 'pt' : 'en';
};


// ── Sub-components ────────────────────────────────────────────────────────────

const LangToggle = ({ lang, onChangeLang }) => (
  <div role="group" aria-label="Language / Idioma" className="flex p-0.5 bg-white/5 rounded-lg border border-white/10">
    <button
      onClick={() => onChangeLang('pt')}
      aria-pressed={lang === 'pt'}
      aria-label="Português"
      className={cn(
        'px-2 py-1 rounded text-base leading-none transition-all',
        lang === 'pt' ? 'bg-card shadow-sm' : 'opacity-40 hover:opacity-70'
      )}
    >
      🇵🇹
    </button>
    <button
      onClick={() => onChangeLang('en')}
      aria-pressed={lang === 'en'}
      aria-label="English"
      className={cn(
        'px-2 py-1 rounded text-base leading-none transition-all',
        lang === 'en' ? 'bg-card shadow-sm' : 'opacity-40 hover:opacity-70'
      )}
    >
      🇬🇧
    </button>
  </div>
);

// ── Country lookup helpers (built once at module level) ───────────────────────

const COUNTRY_TO_ISO = Object.fromEntries(
  Object.entries(TEAM_NAMES).map(([iso, name]) => [name.toLowerCase(), iso])
);

const _stickerPatternSource = (() => {
  const ids = [...new Set([...Object.keys(TEAM_NAMES), ...Object.values(TEAM_NAMES)])]
    .sort((a, b) => b.length - a.length);
  return `(${ids.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s+(\\d+)`;
})();

const resolveISO = (raw) => {
  const upper = raw.toUpperCase();
  return TEAM_NAMES[upper] ? upper : COUNTRY_TO_ISO[raw.toLowerCase()];
};

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => {
  const [stickers, setStickers]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [lang, setLang]                       = useState(getInitialLang);
  const [activeTab, setActiveTab]             = useState('match');
  const [inventoryView, setInventoryView]     = useState('grid');
  const [pricePerPack, setPricePerPack]       = useState(config.defaultPricePerPack);
  const [stickersPerPack, setStickersPerPack] = useState(config.defaultStickersPerPack);
  const [searchQuery, setSearchQuery]         = useState('');
  const [filterStatus, setFilterStatus]       = useState('all');
  const [visitorStickers, setVisitorStickers] = useState({});
  const [packInput, setPackInput]             = useState(() => localStorage.getItem('pack_input') || '');
  const [stuckFromPack, setStuckFromPack]     = useState(() => new Set());
  const [pastedData, setPastedData]           = useState('');
  const [showToast, setShowToast]             = useState(false);
  const [toastMessage, setToastMessage]       = useState('');

  const t = translations[lang];

  const handleLangChange = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      const data = await fetchStickerData();

      setStickers(data);
      const saved = localStorage.getItem('visitor_collection');
      if (saved) {
        try { setVisitorStickers(JSON.parse(saved)); } catch { /* keep empty */ }
      }
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stickers:', err);
      setError(true);
      setLoading(false);
    }
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    loadData();
  };

  useEffect(() => {
    async function init() { await loadData(); }
    init();
  }, []);

  useEffect(() => {
    if (Object.keys(visitorStickers).length > 0) {
      localStorage.setItem('visitor_collection', JSON.stringify(visitorStickers));
    }
  }, [visitorStickers]);


  // ── Toast helper ─────────────────────────────────────────────────────────────

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const ownerStats = useMemo(() => {
    const total = stickers.length;
    if (total === 0) return { total: 0, uniqueOwned: 0, totalOwned: 0, missing: 0, duplicated: 0, perc: 0 };
    const uniqueOwned    = stickers.filter(s => s.owned).length;
    const duplicatedCount = stickers.reduce((acc, s) => acc + s.duplicated, 0);
    const totalOwned     = uniqueOwned + duplicatedCount;
    const missing        = total - uniqueOwned;
    const perc           = ((uniqueOwned / total) * 100).toFixed(1);
    return { total, uniqueOwned, totalOwned, missing, duplicated: duplicatedCount, perc };
  }, [stickers]);

  const visitorStats = useMemo(() => {
    const total        = stickers.length;
    if (total === 0) return { total: 0, uniqueOwned: 0, totalOwned: 0, duplicated: 0, perc: 0 };
    const uniqueOwned  = Object.keys(visitorStickers).length;
    const duplicatedCount = Object.values(visitorStickers).reduce((acc, s) => acc + s.duplicated, 0);
    const totalOwned   = uniqueOwned + duplicatedCount;
    const perc         = ((uniqueOwned / total) * 100).toFixed(1);
    return { total, uniqueOwned, totalOwned, duplicated: duplicatedCount, perc };
  }, [stickers, visitorStickers]);

  const teamProgress = useMemo(() => {
    const teams = {};
    stickers.forEach(s => {
      if (!teams[s.team]) teams[s.team] = { total: 0, owned: 0 };
      teams[s.team].total++;
      if (visitorStickers[s.id]) teams[s.team].owned++;
    });
    return Object.entries(teams)
      .map(([team, stats]) => ({ team, ...stats, perc: ((stats.owned / stats.total) * 100).toFixed(0) }))
      .sort((a, b) => parseFloat(b.perc) - parseFloat(a.perc));
  }, [stickers, visitorStickers]);

  const ownerDuplicates = useMemo(() => stickers.filter(s => s.duplicated > 0), [stickers]);

  const filteredStickers = useMemo(() => {
    return stickers.filter(s => {
      const vd       = visitorStickers[s.id];
      const isOwned  = !!vd;
      const hasDups  = vd?.duplicated > 0;
      const matchSearch = s.number.includes(searchQuery) || s.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'owned'      && isOwned) ||
        (filterStatus === 'missing'    && !isOwned) ||
        (filterStatus === 'duplicated' && hasDups);
      return matchSearch && matchStatus;
    });
  }, [stickers, searchQuery, filterStatus, visitorStickers]);

  // ── Sticking Guide ────────────────────────────────────────────────────────────

  const parsedPackStickers = useMemo(() => {
    if (!packInput.trim()) return [];
    const regex = new RegExp(_stickerPatternSource, 'gi');
    let match;
    const ids = new Set();
    while ((match = regex.exec(packInput)) !== null) {
      const iso = resolveISO(match[1]);
      if (iso) ids.add(`${iso}-${match[2]}`);
    }
    return stickers.filter(s => ids.has(s.id));
  }, [packInput, stickers]);

  const stickingGuidePages = useMemo(() => {
    const remaining = parsedPackStickers.filter(s => !stuckFromPack.has(s.id));
    const withPage    = remaining.filter(s => s.page);
    const withoutPage = remaining.filter(s => !s.page);
    const pageMap = {};
    withPage.forEach(s => {
      if (!pageMap[s.page]) pageMap[s.page] = { page: s.page, stickers: [] };
      pageMap[s.page].stickers.push(s);
    });
    const sorted = Object.values(pageMap).sort((a, b) => {
      const na = parseInt(a.page), nb = parseInt(b.page);
      return (!isNaN(na) && !isNaN(nb)) ? na - nb : String(a.page).localeCompare(String(b.page));
    });
    if (withoutPage.length > 0) sorted.push({ page: null, stickers: withoutPage });
    return sorted;
  }, [parsedPackStickers, stuckFromPack]);

  const unstuckCount = useMemo(
    () => parsedPackStickers.filter(s => !stuckFromPack.has(s.id)).length,
    [parsedPackStickers, stuckFromPack]
  );

  const handlePackInput = (text) => {
    setPackInput(text);
    localStorage.setItem('pack_input', text);
  };

  const markStickerStuck = (id) => {
    setStuckFromPack(prev => new Set([...prev, id]));
  };

  const markPageStuck = (pageStickers) => {
    setStuckFromPack(prev => {
      const next = new Set(prev);
      pageStickers.forEach(s => next.add(s.id));
      return next;
    });
  };

  const markAllStuck = () => {
    setStuckFromPack(new Set(parsedPackStickers.map(s => s.id)));
  };

  const resetPack = () => {
    setPackInput('');
    setStuckFromPack(new Set());
    localStorage.removeItem('pack_input');
    showToastMessage(t.toastStuckCleared);
  };

  // ── Collection actions ────────────────────────────────────────────────────────

  const parseTextToStickers = (text) => {
    const regex = new RegExp(_stickerPatternSource, 'gi');
    const result = {};
    let match;
    while ((match = regex.exec(text)) !== null) {
      const iso = resolveISO(match[1]);
      if (!iso) continue;
      const id = `${iso}-${match[2]}`;
      if (result[id]) result[id].duplicated += 1;
      else result[id] = { team: iso, number: match[2], owned: true, duplicated: 0 };
    }
    return result;
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    setPastedData(text);
    setVisitorStickers(parseTextToStickers(text));
  };

  const toggleVisitorSticker = (team, number) => {
    const id = `${team}-${number}`;
    setVisitorStickers(prev => {
      const next = { ...prev };
      if (next[id]) {
        if (next[id].duplicated > 0) next[id] = { ...next[id], duplicated: next[id].duplicated - 1 };
        else delete next[id];
      } else {
        next[id] = { team, number, owned: true, duplicated: 0 };
      }
      return next;
    });
  };

  const clearVisitorCollection = () => {
    setVisitorStickers({});
    setPastedData('');
    localStorage.removeItem('visitor_collection');
    showToastMessage(t.toastCleared);
  };

  const tradeMatches = useMemo(() => {
    const visitorList = Object.values(visitorStickers);
    if (visitorList.length === 0) return { iHaveYouNeed: [], youHaveINeed: [] };
    const youHaveINeed = visitorList.filter(v => {
      const owner = stickers.find(s => s.id === `${v.team}-${v.number}`);
      return owner && !owner.owned;
    });
    const iHaveYouNeed = stickers.filter(s => s.duplicated > 0 && !visitorStickers[s.id]);
    return { iHaveYouNeed, youHaveINeed };
  }, [stickers, visitorStickers]);

  const downloadTemplate = () => {
    const mkSheet = (rows, headers, cols) => {
      const ws = rows.length > 0
        ? XLSX.utils.json_to_sheet(rows)
        : XLSX.utils.aoa_to_sheet([headers]);
      ws['!cols'] = cols;
      return ws;
    };
    const collectionRows = stickers.map(s => {
      const vd = visitorStickers[s.id];
      return { Team: s.team, Country: TEAM_NAMES[s.team] || s.team, Number: s.number, Page: s.page || '', Owned: vd ? 'TRUE' : 'FALSE', 'Duplicated Qty': vd?.duplicated ?? 0 };
    });
    const missingRows = stickers
      .filter(s => !visitorStickers[s.id])
      .map(s => ({ Team: s.team, Country: TEAM_NAMES[s.team] || s.team, Number: s.number, Page: s.page || '' }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, mkSheet(collectionRows, ['Team','Country','Number','Page','Owned','Duplicated Qty'], [{ wch: 6 }, { wch: 20 }, { wch: 8 }, { wch: 6 }, { wch: 8 }, { wch: 14 }]), 'Collection');
    XLSX.utils.book_append_sheet(wb, mkSheet(missingRows, ['Team','Country','Number','Page'], [{ wch: 6 }, { wch: 20 }, { wch: 8 }, { wch: 6 }]), 'Missing');
    XLSX.writeFile(wb, 'wc2026_collection.xlsx');
    showToastMessage(t.toastDownloaded);
  };

  const downloadTemplateCSV = () => {
    const rows = stickers.map(s => {
      const vd = visitorStickers[s.id];
      return { Team: s.team, Country: TEAM_NAMES[s.team] || s.team, Number: s.number, Page: s.page || '', Owned: vd ? 'TRUE' : 'FALSE', 'Duplicated Qty': vd?.duplicated ?? 0 };
    });
    const csv  = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href  = URL.createObjectURL(blob);
    link.setAttribute('download', 'wc2026_collection.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMessage(t.toastDownloaded);
  };

  const getTradeMessage = () => {
    const iHave  = tradeMatches.iHaveYouNeed.map(s => `${s.team} ${s.number}`).join(', ');
    const youHave = tradeMatches.youHaveINeed.map(s => `${s.team} ${s.number}`).join(', ');
    return t.tradeMessage(iHave, youHave);
  };

  const copyTradeSummary = () => {
    navigator.clipboard.writeText(getTradeMessage());
    showToastMessage(t.toastTradeCopied);
  };

  const shareApp = () => {
    navigator.clipboard.writeText(window.location.href);
    showToastMessage(t.toastLinkCopied);
  };

  // ── Screen: Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" aria-busy="true" aria-label={t.loadingMsg}>
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto" aria-hidden="true">
            <Trophy className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">{t.loadingMsg}</p>
          <div className="flex gap-1.5 justify-center" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Screen: Error ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl border border-destructive/20 text-center space-y-4 max-w-md w-full" role="alert">
          <div className="p-4 bg-destructive/10 rounded-2xl w-fit mx-auto" aria-hidden="true">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-bold">{t.failedTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.failedDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={retryLoad} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all focus-visible:ring">
              {t.tryAgain}
            </button>
            <LangToggle lang={lang} onChangeLang={handleLangChange} />
          </div>
        </div>
      </div>
    );
  }

  // ── Screen: Main ─────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'match',      icon: RefreshCw,   label: t.tabTrade },
    { id: 'inventory',  icon: LayoutGrid,  label: t.tabInventory },
    { id: 'duplicates', icon: Copy,        label: t.tabDuplicates },
    { id: 'sticking',   icon: BookOpen,    label: t.tabSticking,   badge: unstuckCount > 0 ? unstuckCount : null },
    { id: 'investment', icon: TrendingUp,  label: t.tabInvestment },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* Skip navigation */}
      <a href="#main-content" className="skip-link">{t.skipToContent}</a>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}wwfavicon.png`}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 rounded-full ring-2 ring-amber-400/50 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">WC 2026 Tracker</h1>
              <p className="text-[10px] text-amber-400/70 font-bold uppercase tracking-[0.25em]">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end" aria-label={`${t.ownerProgress}: ${ownerStats.perc}%`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest" aria-hidden="true">{t.ownerProgress}</span>
                <span className="text-xl font-black text-primary" aria-hidden="true">{ownerStats.perc}%</span>
              </div>
              <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden" role="progressbar" aria-valuenow={ownerStats.perc} aria-valuemin="0" aria-valuemax="100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ownerStats.perc}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <LangToggle lang={lang} onChangeLang={handleLangChange} />

            <a
              href={config.ownerGitHub}
              target="_blank"
              rel="noreferrer"
              aria-label={t.forkGithub}
              className="hidden sm:flex items-center gap-2 text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
            >
              <GitFork className="w-3 h-3" aria-hidden="true" />
              {t.forkGithub}
            </a>

            <button
              onClick={shareApp}
              aria-label={t.shareTracker}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Stats cards */}
        <section aria-label="Collection statistics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.totalStickers,      value: ownerStats.total,      icon: LayoutGrid,  color: 'text-blue-400' },
            { label: t.ownerOwned,         value: ownerStats.totalOwned, icon: CheckCircle2, color: 'text-green-400' },
            { label: t.ownerMissing,       value: ownerStats.missing,    icon: XCircle,      color: 'text-red-400' },
            { label: t.duplicatesForTrade, value: ownerStats.duplicated, icon: Copy,         color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-4 rounded-2xl flex items-center gap-4 card-hover border border-white/5"
            >
              <div className={cn('p-3 rounded-xl bg-white/5', stat.color)} aria-hidden="true">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Tab navigation */}
        <div role="tablist" aria-label={t.tabsLabel} className="flex flex-wrap p-1 bg-secondary rounded-xl w-fit gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
                activeTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
              {tab.badge != null && (
                <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Trade & Compare ──────────────────────────────────────────────── */}
          {activeTab === 'match' && (
            <motion.div
              key="match"
              role="tabpanel"
              id="panel-match"
              aria-labelledby="tab-match"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Your Collection */}
                <div className="glass p-6 rounded-2xl space-y-6 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                        {t.yourCollection}
                      </h2>
                      <p className="text-sm text-muted-foreground">{t.enterStickers}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {Object.keys(visitorStickers).length > 0 && (
                        <button
                          onClick={clearVisitorCollection}
                          aria-label={t.clearAriaLabel}
                          className="text-[10px] font-black bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg border border-destructive/20 flex items-center gap-2 transition-all"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          {t.clear}
                        </button>
                      )}
                      <button
                        onClick={downloadTemplate}
                        aria-label="Download XLSX"
                        className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3 h-3" aria-hidden="true" />
                        {t.downloadXLSX}
                      </button>
                      <button
                        onClick={downloadTemplateCSV}
                        aria-label="Download CSV"
                        className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3 h-3" aria-hidden="true" />
                        {t.downloadCSV}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Option 1 – paste */}
                    <div className="space-y-3">
                      <label htmlFor="paste-input" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.option1}</label>
                      <textarea
                        id="paste-input"
                        placeholder={t.pastePlaceholder}
                        value={pastedData}
                        onChange={handlePaste}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl p-4 h-40 text-sm outline-none focus-visible:ring transition-all font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground italic">{t.pasteTip}</p>
                    </div>

                    {/* Option 2 – grid | Option 3 – CSV */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.option2}</p>
                      <div
                        className="bg-secondary/30 border border-white/5 rounded-xl p-4 h-40 overflow-y-auto"
                        role="group"
                        aria-label={t.option2}
                      >
                        <div className="space-y-4">
                          {Object.entries(
                            stickers.reduce((acc, s) => {
                              if (!acc[s.team]) acc[s.team] = [];
                              acc[s.team].push(s);
                              return acc;
                            }, {})
                          ).map(([team, teamStickers]) => (
                            <div key={team} className="space-y-2">
                              <div className="flex items-center gap-2" aria-hidden="true">
                                <span className="text-[9px] font-black text-primary/70 tracking-widest">{team}</span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {teamStickers.map(s => {
                                  const sel = visitorStickers[s.id];
                                  return (
                                    <button
                                      key={`mini-${s.id}`}
                                      onClick={() => toggleVisitorSticker(s.team, s.number)}
                                      aria-label={t.stickerAriaLabel(s.team, s.number, sel ? t.filterOwned : t.filterMissing)}
                                      aria-pressed={!!sel}
                                      className={cn(
                                        'w-7 h-9 rounded-md text-[9px] font-black flex items-center justify-center transition-all relative',
                                        sel
                                          ? 'bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/20'
                                          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                      )}
                                    >
                                      {s.number}
                                      {sel?.duplicated > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-white text-primary text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold" aria-hidden="true">
                                          {sel.duplicated}
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
                        <Upload className="w-4 h-4" aria-hidden="true" />
                        {t.option3}
                        <input
                          type="file"
                          className="sr-only"
                          accept=".csv,.xlsx,.xls"
                          aria-label={t.option3}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const parseRows = (rows) => {
                              const parsed = {};
                              rows.forEach(r => {
                                const teamRaw = (r.Team || r.SEL || r.Country)?.toString().trim();
                                if (!teamRaw) return;
                                const upper = teamRaw.toUpperCase();
                                const team  = TEAM_NAMES[upper] ? upper : COUNTRY_TO_ISO[teamRaw.toLowerCase()];
                                const number = (r.Number || r.NO)?.toString();
                                const owned  = r.Owned?.toString().toLowerCase() === 'true';
                                const dups   = parseInt(r['Duplicated Qty'] || r.Duplicate) || 0;
                                if (team && number && owned) {
                                  parsed[`${team}-${number}`] = { team, number, owned: true, duplicated: dups };
                                }
                              });
                              setVisitorStickers(parsed);
                              showToastMessage(t.toastUploaded);
                            };
                            if (file.name.match(/\.xlsx?$/i)) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const wb = XLSX.read(evt.target.result, { type: 'array' });
                                const ws = wb.Sheets[wb.SheetNames[0]];
                                parseRows(XLSX.utils.sheet_to_json(ws));
                              };
                              reader.readAsArrayBuffer(file);
                            } else {
                              Papa.parse(file, { header: true, complete: (r) => parseRows(r.data) });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Comparison Engine */}
                <div className="glass p-6 rounded-2xl space-y-6 border border-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-primary" aria-hidden="true" />
                      {t.comparisonEngine}
                    </h2>
                    {Object.keys(visitorStickers).length > 0 && (
                      <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10" aria-label={`${t.yourProgress}: ${visitorStats.perc}%, ${t.stickers}: ${visitorStats.totalOwned}`}>
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-muted-foreground" aria-hidden="true">{t.yourProgress}</p>
                          <p className="text-sm font-black text-primary" aria-hidden="true">{visitorStats.perc}%</p>
                        </div>
                        <div className="w-[1px] h-6 bg-white/10" aria-hidden="true" />
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-muted-foreground" aria-hidden="true">{t.stickers}</p>
                          <p className="text-sm font-black text-white" aria-hidden="true">{visitorStats.totalOwned}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={copyTradeSummary}
                      disabled={Object.keys(visitorStickers).length === 0}
                      className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 focus-visible:ring"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      {t.copyTradeMessage}
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        {t.iHaveYouNeed} ({tradeMatches.iHaveYouNeed.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tradeMatches.iHaveYouNeed.length > 0
                          ? tradeMatches.iHaveYouNeed.map(s => (
                              <span key={s.id} className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary">
                                {s.team} {s.number}
                              </span>
                            ))
                          : <p className="text-xs text-muted-foreground italic">{t.addToFindMatches}</p>
                        }
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 flex items-center gap-2">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        {t.youHaveINeed} ({tradeMatches.youHaveINeed.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tradeMatches.youHaveINeed.length > 0
                          ? tradeMatches.youHaveINeed.map(v => (
                              <span key={`${v.team}-${v.number}`} className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] font-bold text-green-400">
                                {v.team} {v.number}
                              </span>
                            ))
                          : <p className="text-xs text-muted-foreground italic">{t.noMatchesYet}</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact card */}
              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 shadow-xl shadow-primary/5">
                  <h2 className="text-lg font-bold mb-2">{t.letsSwap}</h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t.swapDesc}</p>
                  <div className="space-y-3">
                    <a
                      href={config.ownerLinkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                      {t.linkedinProfile}
                    </a>
                    <a
                      href={`mailto:${config.ownerEmail}?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(getTradeMessage())}`}
                      className="w-full bg-secondary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      {t.sendEmail}
                    </a>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t.emailLabel}</p>
                      <p className="text-xs font-medium text-primary">{config.ownerEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t.locationLabel}</p>
                      <p className="text-sm font-bold">{config.ownerLocation} {config.ownerLocationFlag}</p>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5">
                  <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                    {t.howItWorks}
                  </h2>
                  <ol className="space-y-4">
                    {[t.step1, t.step2, t.step3].map((text, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold" aria-hidden="true">{i + 1}</span>
                        <p className="text-xs text-muted-foreground leading-snug">{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Collection Progress ───────────────────────────────────────────── */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              role="tabpanel"
              id="panel-inventory"
              aria-labelledby="tab-inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      type="search"
                      aria-label={t.searchAriaLabel}
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-secondary/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus-visible:ring outline-none transition-all"
                    />
                  </div>
                  <select
                    aria-label={t.filterAriaLabel}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-secondary/50 border border-white/5 rounded-xl px-4 py-3 outline-none text-sm font-medium focus-visible:ring"
                  >
                    <option value="all">{t.filterAll}</option>
                    <option value="owned">{t.filterOwned}</option>
                    <option value="missing">{t.filterMissing}</option>
                    <option value="duplicated">{t.filterDuplicated}</option>
                  </select>
                </div>
                <div role="group" aria-label="View mode" className="flex p-1 bg-secondary rounded-xl w-fit h-fit self-end">
                  {[
                    { id: 'grid',  icon: LayoutGrid, label: t.grid },
                    { id: 'teams', icon: BarChart3,   label: t.byTeam },
                  ].map(v => (
                    <button
                      key={v.id}
                      aria-pressed={inventoryView === v.id}
                      onClick={() => setInventoryView(v.id)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1', inventoryView === v.id ? 'bg-card text-primary' : 'text-muted-foreground hover:text-foreground')}
                    >
                      <v.icon className="w-3 h-3" aria-hidden="true" /> {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {inventoryView === 'grid' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground italic">{t.clickToToggle}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{t.showingCount(filteredStickers.length)}</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {filteredStickers.map(s => {
                      const vd      = visitorStickers[s.id];
                      const isOwned = !!vd;
                      const dups    = vd?.duplicated || 0;
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleVisitorSticker(s.team, s.number)}
                          aria-label={t.stickerAriaLabel(s.team, s.number, isOwned ? (dups > 0 ? `${t.filterOwned}, +${dups}` : t.filterOwned) : t.filterMissing)}
                          aria-pressed={isOwned}
                          className={cn(
                            'aspect-[3/4] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden',
                            isOwned
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                              : 'bg-secondary/50 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/20'
                          )}
                        >
                          <span className="text-[10px] font-black tracking-tighter opacity-70" aria-hidden="true">{s.team}</span>
                          <span className="text-lg font-black leading-none" aria-hidden="true">{s.number}</span>
                          {dups > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg" aria-hidden="true">
                              +{dups}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Team progress">
                  {teamProgress.map(({ team, total, owned, perc }) => (
                    <li key={team} className="glass p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm">{team}</span>
                        <span className="text-[10px] font-bold text-muted-foreground" aria-label={`${owned} of ${total}`}>{owned}/{total}</span>
                      </div>
                      <div
                        className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"
                        role="progressbar"
                        aria-label={`${team} ${perc}%`}
                        aria-valuenow={perc}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${perc}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', parseInt(perc) === 100 ? 'bg-green-400' : parseInt(perc) > 50 ? 'bg-primary' : 'bg-blue-400')}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-right text-muted-foreground" aria-hidden="true">{perc}%</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* ── Available Duplicates ─────────────────────────────────────────── */}
          {activeTab === 'duplicates' && (
            <motion.div
              key="duplicates"
              role="tabpanel"
              id="panel-duplicates"
              aria-labelledby="tab-duplicates"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-6">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                  <Copy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">{t.availableForTrade}</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">{t.duplicatesDesc}</p>
                </div>
                {ownerDuplicates.length > 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-sm font-bold text-muted-foreground">{t.showingCount(ownerDuplicates.length)}</span>
                      <button
                        onClick={() => {
                          const list = ownerDuplicates.map(s => `${s.team} ${s.number} (+${s.duplicated})`).join(', ');
                          navigator.clipboard.writeText(list);
                          showToastMessage(t.toastDuplicatesCopied);
                        }}
                        className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 transition-all"
                      >
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        {t.copyDuplicatesList}
                      </button>
                    </div>
                    <ul className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto" aria-label={t.availableForTrade}>
                      {ownerDuplicates.map(s => (
                        <li key={`dup-${s.id}`} className="px-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-[10px] font-black text-muted-foreground">{s.team}</span>
                          <span className="text-xl font-black text-primary">{s.number}</span>
                          <span className="text-[9px] font-bold bg-primary/10 px-2 py-0.5 rounded-full text-primary">+{s.duplicated}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">{t.noDuplicates}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Sticking Guide ────────────────────────────────────────────────── */}
          {activeTab === 'sticking' && (
            <motion.div
              key="sticking"
              role="tabpanel"
              id="panel-sticking"
              aria-labelledby="tab-sticking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                    {t.stickingTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-lg">{t.stickingDesc}</p>
                </div>
                {packInput.trim() && (
                  <button
                    onClick={resetPack}
                    aria-label={t.stickingClearAriaLabel}
                    className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all flex-shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    {t.stickingClear}
                  </button>
                )}
              </div>

              {/* Pack input */}
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                <label htmlFor="pack-input" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  {t.stickingInputLabel}
                </label>
                <textarea
                  id="pack-input"
                  placeholder={t.stickingInputPlaceholder}
                  value={packInput}
                  onChange={(e) => handlePackInput(e.target.value)}
                  className="w-full bg-secondary/50 border border-white/5 rounded-xl p-4 h-28 text-sm outline-none focus-visible:ring transition-all font-mono resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground italic">{t.stickingInputTip}</p>
                  {packInput.trim() && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      parsedPackStickers.length > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    )}>
                      {parsedPackStickers.length > 0 ? t.stickingFound(parsedPackStickers.length) : t.stickingNoMatch}
                    </span>
                  )}
                </div>
              </div>

              {/* Empty: no input */}
              {!packInput.trim() && (
                <div className="glass p-12 rounded-3xl border border-white/5 text-center space-y-3">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                    <BookOpen className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t.stickingInputPlaceholder}</p>
                </div>
              )}

              {/* Has input but no match in sheet */}
              {packInput.trim() && parsedPackStickers.length === 0 && (
                <div className="glass p-8 rounded-3xl border border-destructive/20 text-center space-y-2">
                  <p className="font-bold">{t.stickingNoMatch}</p>
                  <p className="text-sm text-muted-foreground">{t.stickingNoMatchDesc}</p>
                </div>
              )}

              {/* All placed */}
              {parsedPackStickers.length > 0 && unstuckCount === 0 && (
                <div className="glass p-12 rounded-3xl border border-green-500/20 bg-green-500/5 text-center space-y-4">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto" aria-hidden="true">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                  <p className="font-black text-xl">{t.stickingAllDone}</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t.stickingAllDoneDesc}</p>
                  <button onClick={resetPack} className="text-sm font-bold bg-white/5 hover:bg-white/10 px-5 py-2 rounded-xl border border-white/10 transition-all">
                    {t.stickingClear}
                  </button>
                </div>
              )}

              {/* Page groups */}
              {stickingGuidePages.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground" aria-live="polite">
                      {t.stickingCount(unstuckCount, stickingGuidePages.filter(p => p.page).length)}
                    </p>
                    <button
                      onClick={markAllStuck}
                      className="text-[10px] font-black bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckSquare className="w-3 h-3" aria-hidden="true" />
                      {t.stickingMarkAll}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {stickingGuidePages.map(({ page, stickers: pageStickers }) => (
                        <motion.div
                          key={`page-${page ?? 'none'}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          className="glass p-5 rounded-2xl border border-white/5 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'px-3 py-1 text-xs font-black rounded-lg border',
                                page ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground border-white/10'
                              )}>
                                {page ? `${t.stickingPage} ${page}` : t.stickingNoPageGroup}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold">
                                {pageStickers.length} {pageStickers.length === 1 ? 'sticker' : 'stickers'}
                              </span>
                            </div>
                            {page && (
                              <button
                                onClick={() => markPageStuck(pageStickers)}
                                aria-label={`${t.stickingMarkPage} ${page}`}
                                className="text-[10px] font-black bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center gap-1.5 transition-all"
                              >
                                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                {t.stickingMarkPage}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pageStickers.map(s => (
                              <button
                                key={`stick-${s.id}`}
                                onClick={() => markStickerStuck(s.id)}
                                aria-label={t.stickingMarkOne(s.team, s.number)}
                                className="group px-3 py-2 bg-secondary/50 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-xl flex flex-col items-center gap-0.5 min-w-[60px] transition-all"
                              >
                                <span className="text-[9px] font-black text-muted-foreground group-hover:text-green-400 transition-colors">{s.team}</span>
                                <span className="text-base font-black text-foreground group-hover:text-green-400 transition-colors">{s.number}</span>
                                <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-green-400 transition-colors" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {parsedPackStickers.some(s => !s.page) && (
                    <p className="text-[10px] text-muted-foreground italic">{t.stickingNoPagesDesc}</p>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Cost ──────────────────────────────────────────────────────────── */}
          {activeTab === 'investment' && (
            <motion.div
              key="investment"
              role="tabpanel"
              id="panel-investment"
              aria-labelledby="tab-investment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Config + summary cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.configuration}</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={t.pricePerPackId} className="text-xs font-bold block mb-2">{t.pricePerPackLabel}</label>
                      <input
                        id={t.pricePerPackId}
                        type="number"
                        step="0.05"
                        min="0"
                        value={pricePerPack}
                        onChange={(e) => setPricePerPack(parseFloat(e.target.value) || 0)}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2 outline-none focus-visible:ring transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor={t.stickersPerPackId} className="text-xs font-bold block mb-2">{t.stickersPerPackLabel}</label>
                      <input
                        id={t.stickersPerPackId}
                        type="number"
                        min="1"
                        value={stickersPerPack}
                        onChange={(e) => setStickersPerPack(parseInt(e.target.value) || 1)}
                        className="w-full bg-secondary/50 border border-white/5 rounded-xl px-4 py-2 outline-none focus-visible:ring transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { label: t.totalSpent,     value: `${(ownerStats.totalOwned / stickersPerPack * pricePerPack).toFixed(2)}€`,        desc: t.totalSpentDesc,     color: 'text-primary' },
                    { label: t.packsPurchased, value: Math.ceil(ownerStats.totalOwned / stickersPerPack),                                desc: t.packsPurchasedDesc, color: 'text-blue-400' },
                    { label: t.packsRemaining, value: Math.ceil(ownerStats.missing / stickersPerPack),                                   desc: t.packsRemainingDesc, color: 'text-orange-400' },
                    { label: t.costToComplete, value: `${(Math.ceil(ownerStats.missing / stickersPerPack) * pricePerPack).toFixed(2)}€`, desc: t.costToCompleteDesc, color: 'text-green-400' },
                  ].map(item => (
                    <div key={item.label} className="glass p-6 rounded-3xl border border-white/5 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className={cn('text-3xl font-black', item.color)}>{item.value}</p>
                      <p className="text-[10px] text-muted-foreground italic">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Efficiency analysis */}
              <div className="glass p-8 rounded-3xl border border-white/5">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
                  {t.efficiencyAnalysis}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { label: t.duplicateRate, value: `${((ownerStats.duplicated / (ownerStats.totalOwned || 1)) * 100).toFixed(1)}%`, desc: t.duplicateRateDesc, color: 'text-primary' },
                    { label: t.valueInTrades, value: `${((ownerStats.duplicated / stickersPerPack) * pricePerPack).toFixed(2)}€`,      desc: t.valueInTradesDesc, color: 'text-green-400' },
                    { label: t.newPerPack,    value: (ownerStats.uniqueOwned / (Math.ceil(ownerStats.totalOwned / stickersPerPack) || 1)).toFixed(1), desc: t.newPerPackDesc, color: 'text-blue-400' },
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className={cn('text-3xl font-black', item.color)}>{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto p-12 text-center space-y-4 border-t border-white/5">
        <div className="flex justify-center flex-wrap gap-6 text-muted-foreground">
          <a href={config.ownerLinkedIn} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors font-bold text-xs">LinkedIn</a>
          <a href={config.ownerGitHub}   target="_blank" rel="noreferrer" className="hover:text-primary transition-colors font-bold text-xs">GitHub</a>
          <a href={`mailto:${config.ownerEmail}`}        className="hover:text-primary transition-colors font-bold text-xs">{t.contact}</a>
          <span className="text-xs font-bold" aria-hidden="true">•</span>
          <span className="text-xs font-bold">{t.worldCupEdition}</span>
        </div>
        <p className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest">{t.tagline}</p>
      </footer>
    </div>
  );
};

export default App;
