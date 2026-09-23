import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NewsArticle, RssFeedSource } from "../types";
import {
  Rss,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Globe,
  Radio
} from "lucide-react";

interface RssOpmlManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportArticles: (articles: NewsArticle[]) => void;
  isDark: boolean;
  onNotify: (msg: string) => void;
}

const DEFAULT_CURATED_FEEDS: RssFeedSource[] = [
  {
    id: "figaro-actu",
    title: "Le Figaro Actualités",
    url: "https://www.lefigaro.fr/rss/figaro_actualites.xml",
    category: "Actualité",
    icon: "📰",
    isActive: true
  },
  {
    id: "canard-enchaine",
    title: "Le Canard Enchaîné",
    url: "https://www.lecanardenchaine.fr/rss/index.xml",
    category: "Actualité",
    icon: "🦆",
    isActive: true
  },
  {
    id: "lesechos-eco",
    title: "Les Échos - Économie",
    url: "https://services.lesechos.fr/rss/les-echos-economie.xml",
    category: "Économie",
    icon: "💼",
    isActive: true
  },
  {
    id: "frandroid",
    title: "Frandroid - Tech & Mobile",
    url: "https://www.frandroid.com/feed",
    category: "Technologie",
    icon: "📱",
    isActive: true
  },
  {
    id: "techcrunch",
    title: "TechCrunch Global",
    url: "https://techcrunch.com/feed/",
    category: "Technologie",
    icon: "🚀",
    isActive: false
  },
  {
    id: "futura-sciences",
    title: "Futura Sciences",
    url: "https://www.futura-sciences.com/rss/actualites.xml",
    category: "Science",
    icon: "🔬",
    isActive: true
  },
  {
    id: "courrier-intl",
    title: "Courrier International",
    url: "https://www.courrierinternational.com/feed/all/rss.xml",
    category: "Monde",
    icon: "🌍",
    isActive: false
  }
];

export const RssOpmlManagerModal: React.FC<RssOpmlManagerModalProps> = ({
  isOpen,
  onClose,
  onImportArticles,
  isDark,
  onNotify
}) => {
  const [feeds, setFeeds] = useState<RssFeedSource[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_user_rss_feeds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((f: RssFeedSource) => {
            let u = (f.url || "").trim();
            if (u.includes("wwww.")) {
              u = u.replace("wwww.", "www.");
            }
            if (/xn--lecannardenchan|xn--lecanardenchan|lecannardenchaine|lecanardenchaine/i.test(u)) {
              return { ...f, title: "Le Canard Enchaîné", url: "https://www.lecanardenchaine.fr/rss/index.xml", icon: "🦆" };
            }
            return { ...f, url: u };
          });
        }
      }
    } catch {}
    return DEFAULT_CURATED_FEEDS;
  });

  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Actualité");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("infoperso_user_rss_feeds", JSON.stringify(feeds));
    } catch {}
  }, [feeds]);

  const toggleFeedActive = (id: string) => {
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const removeFeed = (id: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    onNotify("Flux RSS supprimé.");
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let cleanUrl = newUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    cleanUrl = cleanUrl.replace(/^(https?:\/\/)+wwww\./i, "$1www.");

    let title = newTitle.trim();
    let icon = "📡";

    if (/xn--lecannardenchan|xn--lecanardenchan|lecannardenchaine|lecanardenchaine/i.test(cleanUrl) || /canard.*encha/i.test(title)) {
      cleanUrl = "https://www.lecanardenchaine.fr/rss/index.xml";
      if (!title) title = "Le Canard Enchaîné";
      icon = "🦆";
    }

    if (!title) {
      try {
        title = new URL(cleanUrl).hostname.replace("www.", "");
      } catch {
        title = "Flux RSS";
      }
    }
    const newSource: RssFeedSource = {
      id: `custom-${Date.now()}`,
      title,
      url: cleanUrl,
      category: newCategory,
      icon,
      isActive: true
    };

    setFeeds((prev) => [newSource, ...prev]);
    setNewUrl("");
    setNewTitle("");
    onNotify(`✨ Flux "${title}" ajouté avec succès !`);
  };

  // Import OPML file handler
  const handleOpmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        // Parse XML outline tags
        const regex = /<outline[^>]+xmlUrl=["']([^"']+)["'][^>]*(?:title=["']([^"']+)["']|text=["']([^"']+)["'])?[^>]*>/gi;
        const imported: RssFeedSource[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          const url = match[1];
          const title = match[2] || match[3] || "Flux OPML";
          if (url && !feeds.some((f) => f.url === url)) {
            imported.push({
              id: `opml-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title,
              url,
              category: "Actualité",
              icon: "📁",
              isActive: true
            });
          }
        }

        if (imported.length > 0) {
          setFeeds((prev) => [...imported, ...prev]);
          onNotify(`🎉 ${imported.length} flux importés depuis votre fichier OPML !`);
        } else {
          onNotify("⚠️ Aucun flux RSS valide trouvé dans ce fichier OPML.");
        }
      } catch (err) {
        console.error(err);
        onNotify("⚠️ Erreur lors de la lecture du fichier OPML.");
      }
    };
    reader.readAsText(file);
  };

  // Sync and fetch articles from active feeds via /api/rss/fetch
  const handleSyncActiveFeeds = async () => {
    const activeFeeds = feeds.filter((f) => f.isActive);
    if (activeFeeds.length === 0) {
      onNotify("⚠️ Aucun flux actif sélectionné.");
      return;
    }

    setIsLoading(true);
    setSyncStatus("Connexion aux flux RSS en cours...");

    const allNewArticles: NewsArticle[] = [];
    let successCount = 0;

    for (const feed of activeFeeds.slice(0, 5)) {
      try {
        setSyncStatus(`Récupération de : ${feed.title}...`);
        const res = await fetch("/api/rss/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: feed.url })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            successCount++;
            data.items.slice(0, 6).forEach((item: any, idx: number) => {
              const articleId = Date.now() + Math.floor(Math.random() * 1000000) + idx;
              const cleanTitle = (item.title || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
              const cleanDesc = (item.description || "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
              const cleanLink = (item.link || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
              let cleanDate = (item.pubDate || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
              try {
                if (cleanDate && !isNaN(Date.parse(cleanDate))) {
                  cleanDate = new Date(cleanDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                }
              } catch {}

              allNewArticles.push({
                id: articleId,
                title: cleanTitle,
                source: feed.title,
                category: feed.category || item.category || "Actualité",
                time: "À l'instant",
                score: 90,
                emoji: feed.icon || "📰",
                tags: ["RSS", feed.category, "Direct"],
                summary: cleanDesc.slice(0, 260) + (cleanDesc.length > 260 ? "..." : ""),
                content: `${cleanTitle}\n\n${cleanDesc}${cleanLink ? `\n\nSource officielle : ${cleanLink}` : ""}${cleanDate ? `\nPublié le : ${cleanDate}` : ""}`,
                imageUrl: item.imageUrl || undefined,
                featured: idx === 0,
                originalUrl: cleanLink,
                createdAt: Date.now() - idx * 60000,
                isCustomGenerated: false
              });
            });
          }
        }
      } catch (err) {
        console.warn(`Failed fetching RSS feed ${feed.url}:`, err);
      }
    }

    setIsLoading(false);
    setSyncStatus(null);

    if (allNewArticles.length > 0) {
      onImportArticles(allNewArticles);
      onNotify(`✅ ${allNewArticles.length} articles importés avec succès depuis ${successCount} flux RSS !`);
      onClose();
    } else {
      onNotify("⚠️ Impossible de synchroniser les flux RSS (vérifiez votre connexion ou l'URL des flux).");
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88vh] overflow-hidden ${
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Gestionnaire de Flux RSS & OPML</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                  {feeds.filter((f) => f.isActive).length} actifs
                </span>
              </h3>
              <p className="text-xs opacity-70">
                Abonnez-vous à vos médias favoris et fusionnez-les avec votre flux IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto scrollbar flex-1 min-h-0">
          {/* Add custom feed input form */}
          <form onSubmit={handleAddFeed} className="space-y-2 p-3.5 rounded-2xl border bg-slate-800/20 border-slate-700/50">
            <div className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajouter un flux RSS / Atom personnalisé</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="https://site.fr/feed.xml"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={`sm:col-span-6 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                }`}
              />
              <input
                type="text"
                placeholder="Nom du média (facultatif)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`sm:col-span-3 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                }`}
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={`sm:col-span-3 px-2.5 py-2 rounded-xl text-xs border focus:outline-none ${
                  isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                }`}
              >
                <option value="Actualité">Actualité</option>
                <option value="Économie">Économie</option>
                <option value="Technologie">Technologie</option>
                <option value="Science">Science</option>
                <option value="Monde">Monde</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-1">
              {/* OPML Import Button */}
              <label className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importer un fichier .OPML</span>
                <input
                  type="file"
                  accept=".opml,.xml"
                  onChange={handleOpmlUpload}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={!newUrl.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                + Ajouter le flux
              </button>
            </div>
          </form>

          {/* Feeds List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-75">
              <span>Mes Flux & Sources Curatées ({feeds.length})</span>
              <span className="text-[10px] lowercase opacity-75">Cochez pour activer</span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar pr-1">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    feed.isActive
                      ? isDark
                        ? "bg-slate-800/80 border-amber-500/40 text-slate-100"
                        : "bg-amber-50/50 border-amber-300 text-slate-900"
                      : "opacity-60 bg-transparent border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={feed.isActive}
                      onChange={() => toggleFeedActive(feed.id)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-base">{feed.icon || "📰"}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{feed.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded border border-slate-700/50 font-mono opacity-80">
                          {feed.category}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-65 truncate font-mono">
                        {feed.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Ouvrir le flux source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => removeFeed(feed.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer ce flux"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 bg-black/20 shrink-0">
          <div className="text-xs font-medium text-amber-400 min-w-0 truncate">
            {syncStatus || `${feeds.filter((f) => f.isActive).length} flux sélectionnés prêts à être synchronisés`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700/60 hover:bg-slate-800/60 cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={handleSyncActiveFeeds}
              disabled={isLoading || feeds.filter((f) => f.isActive).length === 0}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-40 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Synchronisation..." : "📥 Synchroniser & Importer"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
