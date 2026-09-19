import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Award, BarChart3, Clock, Share2, HelpCircle, 
  Flame, BookOpen, Layers, CheckCircle, RefreshCw, Zap, Sliders,
  Crown, CreditCard, Check, Lock, Smartphone, Terminal, UserCheck,
  Cloud, Monitor, Tablet
} from "lucide-react";
import { 
  SubscriptionStatus, 
  CONNECTED_APPS, 
  subscribeUser, 
  simulateExpiry, 
  resetToFree 
} from "../lib/subscriptionService";

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  unlockedAt: number;
}

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  displayMode: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
  curiosityScore: number;
  stats: {
    articlesReadCount: number;
    articlesSharedCount: number;
    quizzesCompleted: number;
    quizScoreSum: number;
    categoriesExplored: string[];
    readCountByCat: Record<string, number>;
  };
  unlockedBadges: string[];
  onNotify: (msg: string) => void;
  // Passive signal settings toggles
  passiveSignalsSettings: {
    trackReadingTime: boolean;
    trackScrollDepth: boolean;
    trackReReading: boolean;
    trackCategoryWeights: boolean;
  };
  onToggleSignalSetting: (key: string) => void;
  onResetProgress: () => void;
  subscription: SubscriptionStatus | null;
  currentUser: any;
  onNavigateToTab?: (tab: "flux" | "chat" | "donations" | "keys" | "communaute" | "auth") => void;
}

export default function UserProfileDrawer({
  isOpen,
  onClose,
  displayMode,
  themeMode = "dark",
  curiosityScore,
  stats,
  unlockedBadges,
  onNotify,
  passiveSignalsSettings,
  onToggleSignalSetting,
  onResetProgress,
  subscription,
  currentUser,
  onNavigateToTab
}: UserProfileDrawerProps) {
  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isPro = displayMode === "pro";
  const isDark = themeMode === "dark";

  // Simulated subscription states
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [simLoading, setSimLoading] = useState(false);

  // Level computation: 20 points per level
  const pointsPerLevel = 20;
  const currentLevel = Math.floor(curiosityScore / pointsPerLevel) + 1;
  const pointsInCurrentLevel = curiosityScore % pointsPerLevel;
  const progressPercent = Math.min((pointsInCurrentLevel / pointsPerLevel) * 100, 100);

  // Pre-configured Badges definitions
  const ALL_BADGES: Badge[] = [
    { id: "ia-explorer", name: "Pionnier de l'IA", description: "A lu 5 articles de la catégorie IA.", category: "IA", icon: "🤖", unlockedAt: 0 },
    { id: "tech-enthusiast", name: "Technophile", description: "A lu 5 articles de la catégorie Technologie.", category: "Technologie", icon: "⚡", unlockedAt: 0 },
    { id: "local-citizen", name: "Explorateur Local", description: "A lu 3 articles d'actualités Locales.", category: "Local", icon: "📍", unlockedAt: 0 },
    { id: "design-connoisseur", name: "Esthète", description: "A lu 3 articles sur le Design ou l'esthétique.", category: "Design", icon: "🎨", unlockedAt: 0 },
    { id: "quiz-master", name: "Esprit Critique", description: "A réussi 3 quiz de compréhension.", category: "Quiz", icon: "🧠", unlockedAt: 0 },
    { id: "social-curator", name: "Mécène de l'Info", description: "A partagé 3 articles avec la communauté.", category: "Partage", icon: "📢", unlockedAt: 0 },
    { id: "omnivore-reader", name: "Lecteur Omnivore", description: "A exploré au moins 5 catégories différentes.", category: "Exploration", icon: "🌍", unlockedAt: 0 },
  ];

  // Drawer styling
  const getDrawerBg = () => {
    if (isSobre) return isDark ? "bg-zinc-900 border-l border-zinc-800 text-zinc-100" : "bg-white border-l border-zinc-200 text-zinc-900";
    if (isWarm) return isDark ? "bg-[#251e1a] border-l border-[#3e322a] text-[#FAF6F0] font-serif" : "bg-[#FAF6F0] border-l border-amber-900/15 text-amber-955 font-serif";
    if (isCyber) return isDark ? "bg-black border-l border-cyan-500/30 text-[#00ffcc] font-mono" : "bg-[#f2fdfc] border-l border-[#0d9488]/30 text-[#0d9488] font-mono";
    if (isFun) return isDark ? "bg-[#211d32] border-l-4 border-black text-white font-sans" : "bg-[#FFFCEB] border-l-4 border-black text-black font-sans";
    return isDark ? "bg-[#0b0c13]/95 backdrop-blur-xl border-l border-indigo-500/20 text-slate-200" : "bg-white/95 backdrop-blur-xl border-l border-indigo-150 text-slate-800";
  };

  const getCardStyle = () => {
    if (isSobre) return isDark ? "bg-zinc-850 border border-zinc-800 p-4 rounded-lg" : "bg-zinc-50 border border-zinc-200 p-4 rounded-lg";
    if (isWarm) return isDark ? "bg-[#352b24] border border-amber-955/40 p-4 rounded-xl" : "bg-[#F5EFE6] border border-amber-900/10 p-4 rounded-xl";
    if (isCyber) return isDark ? "bg-zinc-950 border border-cyan-500/20 p-4 rounded-none shadow-[0_0_10px_rgba(6,182,212,0.1)]" : "bg-[#f2fdfc] border border-teal-500/30 p-4 rounded-none shadow-[0_0_10px_rgba(13,148,136,0.08)] text-teal-900";
    if (isFun) return isDark ? "bg-[#322a48] border-3 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-white border-3 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
    return isDark ? "bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xs" : "bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl backdrop-blur-xs text-slate-850";
  };

  // Badge Visual Styles depending on the Theme
  const getBadgeVisual = (badge: Badge, isUnlocked: boolean) => {
    const activeClass = isUnlocked ? "opacity-100" : "opacity-30 grayscale saturate-50";
    
    if (isSobre) {
      return (
        <div className={`flex items-center gap-3 p-3 border rounded-md transition-all ${activeClass} ${isUnlocked ? "bg-zinc-50 border-zinc-400" : "bg-zinc-100 border-zinc-200"}`}>
          <div className="text-2xl">{badge.icon}</div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-zinc-900">{badge.name}</h4>
            <p className="text-[10px] text-zinc-500 leading-tight">{badge.description}</p>
          </div>
          {isUnlocked && <span className="ml-auto text-[10px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-sm">Débloqué</span>}
        </div>
      );
    }

    if (isWarm) {
      return (
        <div className={`flex items-center gap-3 p-3 border rounded-lg transition-all font-serif ${activeClass} ${isUnlocked ? "bg-[#FAF6F0] border-amber-900/30 shadow-xs" : "bg-amber-100/10 border-amber-900/5"}`}>
          <div className="text-3xl p-1 bg-amber-100 rounded-full">{badge.icon}</div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-amber-950">{badge.name}</h4>
            <p className="text-[10px] text-amber-800 leading-tight italic">{badge.description}</p>
          </div>
          {isUnlocked && <span className="ml-auto text-[10px] border border-amber-800/40 text-amber-900 px-2 py-0.5 rounded-full bg-amber-50">Sceau</span>}
        </div>
      );
    }

    if (isCyber) {
      return (
        <div className={`flex items-center gap-3 p-3 border transition-all font-mono ${activeClass} ${isUnlocked ? "bg-black border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)] text-pink-500" : "bg-zinc-950 border-zinc-800 text-zinc-600"}`}>
          <div className="text-2xl animate-pulse">{badge.icon}</div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs tracking-tight">{badge.name}</h4>
            <p className="text-[10px] text-white/55 leading-tight">{badge.description}</p>
          </div>
          {isUnlocked && <span className="ml-auto text-[9px] border border-pink-500/50 text-pink-400 px-1 py-0.5 animate-pulse">SYS_UNLOCKED</span>}
        </div>
      );
    }

    if (isFun) {
      return (
        <div className={`flex items-center gap-3 p-3 border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${activeClass} ${isUnlocked ? "bg-yellow-300" : "bg-white"}`}>
          <div className="text-3xl rotate-6 hover:rotate-12 transition-transform">{badge.icon}</div>
          <div className="min-w-0">
            <h4 className="font-black text-xs uppercase italic text-black">{badge.name}</h4>
            <p className="text-[10px] text-black/80 leading-tight font-extrabold">{badge.description}</p>
          </div>
          {isUnlocked && <span className="ml-auto text-[10px] bg-black text-white font-black px-2 py-0.5 rounded-md -rotate-6 uppercase">YEAH!</span>}
        </div>
      );
    }

    // Default: Pro (sleek gradient / neon indigo glow)
    return (
      <div className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${activeClass} ${isUnlocked ? "bg-slate-900/60 border-indigo-500/40 shadow-md shadow-indigo-500/5" : "bg-slate-950/20 border-slate-900 text-slate-500"}`}>
        <div className="text-2xl p-1 bg-slate-950/50 rounded-lg border border-slate-800">{badge.icon}</div>
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-white">{badge.name}</h4>
          <p className="text-[10px] text-slate-400 leading-tight">{badge.description}</p>
        </div>
        {isUnlocked && (
          <span className="ml-auto text-[9px] bg-linear-to-r from-cyan-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
            PRO_LVL
          </span>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* SLIDING PANEL */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={`fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col shadow-2xl overflow-y-auto ${getDrawerBg()}`}
          >
            {/* PANEL HEADER */}
            <div className={`p-5 flex items-center justify-between border-b ${
              isSobre ? "border-zinc-200" :
              isWarm ? "border-amber-900/10" :
              isCyber ? "border-cyan-500/20" :
              isFun ? "border-3 border-black bg-cyan-300" :
              "border-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 ${isCyber ? "text-pink-500" : isFun ? "text-black fill-yellow-400" : isWarm ? "text-amber-800" : "text-indigo-400"}`} />
                <h2 className={`font-bold text-lg ${isFun ? "font-black uppercase tracking-tight italic" : ""}`}>
                  Mon Profil Lecteur
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-all ${
                  isSobre ? "bg-zinc-100" :
                  isWarm ? "bg-amber-150/50" :
                  isCyber ? "border border-cyan-400/50 text-cyan-400" :
                  isFun ? "bg-white border-2 border-black" :
                  "bg-slate-900 border border-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PANEL BODY */}
            <div className="p-5 flex-1 space-y-6">
              {/* CROSS-DEVICE SYNC CARD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                currentUser
                  ? isDark 
                    ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200" 
                    : "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                  : isDark 
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" 
                    : "bg-zinc-100 border-zinc-200 text-zinc-600"
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentUser 
                      ? "bg-indigo-500/20 text-indigo-400" 
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold truncate text-[11px]">
                        {currentUser ? "Compte Synchronisé" : "Compte Hors-Ligne"}
                      </p>
                      {currentUser && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] opacity-75 truncate">
                      {currentUser ? `${currentUser.email} • PC, Tablette, Mobile` : "Synchronisez vos favoris et scores sur tous vos écrans"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToTab) onNavigateToTab("auth");
                  }}
                  className="px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 ml-2 transition-all cursor-pointer shadow-xs"
                >
                  {currentUser ? "Gérer" : "Connexion"}
                </button>
              </div>

              {/* HERO SCORE & LEVEL PROGRESS */}
              <div className={getCardStyle()}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase opacity-75">Score de Curiosité</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-extrabold ${isFun ? "text-fuchsia-600 font-black italic" : isCyber ? "text-[#00ffcc]" : "text-indigo-400"}`}>
                        {curiosityScore}
                      </span>
                      <span className="text-xs opacity-70">pts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] tracking-widest uppercase opacity-75">Niveau Lecteur</span>
                    <div className="text-xl font-bold">
                      {isCyber ? `LVL.${currentLevel}` : isFun ? `NIV. ${currentLevel} 💥` : `Niveau ${currentLevel}`}
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[10px] opacity-70">
                    <span>Progrès Niveau Suivant</span>
                    <span>{pointsInCurrentLevel} / {pointsPerLevel} pts ({Math.round(progressPercent)}%)</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    isSobre ? "bg-zinc-200" : isWarm ? "bg-amber-900/10" : isCyber ? "bg-zinc-900 border border-cyan-500/25" : "bg-slate-950"
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSobre ? "bg-zinc-900" :
                        isWarm ? "bg-amber-900" :
                        isCyber ? "bg-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.6)]" :
                        isFun ? "bg-fuchsia-500 border-r-2 border-black" :
                        "bg-linear-to-r from-cyan-400 via-indigo-500 to-violet-500"
                      }`} 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* SHARED MULTI-APP SUBSCRIPTION WIDGET */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isFun ? "font-black" : ""}`}>
                    <Crown className="w-4 h-4 text-amber-500 animate-bounce" />
                    Abonnement Unique Multi-App
                  </h3>
                  {subscription?.status === "active" ? (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      ACTIF (PARTAGÉ)
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-mono font-bold">
                      OFFRE GRATUITE
                    </span>
                  )}
                </div>

                <div className={getCardStyle()}>
                  {!currentUser ? (
                    <div className="text-center py-4 space-y-3">
                      <Lock className="w-8 h-8 mx-auto text-zinc-500 opacity-60" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold">Abonnement non disponible hors ligne</p>
                        <p className="text-[10px] opacity-75">Connectez-vous pour activer l'abonnement partagé sur l'ensemble de vos applications remixes.</p>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          if (onNavigateToTab) onNavigateToTab("auth");
                        }}
                        className={`w-full py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          isSobre ? "bg-zinc-950 text-white hover:bg-black" :
                          isWarm ? "bg-amber-900 text-white hover:bg-amber-950" :
                          isCyber ? "bg-cyan-500 text-black font-mono hover:bg-cyan-400" :
                          isFun ? "bg-yellow-300 border-2 border-black text-black hover:bg-yellow-400" :
                          "bg-indigo-650 hover:bg-indigo-550 text-white shadow-xs"
                        }`}
                      >
                        Créer un compte ou se connecter
                      </button>
                    </div>
                  ) : subscription?.status === "active" ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-black flex items-center gap-1 text-amber-500">
                            Premium Multi-App 👑
                          </p>
                          <p className="text-[10px] opacity-80">
                            Propulsé par Firebase • ID : <span className="font-mono">{currentUser.uid.substring(0, 8)}...</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-bold border border-emerald-500/25">
                            Partagé (Tous vos Remixes)
                          </span>
                        </div>
                      </div>

                      {/* Apps sync status visualizer */}
                      <div className="space-y-2 border-y py-3 border-zinc-800/20">
                        <p className="text-[10px] font-bold tracking-wider uppercase opacity-75 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                          Statut de Synchronisation Réseau :
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 pl-1">
                          {CONNECTED_APPS.map((app, i) => {
                            const isCurrent = i === 0;
                            return (
                              <div key={i} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className={isCurrent ? "font-bold text-indigo-400" : "opacity-90"}>
                                    {app} {isCurrent && " (Cette app)"}
                                  </span>
                                </div>
                                <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-400" /> Connecté
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expiration date */}
                      <div className="flex justify-between items-center text-[10px] opacity-85 bg-zinc-950/20 p-2 rounded border border-zinc-800/10">
                        <span>Échéance / Renouvellement :</span>
                        <span className="font-bold text-emerald-400">
                          {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          }) : "Jamais"}
                        </span>
                      </div>

                      {/* Developer Sandbox Testing Controls */}
                      <div className="pt-2 border-t border-zinc-800/20 space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" />
                          Simulateur Multi-App (Test Sandbox) :
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={async () => {
                              try {
                                setSimLoading(true);
                                await simulateExpiry(currentUser.uid, currentUser.email || "");
                                onNotify("⚠️ Simulation : Abonnement expiré sur toutes les instances !");
                              } catch (err: any) {
                                onNotify("Erreur de simulation : " + err.message);
                              } finally {
                                setSimLoading(false);
                              }
                            }}
                            disabled={simLoading}
                            className="py-1 px-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 rounded text-[9px] border border-red-500/20 font-bold cursor-pointer transition-colors"
                          >
                            Simuler Expiration
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                setSimLoading(true);
                                await resetToFree(currentUser.uid, currentUser.email || "");
                                onNotify("♻️ Simulation : Retour au forfait gratuit (résilié) !");
                              } catch (err: any) {
                                onNotify("Erreur de simulation : " + err.message);
                              } finally {
                                setSimLoading(false);
                              }
                            }}
                            disabled={simLoading}
                            className="py-1 px-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded text-[9px] border border-zinc-700 font-bold cursor-pointer transition-colors"
                          >
                            Réinitialiser à Gratuit
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-zinc-400">
                            {subscription?.status === "expired" ? "🚨 Abonnement Expiré" : "Forfait Découverte Gratuit"}
                          </p>
                          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Multi-App Illimité
                          </span>
                        </div>
                        <p className="text-[10px] opacity-75">
                          Débloquez l'accès premium intégral sur **cette application** ainsi que sur l'ensemble de vos **remixes d'applications** actuels et futurs.
                        </p>
                      </div>

                      {/* Expandable Simulated Credit Card Form */}
                      {!isSubscribing ? (
                        <button
                          onClick={() => setIsSubscribing(true)}
                          className={`w-full py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                            isSobre ? "bg-zinc-950 text-white" :
                            isWarm ? "bg-amber-900 text-white" :
                            isCyber ? "bg-cyan-500 text-black font-mono" :
                            isFun ? "bg-fuchsia-400 border-3 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                            "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/10"
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Devenir Premium Multi-App (Promo: 10€ les 3 mois, puis 5€/mois)
                        </button>
                      ) : (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!cardNumber || !cardExpiry || !cardCvc) {
                              onNotify("⚠️ Veuillez renseigner toutes les informations bancaires.");
                              return;
                            }
                            setSimLoading(true);
                            try {
                              await subscribeUser(
                                currentUser.uid,
                                currentUser.email || "",
                                "InfoPerso Master"
                              );
                              onNotify("👑 Félicitations ! Votre abonnement unique (10€ pour 3 mois, puis 5€/mois) est actif sur l'ensemble de vos remixes ! 🎉");
                              setIsSubscribing(false);
                              setCardNumber("");
                              setCardExpiry("");
                              setCardCvc("");
                            } catch (err: any) {
                              onNotify("Erreur de paiement : " + err.message);
                            } finally {
                              setSimLoading(false);
                            }
                          }}
                          className="space-y-3 bg-black/15 p-3 rounded border border-zinc-800/10 mt-1"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-zinc-850/10">
                            <span className="text-[10px] font-bold tracking-wide uppercase text-zinc-400 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Passerelle de Paiement Sécurisée
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsSubscribing(false)}
                              className="text-[9px] hover:underline text-zinc-400"
                            >
                              Annuler
                            </button>
                          </div>

                          <div className="space-y-2 text-left">
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider opacity-75 mb-0.5">Numéro de Carte Simulé</label>
                              <input
                                type="text"
                                placeholder="4242 •••• •••• 4242"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className={`w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-hidden focus:border-amber-500`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider opacity-75 mb-0.5">Expiration</label>
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className={`w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-hidden focus:border-amber-500`}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider opacity-75 mb-0.5">CVC</label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  value={cardCvc}
                                  onChange={(e) => setCardCvc(e.target.value)}
                                  className={`w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-hidden focus:border-amber-500`}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={simLoading}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            {simLoading ? "Validation en cours..." : "Simuler Paiement Unique"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILED STATS GRID */}
              <div className="space-y-2">
                <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isFun ? "font-black" : ""}`}>
                  <BarChart3 className="w-4 h-4" />
                  Statistiques de Curation
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`${getCardStyle()} py-3 px-4 flex items-center gap-2.5`}>
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs opacity-75">Articles Lus</div>
                      <div className="font-extrabold text-base">{stats.articlesReadCount}</div>
                    </div>
                  </div>

                  <div className={`${getCardStyle()} py-3 px-4 flex items-center gap-2.5`}>
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs opacity-75">Partages</div>
                      <div className="font-extrabold text-base">{stats.articlesSharedCount}</div>
                    </div>
                  </div>

                  <div className={`${getCardStyle()} py-3 px-4 flex items-center gap-2.5`}>
                    <CheckCircle className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="text-xs opacity-75">Quiz Finis</div>
                      <div className="font-extrabold text-base">{stats.quizzesCompleted}</div>
                    </div>
                  </div>

                  <div className={`${getCardStyle()} py-3 px-4 flex items-center gap-2.5`}>
                    <Layers className="w-4 h-4 text-violet-400" />
                    <div>
                      <div className="text-xs opacity-75">Catégories</div>
                      <div className="font-extrabold text-base">{stats.categoriesExplored.length} / 6</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BADGES SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isFun ? "font-black" : ""}`}>
                    <Award className="w-4 h-4 text-yellow-400" />
                    Mes Badges Débloqués
                  </h3>
                  <span className="text-[10px] opacity-70 font-mono">({unlockedBadges.length} / {ALL_BADGES.length})</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {ALL_BADGES.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return <div key={badge.id}>{getBadgeVisual(badge, isUnlocked)}</div>;
                  })}
                </div>
              </div>

              {/* PASSIVE SIGNALS PREFERENCES */}
              <div className="space-y-3 pt-2">
                <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isFun ? "font-black" : ""}`}>
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Signaux Passifs de l'Algorithme
                </h3>
                <p className="text-[10px] opacity-75 leading-tight">
                  L'algorithme InfoPerso affine vos recommandations de manière transparente d'après vos comportements de lecture. Vous pouvez désactiver certains signaux passifs à tout moment :
                </p>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                    <span className="opacity-80">Suivi du temps de lecture (plus de 60s / moins de 10s)</span>
                    <input 
                      type="checkbox" 
                      checked={passiveSignalsSettings.trackReadingTime} 
                      onChange={() => onToggleSignalSetting("trackReadingTime")}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                    <span className="opacity-80">Suivi du défilement (profondeur de lecture &gt; 80%)</span>
                    <input 
                      type="checkbox" 
                      checked={passiveSignalsSettings.trackScrollDepth} 
                      onChange={() => onToggleSignalSetting("trackScrollDepth")}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                    <span className="opacity-80">Détection de relecture d'articles</span>
                    <input 
                      type="checkbox" 
                      checked={passiveSignalsSettings.trackReReading} 
                      onChange={() => onToggleSignalSetting("trackReReading")}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                    <span className="opacity-80">Ajustement du poids des catégories par Swipe</span>
                    <input 
                      type="checkbox" 
                      checked={passiveSignalsSettings.trackCategoryWeights} 
                      onChange={() => onToggleSignalSetting("trackCategoryWeights")}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* RESET BUTTON */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (confirm("Voulez-vous vraiment réinitialiser vos scores, statistiques et badges de curiosité ?")) {
                      onResetProgress();
                      onNotify("♻️ Profil réinitialisé avec succès !");
                    }
                  }}
                  className={`w-full py-2 px-3 text-center text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                    isSobre ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" :
                    isWarm ? "bg-red-100/30 hover:bg-red-100/60 text-red-900 border border-red-900/10 font-serif" :
                    isCyber ? "border border-pink-500 hover:bg-pink-500/15 text-pink-500 font-mono" :
                    isFun ? "bg-rose-400 hover:bg-rose-300 text-black border-2 border-black font-black" :
                    "bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400"
                  }`}
                >
                  Réinitialiser tous les scores de curiosité et badges
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
