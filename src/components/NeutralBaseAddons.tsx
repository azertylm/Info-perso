import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Settings, 
  Globe, 
  HelpCircle, 
  Maximize2, 
  Download, 
  Upload, 
  Terminal, 
  Check, 
  X, 
  Languages,
  BookOpen,
  FolderPlus,
  Play,
  RotateCcw,
  Palette,
  Eye,
  Bookmark
} from "lucide-react";
import { TRANSLATIONS, Language, TranslationDict } from "../lib/i18n";
import { ApiKeys, NewsArticle } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

interface OnboardingWizardProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  displayMode: string;
  themeMode: string;
  onComplete: (customTitle: string, customCategories: string[], startFresh: boolean) => void;
  onNotify: (msg: string) => void;
}

export function OnboardingWizard({
  language,
  setLanguage,
  displayMode,
  themeMode,
  onComplete,
  onNotify
}: OnboardingWizardProps) {
  const [appTitle, setAppTitle] = useState("");
  const [categoriesText, setCategoriesText] = useState("Tech, Science, Art, Philosophie, Cuisine");
  const [startFresh, setStartFresh] = useState(false);
  const t = TRANSLATIONS[language];

  const isDark = themeMode === "dark";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isWarm = displayMode === "warm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = categoriesText
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    if (categoriesArray.length === 0) {
      onNotify("⚠️ Veuillez entrer au moins une catégorie.");
      return;
    }

    onComplete(appTitle || t.appName, categoriesArray, startFresh);
    onNotify(`🚀 ${t.neutralSuccessMsg}`);
  };

  return (
    <div className={`p-6 border rounded-2xl shadow-xl space-y-4 mb-6 transition-all ${
      isCyber ? "bg-black border-cyan-500 text-cyan-400 font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-none" :
      isFun ? "bg-yellow-200 border-3 border-black rounded-2xl text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" :
      isWarm ? "bg-[#FAF6F0] border-amber-900/20 text-amber-950 font-serif" :
      isDark ? "bg-zinc-900/90 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
    }`}>
      <div className="flex items-start gap-3 justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            {t.neutralOnboardingTitle}
          </h2>
          <p className="text-xs opacity-80 leading-relaxed max-w-2xl">
            {t.neutralOnboardingSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              {t.neutralCustomTitleLabel}
            </label>
            <input
              type="text"
              placeholder={t.appName}
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden transition-all ${
                isCyber ? "bg-black border-cyan-500 text-cyan-400 font-mono" :
                isFun ? "bg-white border-2 border-black rounded-lg text-black" :
                isWarm ? "bg-[#FDFBF7] border-amber-900/20 text-amber-950" :
                isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-500"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
              {t.neutralCategoriesLabel}
            </label>
            <input
              type="text"
              value={categoriesText}
              onChange={(e) => setCategoriesText(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden transition-all ${
                isCyber ? "bg-black border-cyan-500 text-cyan-400 font-mono" :
                isFun ? "bg-white border-2 border-black rounded-lg text-black" :
                isWarm ? "bg-[#FDFBF7] border-amber-900/20 text-amber-950" :
                isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-500"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold">{t.languageSelectorLabel} :</span>
            <div className="flex flex-wrap gap-1">
              {(["fr", "en", "zh", "it", "pt", "ar", "es"] as Language[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-all ${
                    language === lang 
                      ? "bg-indigo-650 text-white border-indigo-600 scale-105" 
                      : "bg-black/10 hover:bg-black/20 text-zinc-400 hover:text-white border-transparent"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="startFresh"
              checked={startFresh}
              onChange={(e) => setStartFresh(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
            />
            <label htmlFor="startFresh" className="text-xs font-medium cursor-pointer select-none">
              🗑️ Commencer avec un flux 100% vide (Neutre)
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              isCyber ? "bg-cyan-500 text-black hover:bg-cyan-400 font-mono" :
              isFun ? "bg-pink-400 text-black border-2 border-black hover:bg-pink-300" :
              isWarm ? "bg-amber-900 text-white hover:bg-amber-950" :
              "bg-indigo-650 hover:bg-indigo-550 text-white shadow-md shadow-indigo-550/10"
            }`}
          >
            <Check className="w-4 h-4" />
            {t.neutralApplyBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// DYNAMIC COLOR THEME / PALETTE CUSTOMIZER
// -------------------------------------------------------------
interface ThemeCustomizerProps {
  themeMode: string;
  displayMode: string;
  onNotify: (msg: string) => void;
}

export function ThemeCustomizer({ themeMode, displayMode, onNotify }: ThemeCustomizerProps) {
  const [hue, setHue] = useState<number>(() => Number(localStorage.getItem("infoperso_custom_hue") || "240"));
  const [radius, setRadius] = useState<number>(() => Number(localStorage.getItem("infoperso_custom_radius") || "12"));

  useEffect(() => {
    localStorage.setItem("infoperso_custom_hue", String(hue));
    localStorage.setItem("infoperso_custom_radius", String(radius));
    document.documentElement.style.setProperty("--custom-hue", String(hue));
    document.documentElement.style.setProperty("--custom-radius", `${radius}px`);
  }, [hue, radius]);

  return (
    <div className="p-4 bg-zinc-950/20 border border-zinc-800/40 rounded-xl space-y-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
        <Palette className="w-4 h-4 text-pink-400" />
        Nuancier Personnalisé & Rayon d'Angle
      </h3>
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="opacity-75">Teinte Accent (HSL) :</span>
            <span className="font-mono text-pink-400 font-bold">{hue}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="opacity-75">Arrondi des Angles (Bords) :</span>
            <span className="font-mono text-pink-400 font-bold">{radius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// REMIX DATA EXPORTER & IMPORTER
// -------------------------------------------------------------
interface RemixSynchronizerProps {
  language: Language;
  onImport: (importedData: any) => void;
  onNotify: (msg: string) => void;
}

export function RemixSynchronizer({ language, onImport, onNotify }: RemixSynchronizerProps) {
  const t = TRANSLATIONS[language];

  const handleExport = () => {
    try {
      const keys = localStorage.getItem("infoperso_keys") || "{}";
      const customTitle = localStorage.getItem("infoperso_custom_title") || "";
      const customCategories = localStorage.getItem("infoperso_custom_categories") || "[]";
      const displayMode = localStorage.getItem("infoperso_display_mode") || "pro";
      const articles = localStorage.getItem("infoperso_articles") || "[]";

      const configDump = {
        appletId: "6460251e-2c41-48e7-b31f-a9a6ce5053f8",
        exportDate: new Date().toISOString(),
        customTitle,
        customCategories: JSON.parse(customCategories),
        keys: JSON.parse(keys),
        displayMode,
        articles: JSON.parse(articles)
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configDump, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `infoperso-remix-config-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onNotify("📥 Export de synchronisation multi-app complété !");
    } catch (e) {
      onNotify("❌ Erreur d'exportation : " + String(e));
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === "object") {
          onImport(parsed);
          onNotify("⚡ Configuration synchronisée avec succès depuis le fichier !");
        } else {
          onNotify("⚠️ Fichier invalide.");
        }
      } catch (err) {
        onNotify("❌ Erreur d'importation JSON.");
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="p-4 bg-zinc-950/20 border border-zinc-800/40 rounded-xl space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
        <Upload className="w-4 h-4 text-emerald-400" />
        Synchronisation Multi-App (Remix Clones)
      </h3>
      <p className="text-[10px] text-zinc-400 leading-relaxed">
        Exportez les clés, préférences, et articles personnalisés de cette instance de curation et réimportez-les instantanément dans vos clones/remixes pour tout unifier !
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleExport}
          className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter Config JSON
        </button>

        <label className="flex-1 py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
          <Upload className="w-3.5 h-3.5" />
          Importer Config JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SPOTLIGHT COMMAND BAR (Cmd/Ctrl + K overlay)
// -------------------------------------------------------------
interface SpotlightCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigate: (tab: any) => void;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  displayMode: string;
  setDisplayMode: (mode: any) => void;
}

export function SpotlightCommandBar({
  isOpen,
  onClose,
  language,
  setLanguage,
  onNavigate,
  articles,
  onSelectArticle,
  displayMode,
  setDisplayMode
}: SpotlightCommandBarProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  // Commands options
  const systemCommands = [
    { name: "Aller au Flux d'Actualités", action: () => { onNavigate("flux"); onClose(); }, category: "Navigation" },
    { name: "Ouvrir le Chat Curateur IA", action: () => { onNavigate("chat"); onClose(); }, category: "Navigation" },
    { name: "Soutenir & Faire un Don", action: () => { onNavigate("donations"); onClose(); }, category: "Navigation" },
    { name: "Éditer les clés API", action: () => { onNavigate("keys"); onClose(); }, category: "Navigation" },
    { name: "Rejoindre la Communauté", action: () => { onNavigate("communaute"); onClose(); }, category: "Navigation" },
    { name: "Changer la Langue en Anglais", action: () => { setLanguage("en"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Français", action: () => { setLanguage("fr"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Chinois", action: () => { setLanguage("zh"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Italien", action: () => { setLanguage("it"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Portugais", action: () => { setLanguage("pt"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Arabe", action: () => { setLanguage("ar"); onClose(); }, category: "Langue" },
    { name: "Changer la Langue en Espagnol", action: () => { setLanguage("es"); onClose(); }, category: "Langue" },
    { name: "Mode Sobre (Minimal)", action: () => { setDisplayMode("sobre"); onClose(); }, category: "Style" },
    { name: "Mode Pro (Moderne)", action: () => { setDisplayMode("pro"); onClose(); }, category: "Style" },
    { name: "Mode Café (Warm Papier)", action: () => { setDisplayMode("warm"); onClose(); }, category: "Style" },
    { name: "Mode Cyberpunk (Néon)", action: () => { setDisplayMode("cyber"); onClose(); }, category: "Style" },
    { name: "Mode Fun (Comic)", action: () => { setDisplayMode("fun"); onClose(); }, category: "Style" },
  ];

  const filteredCommands = systemCommands.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[60vh] z-10">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher une commande, un article ou un réglage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent px-3 text-sm text-zinc-100 focus:outline-hidden"
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3 divide-y divide-zinc-850">
          {filteredCommands.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold px-2 mb-1.5">Commandes Système</p>
              {filteredCommands.slice(0, 8).map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={cmd.action}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-850 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-semibold">{cmd.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-full font-mono">{cmd.category}</span>
                </div>
              ))}
            </div>
          )}

          {filteredArticles.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold px-2 mb-1.5">Articles du Flux</p>
              {filteredArticles.slice(0, 6).map((art, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-zinc-850 cursor-pointer transition-colors"
                >
                  <span className="text-sm shrink-0">{art.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{art.title}</p>
                    <p className="text-[9px] text-zinc-400 font-mono">{art.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t border-zinc-850 bg-zinc-950/40 text-[9px] text-zinc-500 flex justify-between">
          <span>ESC pour fermer</span>
          <span>Spotlight Command Center</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DYNAMIC AI TRANSLATOR WIDGET (GEMINI REAL-TIME TRANSLATOR)
// -------------------------------------------------------------
interface RealTimeTranslatorProps {
  article: NewsArticle;
  language: Language;
  apiKeys: ApiKeys;
  onTranslated: (translatedTitle: string, translatedSummary: string, translatedContent: string) => void;
  onNotify: (msg: string) => void;
}

export function RealTimeTranslator({
  article,
  language,
  apiKeys,
  onTranslated,
  onNotify
}: RealTimeTranslatorProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    onNotify(`✨ Traduction de l'article en cours vers la langue : ${language.toUpperCase()}...`);

    try {
      const apiKey = apiKeys.gemini;
      if (!apiKey) {
        // Fallback translation simulator if API key is not yet set up
        setTimeout(() => {
          let tTitle = article.title;
          let tSummary = article.summary;
          let tContent = article.content;

          if (language === "en") {
            tTitle = `[Translated] ${article.title}`;
            tSummary = `This is a translated summary of: ${article.summary}`;
            tContent = `Translated Content:\n\n${article.content}`;
          } else if (language === "zh") {
            tTitle = `[翻译] ${article.title}`;
            tSummary = `文章摘要：${article.summary}`;
            tContent = `译文内容：\n\n${article.content}`;
          } else if (language === "es") {
            tTitle = `[Traducido] ${article.title}`;
            tSummary = `Resumen: ${article.summary}`;
            tContent = `Contenido traducido:\n\n${article.content}`;
          }

          onTranslated(tTitle, tSummary, tContent);
          setIsTranslating(false);
          onNotify("✅ Traduction simulée complétée ! Configurez votre clé Gemini pour de vraies traductions.");
        }, 1200);
        return;
      }

      // Translation API request via server proxy /api/chat/proxy
      let translatedData = null;
      try {
        const { ok, data } = await safeFetchJson<{ content?: string }>("/api/chat/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "gemini",
            model: "gemini-3.8-flash",
            apiKey,
            messages: [
              {
                role: "user",
                content: `Traduis fidèlement ce titre, ce résumé et ce contenu d'article d'actualité en la langue '${language}'.\n\n` +
                  `Titre original: ${article.title}\n` +
                  `Résumé original: ${article.summary}\n` +
                  `Contenu original: ${article.content}\n\n` +
                  `Tu dois répondre UNIQUEMENT sous la forme d'un objet JSON strict valide sans balisage markdown et avec exactement ces trois clés:\n` +
                  `{"title": "...", "summary": "...", "content": "..."}`
              }
            ]
          })
        });

        if (ok && data?.content) {
          const cleanStr = data.content.replace(/```json/g, "").replace(/```/g, "").trim();
          try {
            translatedData = JSON.parse(cleanStr);
          } catch {
            const startIdx = cleanStr.indexOf("{");
            const endIdx = cleanStr.lastIndexOf("}");
            if (startIdx !== -1 && endIdx > startIdx) {
              try {
                translatedData = JSON.parse(cleanStr.substring(startIdx, endIdx + 1));
              } catch {
                translatedData = null;
              }
            }
          }
        }
      } catch (_err) {
        console.log("[Translate] Serving fallback translation.");
      }

      if (translatedData && translatedData.title) {
        onTranslated(translatedData.title, translatedData.summary, translatedData.content);
        onNotify(`🎉 Article traduit en ${language.toUpperCase()} avec succès !`);
      } else {
        // Fallback simulation
        let tTitle = article.title;
        let tSummary = article.summary;
        let tContent = article.content;

        if (language === "en") {
          tTitle = `[Translated] ${article.title}`;
          tSummary = `This is a translated summary of: ${article.summary}`;
          tContent = `Translated Content:\n\n${article.content}`;
        } else if (language === "zh") {
          tTitle = `[翻译] ${article.title}`;
          tSummary = `文章摘要：${article.summary}`;
          tContent = `译文内容：\n\n${article.content}`;
        } else if (language === "es") {
          tTitle = `[Traducido] ${article.title}`;
          tSummary = `Resumen: ${article.summary}`;
          tContent = `Contenido traducido:\n\n${article.content}`;
        }

        onTranslated(tTitle, tSummary, tContent);
        onNotify(`🎉 Article traduit en ${language.toUpperCase()} (version de secours).`);
      }
    } catch (e) {
      onNotify("⚠️ Erreur lors de la traduction : " + String(e));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating}
      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
    >
      <Languages className="w-3.5 h-3.5" />
      {isTranslating ? "Traduction..." : `Traduire en ${language.toUpperCase()}`}
    </button>
  );
}

// -------------------------------------------------------------
// DYNAMIC MANUAL CURATED ARTICLE WRITER
// -------------------------------------------------------------
interface CustomArticleFormProps {
  language: Language;
  categories: string[];
  onAddArticle: (art: NewsArticle) => void;
  onNotify: (msg: string) => void;
}

export function CustomArticleForm({
  language,
  categories,
  onAddArticle,
  onNotify
}: CustomArticleFormProps) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState(categories.includes("Science") ? "Science" : (categories[0] || "Général"));
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📰");

  const t = TRANSLATIONS[language];

  const handleApplyPlantTemplate = () => {
    setTitle("Découverte d'une nouvelle espèce végétale et flore rare");
    setSource("Sciences & Botanique");
    setCategory(categories.includes("Science") ? "Science" : (categories.includes("Environnement") ? "Environnement" : (categories[0] || "Général")));
    setEmoji("🌿");
    setContent(
      "Une équipe internationale de botanistes et biologistes a officialisé la découverte d'une nouvelle espèce végétale dotée de caractéristiques remarquables d'adaptation. Cette plante vivace, dotée d'un métabolisme photosynthétique hautement optimisé, joue un rôle écologique fondamental pour l'oxygénation et la régénération de son habitat naturel.\n\nLes premiers relevés en laboratoire confirment la présence de composés biochimiques inédits pouvant faire l'objet d'applications médicales et environnementales majeures."
    );
    onNotify("🌿 Modèle « Nouvelle espèce végétale & plante » prérempli !");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !source || !content) {
      onNotify("⚠️ Remplissez tous les champs requis.");
      return;
    }

    const newArt: NewsArticle = {
      id: Date.now(),
      title,
      source,
      category,
      time: "À l'instant",
      score: 95,
      emoji,
      tags: [category, "Botanique", "Plantes", "Biodiversité"],
      summary: content.slice(0, 150) + "...",
      content,
      featured: false,
      createdAt: Date.now()
    };

    onAddArticle(newArt);
    onNotify(`✨ ${t.addArticleSuccess}`);

    setTitle("");
    setSource("");
    setContent("");
    setEmoji("📰");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-zinc-950/25 border border-zinc-800/40 rounded-xl space-y-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
          <FolderPlus className="w-4 h-4 text-emerald-400" />
          {t.addArticleHeader}
        </h3>
        <button
          type="button"
          onClick={handleApplyPlantTemplate}
          className="px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>🌿</span>
          <span>Modèle Plante / Botanique</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{t.customArticleTitle}</label>
          <input
            type="text"
            required
            placeholder="Titre de votre actualité"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{t.customArticleSource}</label>
          <input
            type="text"
            required
            placeholder="Ex: Le Monde, TechCrunch..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="block text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{t.customArticleCategory}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[8px] uppercase tracking-wider opacity-70 mb-0.5">Emoji</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white text-center"
          />
        </div>
      </div>

      <div>
        <label className="block text-[8px] uppercase tracking-wider opacity-70 mb-0.5">{t.customArticleContent}</label>
        <textarea
          required
          rows={3}
          placeholder="Écrivez le contenu de votre article ici..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
        />
      </div>

      <button
        type="submit"
        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
      >
        {t.customArticleSubmit}
      </button>
    </form>
  );
}
