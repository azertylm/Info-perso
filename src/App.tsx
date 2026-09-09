import React, { useState, useEffect } from "react";
import {
  Heart,
  Settings,
  RefreshCw,
  Bot,
  Newspaper,
  Menu,
  X,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Users,
  User as UserIcon,
  Flame,
  Sun,
  Moon,
  Globe,
  PlusCircle,
  Terminal,
  Keyboard,
  Maximize,
  Minimize
} from "lucide-react";

import { ApiKeys, RibInfo, NewsArticle } from "./types";
import NewsFeed from "./components/NewsFeed";
import MultiChat from "./components/MultiChat";
import KeysConfig from "./components/KeysConfig";
import DonationSection from "./components/DonationSection";
import CommunitySpace from "./components/CommunitySpace";
import UserAuth from "./components/UserAuth";
import UserProfileDrawer from "./components/UserProfileDrawer";
import ShortcutsGuide from "./components/ShortcutsGuide";
import { auth, onAuthStateChanged } from "./lib/firebase";
import { SubscriptionStatus, listenToSubscription } from "./lib/subscriptionService";

// Multi-language system
import { TRANSLATIONS, Language, TranslationDict } from "./lib/i18n";

// Neutral Base addon modules
import {
  OnboardingWizard,
  ThemeCustomizer,
  RemixSynchronizer,
  SpotlightCommandBar,
  CustomArticleForm
} from "./components/NeutralBaseAddons";

// Standard French RIB defaults
const DEFAULT_RIB: RibInfo = {
  bankName: "Crédit Agricole Toulouse 31",
  accountHolder: "JEAN DUPONT - DEVELOPPEUR",
  iban: "FR76 1251 7000 0112 3456 7890 192",
  bic: "CRCAMFRPXXX",
  bankCode: "12517",
  branchCode: "00001",
  accountNumber: "12345678901",
  ribKey: "92"
};

const DEFAULT_KEYS: ApiKeys = {
  gemini: "",
  openai: "",
  anthropic: "",
  mistral: "",
  deepseek: "",
  kimi: ""
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"flux" | "chat" | "donations" | "keys" | "communaute" | "auth" | "shortcuts">("flux");
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [ribInfo, setRibInfo] = useState<RibInfo>(DEFAULT_RIB);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  // Display Modes: "sobre" | "pro" | "warm" | "cyber" | "fun"
  const [displayMode, setDisplayMode] = useState<"sobre" | "pro" | "warm" | "cyber" | "fun">(() => {
    const saved = localStorage.getItem("infoperso_display_mode") as any;
    if (["sobre", "pro", "warm", "cyber", "fun"].includes(saved)) return saved;
    return "pro";
  });

  // Dynamic light/dark themeMode
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("infoperso_theme_mode") as any) || "dark";
  });

  // Sync themeMode to document root
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [themeMode]);

  // Curiosity score state
  const [curiosityScore, setCuriosityScore] = useState<number>(() => {
    return Number(localStorage.getItem("infoperso_curiosity_score") || "0");
  });

  const progressPercent = ((curiosityScore % 20) / 20) * 100;

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_unlocked_badges");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("infoperso_curiosity_stats");
      return saved ? JSON.parse(saved) : {
        articlesReadCount: 0,
        articlesSharedCount: 0,
        quizzesCompleted: 0,
        quizScoreSum: 0,
        categoriesExplored: [],
        readCountByCat: {}
      };
    } catch {
      return {
        articlesReadCount: 0,
        articlesSharedCount: 0,
        quizzesCompleted: 0,
        quizScoreSum: 0,
        categoriesExplored: [],
        readCountByCat: {}
      };
    }
  });

  // Multi-language system State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("infoperso_language") as Language) || "fr";
  });

  // Custom App Title Override (Neutral Baseline)
  const [customTitle, setCustomTitle] = useState<string>(() => {
    const saved = localStorage.getItem("infoperso_custom_title");
    if (!saved || saved === "Info Perso Grand Format" || saved === "InfoPerso Master") {
      return "Info Perso";
    }
    return saved;
  });

  // Custom Content Categories
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_custom_categories");
      return saved ? JSON.parse(saved) : ["IA", "Technologie", "Local", "Design", "Économie", "Médias"];
    } catch {
      return ["IA", "Technologie", "Local", "Design", "Économie", "Médias"];
    }
  });

  // Onboarding state
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem("infoperso_onboarding_completed") === "true";
  });

  // Spotlight Command Overlay state
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  // Global Keybinder for spotlight command bar & Alt commands
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spotlight Command Bar
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSpotlightOpen(prev => !prev);
        return;
      }

      // Check if target is input or textarea, if so skip unless it's Ctrl+K
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      // Alt key shortcuts
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "f" || key === "h") {
          e.preventDefault();
          setActiveTab("flux");
          setOnlySaved(false);
          setActiveFilter(null);
          setActiveTag(null);
          triggerToast(language === "fr" ? "🏠 Navigation : Flux d'actualités (Alt + H)" : "🏠 Navigation: News Feed (Alt + H)");
        } else if (key === "c") {
          e.preventDefault();
          setActiveTab("chat");
          triggerToast(language === "fr" ? "💬 Navigation : Chat Curateur IA (Alt + C)" : "💬 Navigation: AI Chat (Alt + C)");
        } else if (key === "d") {
          e.preventDefault();
          setActiveTab("donations");
          triggerToast(language === "fr" ? "💖 Navigation : Soutenir (Alt + D)" : "💖 Navigation: Support (Alt + D)");
        } else if (key === "k") {
          e.preventDefault();
          setActiveTab("keys");
          triggerToast(language === "fr" ? "⚙️ Navigation : Configuration & Clés (Alt + K)" : "⚙️ Navigation: API Keys (Alt + K)");
        } else if (key === "m") {
          e.preventDefault();
          setActiveTab("communaute");
          triggerToast(language === "fr" ? "👥 Navigation : Communauté (Alt + M)" : "👥 Navigation: Community Space (Alt + M)");
        } else if (key === "a") {
          e.preventDefault();
          setActiveTab("auth");
          triggerToast(language === "fr" ? "👤 Navigation : Mon Compte (Alt + A)" : "👤 Navigation: My Account (Alt + A)");
        } else if (key === "r") {
          e.preventDefault();
          setActiveTab("shortcuts");
          triggerToast(language === "fr" ? "⌨️ Navigation : Raccourcis Clavier (Alt + R)" : "⌨️ Navigation: Keyboard Shortcuts (Alt + R)");
        } else if (key === "t") {
          e.preventDefault();
          const nextTheme = themeMode === "dark" ? "light" : "dark";
          setThemeMode(nextTheme);
          localStorage.setItem("infoperso_theme_mode", nextTheme);
          triggerToast(language === "fr" ? `🌓 Thème : Mode ${nextTheme === "dark" ? "Sombre" : "Clair"} (Alt + T)` : `🌓 Theme: ${nextTheme === "dark" ? "Dark" : "Light"} Mode (Alt + T)`);
        } else if (key === "s") {
          e.preventDefault();
          const modes: Array<"sobre" | "pro" | "warm" | "cyber" | "fun"> = ["sobre", "pro", "warm", "cyber", "fun"];
          const currentIdx = modes.indexOf(displayMode);
          const nextMode = modes[(currentIdx + 1) % modes.length];
          setDisplayMode(nextMode);
          localStorage.setItem("infoperso_display_mode", nextMode);
          
          const label = 
            nextMode === "sobre" ? "Minimaliste Épuré" :
            nextMode === "pro" ? "Professionnel Actuel" :
            nextMode === "warm" ? "Warm Café (Papier)" :
            nextMode === "cyber" ? "Cyber Néon (Futuriste)" :
            "Pop Comic (Fun !)";
          triggerToast(language === "fr" ? `✨ Style d'affichage : ${label} (Alt + S)` : `✨ Display Style: ${nextMode.toUpperCase()} (Alt + S)`);
        } else if (key === "l") {
          e.preventDefault();
          const languages: Language[] = ["fr", "en", "zh", "it", "pt", "ar", "es"];
          const currentIdx = languages.indexOf(language);
          const nextLang = languages[(currentIdx + 1) % languages.length];
          setLanguage(nextLang);
          localStorage.setItem("infoperso_language", nextLang);
          triggerToast(`🌐 Langue : ${nextLang.toUpperCase()} (Alt + L)`);
        } else if (key === "n") {
          e.preventDefault();
          setActiveTab("flux");
          setTimeout(() => {
            const el = document.getElementById("custom-article-creator-drawer");
            if (el) {
              el.classList.toggle("hidden");
              triggerToast(language === "fr" ? "📰 Publication d'article alternée (Alt + N)" : "📰 Custom Article Creator toggled (Alt + N)");
            }
          }, 100);
        } else if (key === "p") {
          e.preventDefault();
          setProfileDrawerOpen(prev => !prev);
          triggerToast(language === "fr" ? "🏆 Score de Curiosité & Badges (Alt + P)" : "🏆 Curiosity Score & Badges (Alt + P)");
        } else if (key === "g") {
          e.preventDefault();
          setSpotlightOpen(prev => !prev);
          triggerToast(language === "fr" ? "🔍 Centre de Commandes Spotlight (Alt + G)" : "🔍 Spotlight Command Center (Alt + G)");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayMode, themeMode, language]);

  const [passiveSignalsSettings, setPassiveSignalsSettings] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("infoperso_passive_signals_settings");
      return saved ? JSON.parse(saved) : {
        trackReadingTime: true,
        trackScrollDepth: true,
        trackReReading: true,
        trackCategoryWeights: true
      };
    } catch {
      return {
        trackReadingTime: true,
        trackScrollDepth: true,
        trackReReading: true,
        trackCategoryWeights: true
      };
    }
  });

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const handleAwardCuriosityPoints = (
    points: number, 
    reason: string, 
    articleCategory?: string, 
    actionType?: "read" | "share" | "quiz"
  ) => {
    let newScore = curiosityScore + points;
    setCuriosityScore(newScore);
    localStorage.setItem("infoperso_curiosity_score", String(newScore));

    const updatedStats = { ...stats };
    if (actionType === "read") {
      updatedStats.articlesReadCount += 1;
      if (articleCategory) {
        updatedStats.readCountByCat = updatedStats.readCountByCat || {};
        updatedStats.readCountByCat[articleCategory] = (updatedStats.readCountByCat[articleCategory] || 0) + 1;
        
        updatedStats.categoriesExplored = updatedStats.categoriesExplored || [];
        if (!updatedStats.categoriesExplored.includes(articleCategory)) {
          updatedStats.categoriesExplored.push(articleCategory);
          newScore += 5;
          setCuriosityScore(newScore);
          localStorage.setItem("infoperso_curiosity_score", String(newScore));
          triggerToast(`🌍 Nouvelle catégorie explorée : ${articleCategory} (+5 pts)`);
        }
      }
    } else if (actionType === "share") {
      updatedStats.articlesSharedCount = (updatedStats.articlesSharedCount || 0) + 1;
    } else if (actionType === "quiz") {
      updatedStats.quizzesCompleted = (updatedStats.quizzesCompleted || 0) + 1;
    }
    setStats(updatedStats);
    localStorage.setItem("infoperso_curiosity_stats", JSON.stringify(updatedStats));

    const newlyUnlocked: string[] = [...unlockedBadges];
    
    if ((updatedStats.readCountByCat?.["IA"] || 0) >= 5 && !newlyUnlocked.includes("ia-explorer")) {
      newlyUnlocked.push("ia-explorer");
      triggerToast("🏆 Badge Débloqué : Pionnier de l'IA ! 🤖");
    }
    if ((updatedStats.readCountByCat?.["Technologie"] || 0) >= 5 && !newlyUnlocked.includes("tech-enthusiast")) {
      newlyUnlocked.push("tech-enthusiast");
      triggerToast("🏆 Badge Débloqué : Technophile ! ⚡");
    }
    if ((updatedStats.readCountByCat?.["Local"] || 0) >= 3 && !newlyUnlocked.includes("local-citizen")) {
      newlyUnlocked.push("local-citizen");
      triggerToast("🏆 Badge Débloqué : Explorateur Local ! 📍");
    }
    if ((updatedStats.readCountByCat?.["Design"] || 0) >= 3 && !newlyUnlocked.includes("design-connoisseur")) {
      newlyUnlocked.push("design-connoisseur");
      triggerToast("🏆 Badge Débloqué : Esthète ! 🎨");
    }
    if ((updatedStats.quizzesCompleted || 0) >= 3 && !newlyUnlocked.includes("quiz-master")) {
      newlyUnlocked.push("quiz-master");
      triggerToast("🏆 Badge Débloqué : Esprit Critique ! 🧠");
    }
    if ((updatedStats.articlesSharedCount || 0) >= 3 && !newlyUnlocked.includes("social-curator")) {
      newlyUnlocked.push("social-curator");
      triggerToast("🏆 Badge Débloqué : Mécène de l'Info ! 📢");
    }
    if ((updatedStats.categoriesExplored?.length || 0) >= 5 && !newlyUnlocked.includes("omnivore-reader")) {
      newlyUnlocked.push("omnivore-reader");
      triggerToast("🏆 Badge Débloqué : Lecteur Omnivore ! 🌍");
    }

    if (newlyUnlocked.length > unlockedBadges.length) {
      setUnlockedBadges(newlyUnlocked);
      localStorage.setItem("infoperso_unlocked_badges", JSON.stringify(newlyUnlocked));
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleToggleSignalSetting = (key: string) => {
    const updated: any = { ...passiveSignalsSettings, [key]: !passiveSignalsSettings[key] };
    setPassiveSignalsSettings(updated);
    localStorage.setItem("infoperso_passive_signals_settings", JSON.stringify(updated));
  };

  const handleResetProgress = () => {
    setCuriosityScore(0);
    setUnlockedBadges([]);
    setStats({
      articlesReadCount: 0,
      articlesSharedCount: 0,
      quizzesCompleted: 0,
      quizScoreSum: 0,
      categoriesExplored: [],
      readCountByCat: {}
    });
    localStorage.removeItem("infoperso_curiosity_score");
    localStorage.removeItem("infoperso_unlocked_badges");
    localStorage.removeItem("infoperso_curiosity_stats");
  };

  // Filters for News
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [onlySaved, setOnlySaved] = useState(false);

  // Responsive Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);

  // Easy Mode (Readability Mode for Seniors / Vision Comfort)
  const [isEasyMode, setIsEasyMode] = useState<boolean>(() => {
    return localStorage.getItem("infoperso_easy_mode") === "true";
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const triggerToast = (msg: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(null), 3000);
    setToastTimer(timer);
  };

  const handleDisplayModeChange = (mode: "sobre" | "fun") => {
    setDisplayMode(mode);
    localStorage.setItem("infoperso_display_mode", mode);
    
    const label = mode === "sobre" ? "Minimaliste Épuré" : "Pop Comic (Fun !)";
    triggerToast(`✨ Mode d'affichage : ${label}`);
  };

  // Theme-specific helper variables
  const isSobre = displayMode === "sobre";
  const isFun = displayMode === "fun";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isPro = displayMode === "pro";
  const isDark = themeMode === "dark";

  const getThemeContainerClasses = () => {
    if (isDark) {
      return "bg-black text-white selection:bg-zinc-800";
    }
    if (isFun) {
      return "bg-yellow-50 text-black selection:bg-yellow-200 p-1 sm:p-2";
    }
    if (isWarm) {
      return "bg-[#FDFBF7] text-[#251e1a] selection:bg-amber-100";
    }
    if (isCyber) {
      return "bg-zinc-950 text-cyan-400 selection:bg-cyan-900";
    }
    // Default to sobre / pro (light mode, clear white, black text)
    return "bg-white text-black selection:bg-zinc-200";
  };

  const getLogoStyles = () => {
    if (isCyber) {
      return {
        wrapper: "hidden",
        title: `font-mono font-black tracking-wider text-base sm:text-lg uppercase leading-none bg-gradient-to-r ${
          isDark 
            ? "from-cyan-400 via-teal-300 to-emerald-400" 
            : "from-teal-600 via-cyan-600 to-emerald-600"
        } bg-clip-text text-transparent`,
        subtitle: `text-[9px] ${isDark ? "text-cyan-400/70" : "text-teal-700"} uppercase tracking-wider font-mono font-bold hidden md:block mt-0.5`
      };
    }
    if (isWarm) {
      return {
        wrapper: "hidden",
        title: `font-serif font-bold tracking-tight text-base sm:text-lg leading-none bg-gradient-to-r ${
          isDark 
            ? "from-amber-300 via-orange-300 to-yellow-200" 
            : "from-amber-800 via-orange-700 to-amber-950"
        } bg-clip-text text-transparent`,
        subtitle: `text-[9px] ${isDark ? "text-amber-300/70" : "text-amber-800/80"} uppercase tracking-wider font-serif font-semibold hidden md:block mt-0.5`
      };
    }
    if (isFun) {
      return {
        wrapper: "hidden",
        title: `font-black tracking-tight text-base sm:text-xl uppercase italic leading-none bg-gradient-to-r ${
          isDark 
            ? "from-pink-400 via-fuchsia-300 to-yellow-300" 
            : "from-fuchsia-600 via-pink-600 to-purple-600"
        } bg-clip-text text-transparent`,
        subtitle: "text-[9px] text-black dark:text-pink-300 uppercase tracking-wider font-extrabold hidden md:block mt-0.5"
      };
    }
    if (isSobre) {
      return {
        wrapper: "hidden",
        title: `font-sans font-black tracking-tight text-base sm:text-lg leading-none bg-gradient-to-r ${
          isDark 
            ? "from-blue-400 via-indigo-300 to-zinc-200" 
            : "from-blue-700 via-indigo-600 to-zinc-800"
        } bg-clip-text text-transparent`,
        subtitle: `text-[9px] ${isDark ? "text-zinc-400" : "text-zinc-500"} uppercase tracking-wider font-sans font-semibold hidden md:block mt-0.5`
      };
    }
    // Pro / Standard Default
    return {
      wrapper: "hidden",
      title: `font-sans font-black tracking-tight text-base sm:text-lg leading-none bg-gradient-to-r ${
        isDark 
          ? "from-blue-400 via-indigo-300 to-cyan-400" 
          : "from-blue-600 via-indigo-600 to-sky-600"
      } bg-clip-text text-transparent`,
      subtitle: `text-[9px] ${isDark ? "text-zinc-400" : "text-zinc-500"} uppercase tracking-wider font-sans font-semibold hidden md:block mt-0.5`
    };
  };

  const getButtonStyles = (tab: typeof activeTab, activeGradient: string, activeBaseColor: string) => {
    const isActive = activeTab === tab;
    if (isDark) {
      return isActive
        ? "px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-sans font-bold border border-white bg-white text-black shadow-xs"
        : "px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-sans font-bold border border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white";
    }
    if (isFun) {
      return isActive
        ? `px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-sans font-black border-3 border-black ${activeBaseColor} text-black shadow-[3px_3px_0px_0px_rgba(236,72,153,1)] scale-102 transition-all`
        : `px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-sans font-black border-3 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all`;
    }
    // Sobre / Default
    return isActive
      ? "px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-sans font-bold border border-black bg-zinc-900 text-white shadow-xs"
      : "px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-sans font-bold border border-zinc-250 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-zinc-350";
  };

  const getNavButtonClass = (isActive: boolean, activeColorType: "cyan" | "violet" | "fuchsia") => {
    if (isDark) {
      return isActive
        ? "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg font-bold bg-zinc-900 text-white border-l-3 border-zinc-500"
        : "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white";
    }
    if (isFun) {
      return isActive
        ? "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl font-black border-3 border-black bg-fuchsia-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-102"
        : "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-xl font-extrabold border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50";
    }
    // Sobre / Default
    return isActive
      ? "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg font-bold bg-zinc-950 text-white border-l-3 border-zinc-900 shadow-xs"
      : "w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-lg text-zinc-700 hover:bg-zinc-150 hover:text-black";
  };

  const getCatButtonClass = (cat: string, isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-lg font-bold bg-zinc-900 text-white border-l-3 border-zinc-500"
        : "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white";
    }
    if (isFun) {
      return isActive
        ? "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-xl font-black border-3 border-black bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-102"
        : "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-xl font-extrabold border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50";
    }
    // Sobre / Default
    return isActive
      ? "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-lg font-bold bg-zinc-950 text-white border-l-3 border-zinc-900 shadow-xs"
      : "w-full flex items-center justify-between px-3 py-1.5 text-xs font-sans rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-black";
  };

  const getTagBadgeClass = (tag: string, isActive: boolean) => {
    if (isDark) {
      return isActive
        ? "px-2.5 py-1 rounded text-[10px] font-bold bg-white text-black"
        : "px-2.5 py-1 rounded text-[10px] font-semibold border bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white";
    }
    if (isFun) {
      return isActive
        ? "px-2.5 py-1 rounded-xl text-[10px] font-black border-2 border-black bg-cyan-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-102"
        : "px-2.5 py-1 rounded-xl text-[10px] font-extrabold border-2 border-black bg-white text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100";
    }
    // Sobre / Default
    return isActive
      ? "px-2.5 py-1 rounded text-[10px] font-bold bg-zinc-950 text-white"
      : "px-2.5 py-1 rounded text-[10px] font-semibold border bg-white border-zinc-250 text-zinc-650 hover:border-zinc-400 hover:text-black";
  };

  const getRefreshButtonClass = () => {
    if (isDark) {
      return "w-full py-2 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all";
    }
    if (isFun) {
      return "w-full py-2 bg-yellow-300 text-black hover:bg-yellow-400 text-xs font-sans font-black border-3 border-black rounded-xl flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all";
    }
    // Sobre / Default
    return "w-full py-2 bg-zinc-900 text-white hover:bg-black text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs";
  };

  const logo = getLogoStyles();

  // Load from localStorage on mount and listen to subscription
  useEffect(() => {
    let unsubscribeSub: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (unsubscribeSub) {
        unsubscribeSub();
        unsubscribeSub = null;
      }

      if (user) {
        // Start listening to the subscription document in real-time
        unsubscribeSub = listenToSubscription(user.uid, (sub) => {
          setSubscription(sub);
        }, user.email || "");
      } else {
        setSubscription(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSub) unsubscribeSub();
    };
  }, []);

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem("infoperso_keys");
      if (storedKeys) setApiKeys(JSON.parse(storedKeys));

      const storedRib = localStorage.getItem("infoperso_rib");
      if (storedRib) setRibInfo(JSON.parse(storedRib));

      const storedSaved = localStorage.getItem("infoperso_saved");
      if (storedSaved) setSavedIds(new Set(JSON.parse(storedSaved)));

      const storedRead = localStorage.getItem("infoperso_read");
      if (storedRead) setReadIds(new Set(JSON.parse(storedRead)));
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // Sync back to localStorage
  const handleKeysChange = (newKeys: ApiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem("infoperso_keys", JSON.stringify(newKeys));
    triggerToast("Clés API mises à jour localement !");
  };

  const handleRibChange = (newRib: RibInfo) => {
    setRibInfo(newRib);
    localStorage.setItem("infoperso_rib", JSON.stringify(newRib));
  };

  const handleToggleSave = (id: number) => {
    const updated = new Set(savedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSavedIds(updated);
    localStorage.setItem("infoperso_saved", JSON.stringify(Array.from(updated)));
  };

  const handleMarkRead = (id: number) => {
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    localStorage.setItem("infoperso_read", JSON.stringify(Array.from(updated)));
  };

  const handleCompleteOnboarding = (title: string, categories: string[], startFresh: boolean) => {
    setCustomTitle(title);
    setCustomCategories(categories);
    setOnboardingCompleted(true);
    localStorage.setItem("infoperso_custom_title", title);
    localStorage.setItem("infoperso_custom_categories", JSON.stringify(categories));
    localStorage.setItem("infoperso_onboarding_completed", "true");
    
    if (startFresh) {
      localStorage.removeItem("infoperso_articles");
      triggerToast("🗑️ Flux d'articles réinitialisé à l'état neutre !");
      setTimeout(() => window.location.reload(), 800);
    } else {
      triggerToast("🎉 Votre base neutre a été configurée et appliquée !");
    }
  };

  const handleRefreshFlux = () => {
    triggerToast("Actualisation des flux terminés — 3 nouveaux articles trouvés ↻");
  };

  const TAG_COLORS_MAP: Record<string, { active: string; inactive: string }> = {
    "Claude API": { active: "bg-orange-500/15 border-orange-500/40 text-orange-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-orange-500/30 hover:text-orange-400" },
    "LLM": { active: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400" },
    "Occitanie": { active: "bg-rose-500/15 border-rose-500/40 text-rose-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-rose-500/30 hover:text-rose-400" },
    "Startup": { active: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400" },
    "React": { active: "bg-blue-500/15 border-blue-500/40 text-blue-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-blue-500/30 hover:text-blue-400" },
    "OpenAI": { active: "bg-teal-500/15 border-teal-500/40 text-teal-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-teal-500/30 hover:text-teal-400" },
    "Benchmark": { active: "bg-violet-500/15 border-violet-500/40 text-violet-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-violet-500/30 hover:text-violet-400" },
    "Design": { active: "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300", inactive: "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-fuchsia-500/30 hover:text-fuchsia-400" },
  };

  const SIDEBAR_CAT_COLORS: Record<string, { activeClass: string; hoverClass: string }> = {
    "Technologie": { activeClass: "bg-indigo-500/10 text-indigo-300 border-l-3 border-indigo-500 font-bold", hoverClass: "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5" },
    "IA": { activeClass: "bg-cyan-500/10 text-cyan-300 border-l-3 border-cyan-500 font-bold", hoverClass: "text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5" },
    "Économie": { activeClass: "bg-emerald-500/10 text-emerald-300 border-l-3 border-emerald-500 font-bold", hoverClass: "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5" },
    "Local": { activeClass: "bg-rose-500/10 text-rose-300 border-l-3 border-rose-500 font-bold", hoverClass: "text-slate-400 hover:text-rose-400 hover:bg-rose-500/5" },
    "Médias": { activeClass: "bg-violet-500/10 text-violet-300 border-l-3 border-violet-500 font-bold", hoverClass: "text-slate-400 hover:text-violet-400 hover:bg-violet-500/5" },
  };

  const currentT = TRANSLATIONS[language];

  return (
    <div 
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`h-screen overflow-hidden flex flex-col relative transition-colors duration-300 ${getThemeContainerClasses()} ${isEasyMode ? "easy-mode" : ""}`}
    >
      {/* Decorative colorful ambient background glows */}
      {isPro && (
        <>
          <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed top-1/4 right-0 w-[450px] h-[450px] bg-fuchsia-500/5 rounded-full blur-[110px] pointer-events-none z-0"></div>
          <div className="fixed -bottom-40 left-1/3 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none z-0"></div>
        </>
      )}
      {isWarm && (
        <>
          <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed top-1/4 right-0 w-[450px] h-[450px] bg-orange-500/3 rounded-full blur-[110px] pointer-events-none z-0"></div>
        </>
      )}
      {isCyber && (
        <>
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f29370d_1px,transparent_1px),linear-gradient(to_bottom,#1f29370d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0 opacity-20"></div>
          <div className="fixed -top-40 -left-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        </>
      )}
      {isFun && (
        <div className="fixed inset-0 bg-[radial-gradient(#818cf8_2px,transparent_2px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0"></div>
      )}

      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce-short ${
          isSobre ? "bg-zinc-950 text-white border border-zinc-800" :
          isWarm ? "bg-amber-950 text-amber-100 border border-amber-900" :
          isCyber ? "bg-black text-[#00ffcc] border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-mono" :
          isFun ? "bg-yellow-300 text-black border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
          "bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 text-white shadow-indigo-500/10"
        }`}>
          <Sparkles className={`w-4 h-4 animate-pulse ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400"}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className={`sticky top-0 z-40 transition-all duration-300 flex items-center justify-between ${
        isSobre ? `${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"} border-b min-h-[44px] sm:min-h-[52px] landscape:min-h-[36px] py-1 sm:py-1.5 landscape:py-0.5 px-2 sm:px-4 landscape:px-2 shadow-xs` :
        isWarm ? `${isDark ? "bg-[#2c2622] border-[#443830]" : "bg-[#FAF6F0] border-amber-900/15"} border-b min-h-[44px] sm:min-h-[52px] landscape:min-h-[36px] py-1 sm:py-1.5 landscape:py-0.5 px-2 sm:px-4 landscape:px-2 shadow-xs` :
        isCyber ? `${isDark ? "bg-black border-cyan-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.8)]" : "bg-[#f4fffe] border-[#0d9488]/30 shadow-md"} border-b min-h-[44px] sm:min-h-[52px] landscape:min-h-[36px] py-1 sm:py-1.5 landscape:py-0.5 px-2 sm:px-4 landscape:px-2` :
        isFun ? `${isDark ? "bg-[#252136]" : "bg-white"} border-2 border-black rounded-xl min-h-[44px] sm:min-h-[52px] landscape:min-h-[36px] py-0.5 sm:py-1 px-2 sm:px-3 landscape:px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] my-0.5 sm:my-1 mx-1` :
        `${isDark ? "bg-slate-900/85 border-indigo-500/20 shadow-indigo-950/20" : "bg-white/95 border-indigo-100 shadow-indigo-100/20"} backdrop-blur-md border-b min-h-[44px] sm:min-h-[52px] landscape:min-h-[36px] py-1 sm:py-1.5 landscape:py-0.5 px-2 sm:px-4 landscape:px-2 shadow-xs`
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 cursor-pointer transition-all ${
              isSobre ? isDark ? "bg-zinc-850 border border-zinc-750 text-zinc-300 hover:bg-zinc-800 rounded-lg" : "bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 rounded-lg text-zinc-700" :
              isWarm ? isDark ? "bg-[#382F2A] border border-amber-900/20 text-amber-250 hover:bg-[#4a3e36] rounded-lg" : "bg-amber-100/40 border border-amber-900/10 hover:bg-amber-100 rounded-lg text-amber-905" :
              isCyber ? isDark ? "bg-black border border-cyan-500/40 hover:bg-zinc-900 rounded-none text-cyan-400" : "bg-[#e0f2f1] border border-teal-500/30 text-teal-800 hover:bg-[#b2dfdb] rounded-none" :
              isFun ? "bg-cyan-300 border-2 border-black rounded-lg text-black hover:bg-cyan-200 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5" :
              isDark ? "bg-slate-950/60 border border-slate-800 hover:bg-slate-800/60 rounded-lg text-zinc-400 hover:text-white" : "bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg text-slate-700 hover:text-slate-950"
            }`}
          >
            {sidebarOpen ? (
              <X className={`w-4 h-4 ${isSobre ? isDark ? "text-zinc-200" : "text-zinc-900" : isWarm ? "text-amber-100" : isCyber ? "text-pink-500 animate-pulse" : isFun ? "text-black" : isDark ? "text-indigo-450" : "text-indigo-600"}`} />
            ) : (
              <Menu className={`w-4 h-4 ${isSobre ? isDark ? "text-zinc-100" : "text-zinc-950" : isWarm ? "text-amber-100" : isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : isDark ? "text-cyan-450" : "text-indigo-650"}`} />
            )}
          </button>

          <div
            onClick={() => {
              setActiveTab("flux");
              setActiveFilter(null);
              setActiveTag(null);
              setOnlySaved(false);
            }}
            className="flex items-center gap-1.5 cursor-pointer min-w-0 flex-1 sm:flex-initial"
          >
            <div className="min-w-0">
              <h1 className={`${logo.title} truncate max-w-[200px] sm:max-w-xs md:max-w-none text-sm sm:text-base`}>
                {customTitle || currentT.appName}
              </h1>
              <p className={`${logo.subtitle} truncate max-w-[200px] sm:max-w-xs md:max-w-none hidden sm:block landscape:hidden md:landscape:block`}>
                {customTitle ? currentT.tagline : (isDark ? "L'information à l'état pur" : isFun ? "BAM! TES INFOS ICI! 💥" : "L'information à l'état pur")}
              </p>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* EASY / BIG MODE TOGGLE BUTTON */}
          <button
            onClick={() => {
              const nextEasy = !isEasyMode;
              setIsEasyMode(nextEasy);
              localStorage.setItem("infoperso_easy_mode", String(nextEasy));
              triggerToast(`Mode Big : ${nextEasy ? "Activé" : "Désactivé"}`);
            }}
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 landscape:py-0.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isEasyMode
                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-250 dark:border-amber-900/30"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-850"
            }`}
            title="Agrandir la police et optimiser le contraste (Mode Big)"
          >
            <span>big</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isEasyMode ? "bg-emerald-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"}`}></span>
          </button>

          {/* FULLSCREEN TOGGLE BUTTON */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 landscape:py-0.5 rounded-lg cursor-pointer transition-all border text-xs font-bold bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-850"
            title="Activer ou désactiver le mode Plein Écran (Style F11)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-indigo-500 animate-pulse" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? "Fermer" : "Plein Écran"}</span>
          </button>

          {/* LIGHT / DARK THEME TOGGLE BUTTON */}
          <button
            onClick={() => {
              const nextTheme = themeMode === "dark" ? "light" : "dark";
              setThemeMode(nextTheme);
              localStorage.setItem("infoperso_theme_mode", nextTheme);
              triggerToast(`🌓 Mode ${nextTheme === "dark" ? "Sombre" : "Clair"} activé`);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border text-xs font-bold bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-850"
            title={themeMode === "dark" ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            {themeMode === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Jour</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="hidden sm:inline">Nuit</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* THIN LEVEL PROGRESS BAR */}
      <div className="w-full h-[1px] bg-zinc-200 dark:bg-zinc-800" />

      {/* WORKSPACE LAYOUT */}
      <div className="flex-1 flex min-h-0 relative z-10 overflow-hidden">
        {/* SIDEBAR BACKDROP */}
        {sidebarOpen && (
          <div
            className={`fixed inset-0 z-20 transition-all cursor-pointer ${
              isSobre ? isDark ? "top-[53px] bg-black/60 backdrop-blur-xs" : "top-[53px] bg-zinc-900/40 backdrop-blur-xs" :
              isWarm ? isDark ? "top-[53px] bg-black/60 backdrop-blur-xs" : "top-[53px] bg-amber-950/30 backdrop-blur-xs" :
              isFun ? "top-[58px] bg-slate-900/60" :
              isDark ? "top-[53px] bg-slate-950/75 backdrop-blur-xs" : "top-[53px] bg-slate-550/40 backdrop-blur-xs"
            }`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed top-[53px] bottom-0 left-0 z-30 w-60 p-4 space-y-6 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${
            isSobre ? isDark ? "bg-zinc-900 border-r border-zinc-800 text-zinc-200" : "bg-zinc-100/98 backdrop-blur-md border-r border-zinc-250 text-zinc-800" :
            isWarm ? isDark ? "bg-[#2c2622] border-r border-amber-950/30 text-[#FAF6F0] font-serif" : "bg-[#FAF6F0]/98 backdrop-blur-md border-r border-amber-900/15 text-amber-950 font-serif" :
            isCyber ? isDark ? "bg-black border-r border-cyan-500/30 text-cyan-400 font-mono shadow-[5px_0_15px_rgba(0,0,0,0.8)]" : "bg-[#f4fffe] border-r border-[#0d9488]/30 text-teal-900 font-mono shadow-[3px_0_10px_rgba(0,0,0,0.15)]" :
            isFun ? isDark ? "bg-[#252136] border-3 border-black border-t-0 text-white" : "bg-white border-3 border-black border-t-0 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-br-2xl" :
            isDark ? "bg-slate-950/95 backdrop-blur-md border-r border-indigo-500/15 text-slate-300" : "bg-white border-r border-indigo-100/50 text-slate-750 shadow-sm"
          }`}
        >
          {/* Main sections */}
          <div className="space-y-1.5">
            <span className="block text-xs uppercase tracking-[0.2em] font-bold px-2 text-zinc-550 dark:text-zinc-400">Navigation</span>

            <button
              onClick={() => {
                setActiveTab("flux");
                setOnlySaved(false);
                setActiveFilter(null);
                setActiveTag(null);
                setSidebarOpen(false);
              }}
              className={getNavButtonClass(activeTab === "flux" && !onlySaved && !activeFilter && !activeTag, "cyan")}
            >
              <span className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-500" />
                Mon flux d'actualités
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("flux");
                setOnlySaved(true);
                setActiveFilter(null);
                setActiveTag(null);
                setSidebarOpen(false);
              }}
              className={getNavButtonClass(activeTab === "flux" && onlySaved, "fuchsia")}
            >
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Articles sauvegardés
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-250 text-zinc-900 font-bold border border-zinc-350 dark:bg-zinc-800 dark:text-zinc-150 dark:border-zinc-700">
                {savedIds.size}
              </span>
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-1.5 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <span className="block text-xs uppercase tracking-[0.2em] font-bold px-2 text-zinc-550 dark:text-zinc-400">Catégories</span>
            {customCategories.map((cat) => {
              const isActive = activeTab === "flux" && activeFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab("flux");
                    setOnlySaved(false);
                    setActiveFilter(cat);
                    setActiveTag(null);
                    setSidebarOpen(false);
                  }}
                  className={getCatButtonClass(cat, isActive)}
                >
                  <span>{cat === "Local" ? "Local / Occitanie" : cat}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              );
            })}
          </div>

          {/* Active Tags */}
          <div className="space-y-2">
            <span className={`block text-[10px] uppercase tracking-[0.2em] font-bold px-2 ${isSobre ? isDark ? "text-zinc-400" : "text-zinc-500" : isWarm ? isDark ? "text-amber-200/60" : "text-amber-850/60" : isCyber ? isDark ? "text-[#00ffcc]/60" : "text-[#0d9488]/60" : isFun ? isDark ? "text-white" : "text-black font-extrabold" : isDark ? "text-cyan-400/60" : "text-indigo-500/70"}`}>Tags actifs</span>
            <div className="flex flex-wrap gap-1.5 px-1">
              {["Claude API", "LLM", "Occitanie", "Startup", "React", "OpenAI", "Benchmark", "Design"].map((tag) => {
                const isActive = activeTag === tag;

                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTab("flux");
                      setOnlySaved(false);
                      setActiveFilter(null);
                      setActiveTag(activeTag === tag ? null : tag);
                      setSidebarOpen(false);
                    }}
                    className={getTagBadgeClass(tag, isActive)}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`border-t pt-4 space-y-2 ${isSobre ? isDark ? "border-zinc-850" : "border-zinc-200" : isWarm ? isDark ? "border-[#4a3e36]" : "border-amber-900/10" : isCyber ? "border-cyan-500/25" : isFun ? "border-2 border-black" : "border-indigo-500/15"}`}>
            {/* Quick action button */}
            <button
              onClick={handleRefreshFlux}
              className={getRefreshButtonClass()}
            >
              <RefreshCw className={`w-3.5 h-3.5 animate-spin-slow ${isFun ? "text-black font-black" : isCyber ? "text-[#00ffcc]" : isSobre ? isDark ? "text-black" : "text-zinc-950" : isWarm ? isDark ? "text-[#251f1c]" : "text-amber-955" : isDark ? "text-cyan-400" : "text-indigo-600"}`} />
              Actualiser le flux
            </button>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className={`flex-1 p-2 sm:p-4 md:p-5 lg:p-6 landscape:p-1 landscape:sm:p-2 transition-all duration-300 ${
          activeTab === "chat"
            ? `${isFun ? "h-[calc(100vh-125px)]" : "h-[calc(100vh-88px)]"} overflow-hidden flex flex-col`
            : "overflow-y-auto"
        }`}>
          {activeTab === "flux" && (
            <div className="space-y-6">
              <NewsFeed
                apiKeys={apiKeys}
                savedIds={savedIds}
                readIds={readIds}
                onToggleSave={handleToggleSave}
                onMarkRead={handleMarkRead}
                activeFilter={activeFilter}
                activeTag={activeTag}
                onNotify={triggerToast}
                onClearFilters={() => {
                  setActiveFilter(null);
                  setActiveTag(null);
                }}
                onNavigateToTab={setActiveTab}
                displayMode={displayMode}
                themeMode={themeMode}
                curiosityScore={curiosityScore}
                stats={stats}
                unlockedBadges={unlockedBadges}
                passiveSignalsSettings={passiveSignalsSettings}
                onAwardCuriosityPoints={handleAwardCuriosityPoints}
              />
            </div>
          )}

          {activeTab === "chat" && (
            <MultiChat apiKeys={apiKeys} onNotify={triggerToast} themeMode={themeMode} />
          )}

          {activeTab === "keys" && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <KeysConfig keys={apiKeys} onKeysChange={handleKeysChange} displayMode={displayMode} themeMode={themeMode} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemeCustomizer themeMode={themeMode} displayMode={displayMode} onNotify={triggerToast} />
                <RemixSynchronizer
                  language={language}
                  onNotify={triggerToast}
                  onImport={(imported) => {
                    if (imported.customTitle) {
                      setCustomTitle(imported.customTitle);
                      localStorage.setItem("infoperso_custom_title", imported.customTitle);
                    }
                    if (imported.customCategories) {
                      setCustomCategories(imported.customCategories);
                      localStorage.setItem("infoperso_custom_categories", JSON.stringify(imported.customCategories));
                    }
                    if (imported.keys) {
                      setApiKeys(imported.keys);
                      localStorage.setItem("infoperso_keys", JSON.stringify(imported.keys));
                    }
                    if (imported.displayMode) {
                      setDisplayMode(imported.displayMode);
                      localStorage.setItem("infoperso_display_mode", imported.displayMode);
                    }
                    if (imported.articles) {
                      localStorage.setItem("infoperso_articles", JSON.stringify(imported.articles));
                    }
                    setOnboardingCompleted(true);
                    localStorage.setItem("infoperso_onboarding_completed", "true");
                    
                    triggerToast("⚡ Synchronisation importée avec succès !");
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "donations" && (
            <DonationSection rib={ribInfo} onRibChange={handleRibChange} onNotify={triggerToast} displayMode={displayMode} themeMode={themeMode} />
          )}

          {activeTab === "communaute" && (
            <CommunitySpace 
              onNotify={triggerToast} 
              onAwardCuriosityPoints={handleAwardCuriosityPoints}
              displayMode={displayMode}
              themeMode={themeMode}
            />
          )}

          {activeTab === "auth" && (
            <div className="py-6 sm:py-10 max-w-lg mx-auto">
              <UserAuth onNotify={triggerToast} onClose={() => setActiveTab("flux")} themeMode={themeMode} />
            </div>
          )}

          {activeTab === "shortcuts" && (
            <ShortcutsGuide
              language={language}
              displayMode={displayMode}
              themeMode={themeMode}
              onNotify={triggerToast}
            />
          )}

          {/* PROFESSIONAL FOOTER inside scrollable main container */}
          {activeTab !== "chat" && (
            <footer className={`mt-12 py-6 px-4 text-center text-xs font-sans flex flex-col sm:flex-row items-center justify-between gap-3 border-t shrink-0 ${
              isSobre ? isDark ? "bg-zinc-950/40 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-500" :
              isWarm ? isDark ? "bg-[#1f1a18]/40 border-[#443830] text-amber-250/50" : "bg-[#f5ebd9]/60 border-amber-900/10 text-amber-900/70" :
              isCyber ? isDark ? "bg-black/40 border-cyan-500/25 text-[#00ffcc]/70" : "bg-[#f4fffe]/60 border-teal-500/35 text-teal-850" :
              isFun ? isDark ? "bg-[#211d32] border-t-3 border-black text-pink-300" : "bg-white border-t-3 border-black text-black" :
              isDark ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-white/95 border-slate-200 text-slate-600 shadow-xs"
            }`}>
              <p>© 2026 InfoPerso. Tous droits réservés. Vos clés de connexion sont stockées de façon sécurisée.</p>
              <div className="flex items-center gap-3 justify-center sm:justify-end">
                <button onClick={() => setActiveTab("keys")} className="hover:text-violet-400 transition-colors font-medium cursor-pointer">
                  Clés API
                </button>
                <span className="opacity-40">•</span>
                <button onClick={() => setActiveTab("donations")} className="hover:text-rose-400 transition-colors flex items-center gap-1 font-medium cursor-pointer">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  RIB & Dons
                </button>
              </div>
            </footer>
          )}
        </main>
      </div>

      {/* USER PROFILE DRAWER */}
      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        displayMode={displayMode}
        themeMode={themeMode}
        curiosityScore={curiosityScore}
        stats={stats}
        unlockedBadges={unlockedBadges}
        onNotify={triggerToast}
        passiveSignalsSettings={passiveSignalsSettings}
        onToggleSignalSetting={handleToggleSignalSetting}
        onResetProgress={handleResetProgress}
        subscription={subscription}
        currentUser={currentUser}
        onNavigateToTab={setActiveTab}
      />

      {/* SPOTLIGHT SYSTEM COMMAND BAR */}
      <SpotlightCommandBar
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        language={language}
        setLanguage={setLanguage}
        onNavigate={setActiveTab}
        articles={[]}
        onSelectArticle={(art) => {
          setActiveTab("flux");
          triggerToast(`📖 Article : ${art.title}`);
        }}
        displayMode={displayMode}
        setDisplayMode={(mode) => {
          setDisplayMode(mode);
          localStorage.setItem("infoperso_display_mode", mode);
        }}
      />
    </div>
  );
}
