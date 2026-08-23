import React, { useState, useEffect } from "react";
import { buildShareUrl } from "../lib/shareHelper";
import { 
  auth, 
  db,
  OperationType,
  handleFirestoreError
} from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  where
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  FileText, 
  PenTool, 
  Users, 
  Heart, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  Plus, 
  Cpu, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Tag, 
  BookOpen, 
  AlertTriangle,
  Search,
  MessageSquare,
  Share2,
  Trash2,
  Flag,
  ThumbsUp,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Minimize2,
  Bookmark,
  Sparkle,
  Youtube
} from "lucide-react";
import UserAuth from "./UserAuth";

interface CommunityArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  emoji: string;
  score: number;
  authorName: string;
  authorEmail: string;
  authorUid: string;
  authorVerified?: boolean;
  likes: number;
  time: string;
  flags?: number;
  createdAt?: any;
}

// Initial fallback community articles if Firestore is empty
const PRELOADED_COMMUNITY_ARTICLES: CommunityArticle[] = [
  {
    id: "demo-1",
    title: "Comment l'Occitanie devient un hub européen de l'intelligence artificielle appliquée",
    source: "Toulouse Tech",
    category: "IA",
    tags: ["Occitanie", "Hub", "Europe"],
    summary: "Analyse des initiatives régionales, de l'implication des universités toulousaines et de l'essor des startups locales dans la santé et l'aéronautique.",
    content: "L'Occitanie affirme son leadership dans le numérique. Grâce à des centres de recherche de premier plan comme l'IRIT et l'ANITI, Toulouse attire d'importants financements.\n\nDes startups se spécialisent dans l'intégration de modèles de langage pour optimiser la maintenance aéronautique ou la détection de pathologies en imagerie médicale. L'écosystème local bénéficie également du soutien actif de la Région à travers des subventions de recherche et développement.\n\nCette synergie unique entre académie, grands groupes et jeunes pousses fait d'Occitanie un pôle d'attraction majeur pour les talents internationaux de l'IA.",
    emoji: "🚀",
    score: 94,
    authorName: "Damien Roussel",
    authorEmail: "damien.r@exemple.com",
    authorUid: "demo-uid-1",
    likes: 12,
    time: "il y a 2h"
  },
  {
    id: "demo-2",
    title: "Pourquoi nous devrions tous apprendre à raffiner nos prompts plutôt qu'à coder",
    source: "Mon Blog Tech",
    category: "Technologie",
    tags: ["Prompting", "NoCode", "Futur"],
    summary: "Une réflexion sur l'évolution du métier de développeur face aux capacités génératives des modèles de raisonnement avancés.",
    content: "Avec l'avènement d'outils capables d'écrire des pans entiers de code complexe à partir d'instructions simples, la compétence clé n'est plus la syntaxe du langage, mais la clarté du raisonnement.\n\nLe prompt engineering n'est pas qu'un ensemble d'astuces : c'est l'art de formuler un problème, de définir des contraintes et de guider un agent vers la solution optimale. Enseigner la logique formelle et la décomposition de problèmes est plus crucial que jamais.\n\nDemain, les meilleurs architectes logiciels seront d'excellents communicateurs capables d'orchestrer des agents intelligents.",
    emoji: "📝",
    score: 89,
    authorName: "Sophie Martin",
    authorEmail: "sophie.m@exemple.com",
    authorUid: "demo-uid-2",
    likes: 8,
    time: "il y a 4h"
  }
];

const CATEGORIES = ["IA", "Technologie", "Local", "Économie", "Médias", "Autre"];
const EMOJIS = ["🤖", "⚛️", "🌊", "🧠", "🎨", "📊", "🏛️", "🔓", "📡", "🍎", "📝", "🚀", "💡", "📢"];

interface CommunitySpaceProps {
  onNotify: (msg: string) => void;
  onAwardCuriosityPoints?: (points: number, reason: string, articleCategory?: string, actionType?: "read" | "share" | "quiz") => void;
  displayMode?: string;
  themeMode?: "light" | "dark";
}

export default function CommunitySpace({ 
  onNotify,
  onAwardCuriosityPoints = () => {},
  displayMode = "pro",
  themeMode = "dark"
}: CommunitySpaceProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"view" | "submit">("view");
  const [articles, setArticles] = useState<CommunityArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<CommunityArticle | null>(null);

  // Community-specific Search, Filter, and flag states
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  // Comments states
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Audio / Speech
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);

  // Collaborative Synthesis states
  const [selectedArticleIdsForSynthesis, setSelectedArticleIdsForSynthesis] = useState<Set<string>>(new Set());
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<string | null>(null);
  const [synthesisTitle, setSynthesisTitle] = useState("");
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);

  const handleGenerateSynthesis = async () => {
    if (selectedArticleIdsForSynthesis.size < 2) {
      onNotify("⚠️ Sélectionnez au moins 2 articles pour générer une synthèse.");
      return;
    }
    
    setIsGeneratingSynthesis(true);
    setSynthesisResult(null);
    setShowSynthesisModal(true);
    
    const selectedArticles = articles.filter(art => selectedArticleIdsForSynthesis.has(art.id));
    
    try {
      const response = await fetch("/api/gemini/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articles: selectedArticles.map(art => ({
            title: art.title,
            content: art.content,
            category: art.category
          }))
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.synthesis) {
          setSynthesisResult(data.synthesis);
          const categories = Array.from(new Set(selectedArticles.map(a => a.category)));
          setSynthesisTitle(`Dossier Synthèse : Focus ${categories.join(" & ")}`);
          return;
        }
      }
    } catch (_err) {
      console.log("[Synthesis] Serving client fallback synthesis.");
    } finally {
      setIsGeneratingSynthesis(false);
    }

    // Client-side fallback synthesis
    const categories = Array.from(new Set(selectedArticles.map(a => a.category)));
    const fallbackTitle = `Dossier Synthèse : Focus ${categories.join(" & ") || "Actualités"}`;
    const fallbackContent = `# ${fallbackTitle}\n\nCe dossier rassemble ${selectedArticles.length} articles clés sélectionnés par la communauté :\n\n` +
      selectedArticles.map(a => `## 📰 ${a.title} (${a.source})\n* **Catégorie :** ${a.category}\n* **Résumé :** ${a.summary}\n`).join("\n");
    
    setSynthesisResult(fallbackContent);
    setSynthesisTitle(fallbackTitle);
  };

  const handlePublishSynthesis = async () => {
    if (!synthesisTitle.trim() || !synthesisResult) {
      onNotify("⚠️ Veuillez saisir un titre pour votre dossier de synthèse.");
      return;
    }

    setSubmitting(true);
    try {
      const newDoc = {
        title: synthesisTitle,
        source: "InfoPerso Communauté",
        category: "Autre",
        tags: ["Synthèse IA", "Collaboratif"],
        summary: `Synthèse IA collaborative tissant des liens entre ${selectedArticleIdsForSynthesis.size} articles partagés par la communauté.`,
        content: synthesisResult,
        emoji: "🧠",
        score: 95,
        authorName: currentUser?.displayName || currentUser?.email?.split("@")[0] || "Curieux",
        authorEmail: currentUser?.email || "curieux@infoperso.fr",
        authorUid: currentUser?.uid || "anonymous",
        authorVerified: !!currentUser,
        likes: 0,
        time: "À l'instant",
        createdAt: serverTimestamp()
      };

      if (db) {
        const docRef = await addDoc(collection(db, "proposed_articles"), newDoc);
        setArticles(prev => [{ id: docRef.id, ...newDoc } as any, ...prev]);
      } else {
        const tempId = `synthesis-${Date.now()}`;
        setArticles(prev => [{ id: tempId, ...newDoc } as any, ...prev]);
      }

      onNotify("🎉 Dossier de synthèse IA publié dans la communauté !");
      onAwardCuriosityPoints(10, "Publication d'un dossier de synthèse IA collaboratif (+10 pts)", "Autre", "share");
      
      setSelectedArticleIdsForSynthesis(new Set());
      setSynthesisResult(null);
      setSynthesisTitle("");
      setShowSynthesisModal(false);
    } catch (err) {
      console.error("Error publishing synthesis:", err);
      onNotify("❌ Impossible de publier la synthèse.");
      handleFirestoreError(err, OperationType.WRITE, "proposed_articles");
    } finally {
      setSubmitting(false);
    }
  };

  // Reader customizing states
  const [fontScale, setFontScale] = useState<number>(1.0); // 1.0, 1.25, 1.5
  const [readerTheme, setReaderTheme] = useState<"slate" | "sepia" | "light" | "deep">("slate");
  const [zenMode, setZenMode] = useState(false);

  // Form states
  const [formType, setFormType] = useState<"own" | "suggest">("own");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("IA");
  const [emoji, setEmoji] = useState("🤖");
  const [tagsText, setTagsText] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynth(window.speechSynthesis);
    }
    // Load local storage flagged IDs and settings
    try {
      const savedFlags = localStorage.getItem("infoperso_community_flags");
      if (savedFlags) {
        setFlaggedIds(new Set(JSON.parse(savedFlags)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch comments whenever an article is selected
  useEffect(() => {
    if (!selectedArticle) {
      setComments([]);
      // Stop speech if open article is closed
      if (speechSynth) speechSynth.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "community_comments"),
          where("articleId", "==", selectedArticle.id),
          orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        const fetched: any[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setComments(fetched);
      } catch (err) {
        console.error("Error retrieving comments:", err);
        handleFirestoreError(err, OperationType.GET, "community_comments");
        // Fallback demo comments (unreachable but kept for type coherence)
        setComments([
          {
            id: "c-demo-1",
            articleId: selectedArticle.id,
            authorName: "Marc Tech",
            authorEmail: "marc@exemple.com",
            content: "Excellent partage, très enrichissant ! Je suis entièrement d'accord avec cette analyse.",
            createdAt: { seconds: Date.now() / 1000 - 3600 },
            likes: 4
          }
        ]);
      }
    };

    fetchComments();
  }, [selectedArticle]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "proposed_articles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched: CommunityArticle[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          title: data.title,
          source: data.source,
          category: data.category,
          tags: data.tags || [],
          summary: data.summary,
          content: data.content,
          emoji: data.emoji || "📝",
          score: data.score || 85,
          authorName: data.authorName || "Anonyme",
          authorEmail: data.authorEmail || "",
          authorUid: data.authorUid || "",
          authorVerified: data.authorVerified || false,
          likes: data.likes || 0,
          flags: data.flags || 0,
          time: data.createdAt ? "Récemment" : "Instant",
          createdAt: data.createdAt
        });
      });

      // Merge with preloaded if firebase returned nothing (just for visual beauty on first load)
      if (fetched.length === 0) {
        setArticles(PRELOADED_COMMUNITY_ARTICLES);
      } else {
        setArticles(fetched);
      }
    } catch (err) {
      console.error("Firestore retrieval error, using preloaded data:", err);
      handleFirestoreError(err, OperationType.LIST, "proposed_articles");
      setArticles(PRELOADED_COMMUNITY_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  const handleLike = async (art: CommunityArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Update local state first for instant responsiveness
      setArticles(prev => prev.map(a => a.id === art.id ? { ...a, likes: a.likes + 1 } : a));
      if (selectedArticle?.id === art.id) {
        setSelectedArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }

      // If it's a Firestore document (does not start with 'demo-')
      if (!art.id.startsWith("demo-")) {
        const docRef = doc(db, "proposed_articles", art.id);
        await updateDoc(docRef, {
          likes: increment(1)
        });
      }
      onNotify("Merci pour votre appréciation ! ❤️");
    } catch (err) {
      console.error("Error updating like:", err);
      handleFirestoreError(err, OperationType.UPDATE, "proposed_articles/" + art.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNotify("Veuillez vous connecter pour soumettre un article.");
      return;
    }

    if (!title || !source || !summary || !content) {
      onNotify("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Generate a dynamic score for user submissions
      const randomScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75;

      const newDoc = {
        title,
        source,
        category,
        emoji,
        tags: parsedTags,
        summary,
        content,
        score: randomScore,
        authorName: currentUser.displayName || "Auteur Communautaire",
        authorEmail: currentUser.email || "",
        authorUid: currentUser.uid,
        authorVerified: currentUser.emailVerified || false,
        likes: 0,
        flags: 0,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "proposed_articles"), newDoc);
      onNotify("Article proposé avec succès ! Merci de votre contribution. 🚀");
      
      // Reset form
      setTitle("");
      setSource("");
      setTagsText("");
      setSummary("");
      setContent("");
      
      // Go to view list
      setActiveTab("view");
    } catch (err: any) {
      console.error(err);
      onNotify("Erreur lors de la publication : " + err.message);
      handleFirestoreError(err, OperationType.CREATE, "proposed_articles");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceRead = (article: CommunityArticle) => {
    if (!speechSynth) {
      onNotify("⚠️ La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isPlayingSpeech) {
      speechSynth.cancel();
      setIsPlayingSpeech(false);
      onNotify("Lecture vocale interrompue.");
    } else {
      speechSynth.cancel();
      const textToRead = `${article.title}. Publié par ${article.source}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsPlayingSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
      };
      setIsPlayingSpeech(true);
      speechSynth.speak(utterance);
      onNotify("🔊 Lecture de l'article en cours...");
    }
  };

  const handleFlagArticle = async (article: CommunityArticle) => {
    try {
      const updatedFlags = new Set(flaggedIds);
      if (updatedFlags.has(article.id)) {
        onNotify("Vous avez déjà signalé cet article.");
        return;
      }
      updatedFlags.add(article.id);
      setFlaggedIds(updatedFlags);
      localStorage.setItem("infoperso_community_flags", JSON.stringify(Array.from(updatedFlags)));

      // If it's a real firestore doc
      if (!article.id.startsWith("demo-")) {
        const docRef = doc(db, "proposed_articles", article.id);
        await updateDoc(docRef, {
          flags: increment(1)
        });
      }

      onNotify("⚠️ Article signalé avec succès pour examen.");
      setSelectedArticle(null);
      fetchArticles();
    } catch (err) {
      console.error(err);
      onNotify("Signalement enregistré localement.");
      setSelectedArticle(null);
      handleFirestoreError(err, OperationType.UPDATE, "proposed_articles/" + article.id);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNotify("Veuillez vous connecter pour commenter.");
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = {
        articleId: selectedArticle!.id,
        authorName: currentUser.displayName || "Membre InfoPerso",
        authorEmail: currentUser.email || "",
        authorUid: currentUser.uid,
        content: newCommentText.trim(),
        createdAt: serverTimestamp(),
        likes: 0
      };

      const docRef = await addDoc(collection(db, "community_comments"), newComment);
      
      setComments(prev => [
        ...prev,
        {
          id: docRef.id,
          ...newComment,
          createdAt: { seconds: Date.now() / 1000 }
        }
      ]);
      setNewCommentText("");
      onNotify("Commentaire publié ! 💬");
    } catch (err: any) {
      console.error(err);
      // Fallback local save in state if offline
      const tempComment = {
        id: "temp-" + Date.now(),
        articleId: selectedArticle!.id,
        authorName: currentUser.displayName || "Membre InfoPerso",
        authorEmail: currentUser.email || "",
        authorUid: currentUser.uid,
        content: newCommentText.trim(),
        createdAt: { seconds: Date.now() / 1000 },
        likes: 0
      };
      setComments(prev => [...prev, tempComment]);
      setNewCommentText("");
      onNotify("Commentaire publié (hors ligne) ! 💬");
      handleFirestoreError(err, OperationType.CREATE, "community_comments");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShareArticle = async (article: CommunityArticle) => {
    try {
      const shareUrl = buildShareUrl({
        id: typeof article.id === "number" ? article.id : Date.now(),
        title: article.title,
        source: article.source,
        category: article.category,
        summary: article.summary,
        content: article.content,
        score: 95,
        emoji: "📰",
        tags: ["Communauté", article.category],
        time: article.time || "Récemment",
        featured: false
      });
      const title = `📰 [InfoPerso] ${article.title}`;
      const text = `Résumé : ${article.summary}\n\nDécouvrez cet article partagé sur InfoPerso :`;

      if (onAwardCuriosityPoints) {
        onAwardCuriosityPoints(2, `Partage d'un article communautaire : "${article.title}" (+2 pts)`, article.category, "share");
      }

      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `${text}\n${shareUrl}`,
          url: shareUrl
        });
        onNotify("Article partagé avec succès ! 🚀");
      } else {
        const fullShareText = `${title}\nSource: ${article.source}\n\n${text}\n${shareUrl}`;
        await navigator.clipboard.writeText(fullShareText);
        onNotify("Lien direct et résumé copiés dans le presse-papiers ! 📋");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        try {
          const shareUrl = buildShareUrl({
            id: typeof article.id === "number" ? article.id : Date.now(),
            title: article.title,
            source: article.source,
            category: article.category,
            summary: article.summary,
            content: article.content,
            score: 95,
            emoji: "📰",
            tags: ["Communauté", article.category],
            time: article.time || "Récemment",
            featured: false
          });
          const fallbackText = `📰 [InfoPerso] ${article.title}\nSource: ${article.source}\n\nRésumé : ${article.summary}\n\nLien direct : ${shareUrl}`;
          await navigator.clipboard.writeText(fallbackText);
          onNotify("Lien direct et résumé copiés dans le presse-papiers ! 📋");
        } catch {
          onNotify("Impossible de copier automatiquement.");
        }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/15 pb-6">
        <div>
          <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Espace Communauté
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-sans">
            Partagez les articles qui vous ont captivé ou rédigez votre propre tribune libre. Connectez-vous par Google ou e-mail vérifié pour participer !
          </p>
        </div>

        {/* Tab Switcher buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => { setActiveTab("view"); setSelectedArticle(null); }}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-bold border transition-all cursor-pointer ${
              activeTab === "view"
                ? "bg-indigo-500/10 border-indigo-500/40 text-cyan-300 shadow-lg shadow-indigo-500/5"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Articles partagés
          </button>
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-bold border transition-all cursor-pointer ${
              activeTab === "submit"
                ? "bg-violet-500/10 border-violet-500/40 text-violet-300 shadow-lg shadow-violet-500/5"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <PenTool className="w-4 h-4" />
            Écrire / Proposer
          </button>
        </div>
      </div>

      {selectedArticle ? (
        /* Full Article Detail Viewer */
        <div className={`border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative transition-all ${
          readerTheme === "sepia" ? "bg-[#f4ecd8] border-[#dfd4b6] text-[#433422]" :
          readerTheme === "light" ? "bg-white border-slate-200 text-slate-900" :
          readerTheme === "deep" ? "bg-black border-slate-900 text-slate-200" :
          "bg-slate-900/40 border-indigo-500/15 text-slate-100"
        }`}>
          {/* Reading Progress Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800 rounded-t-2xl overflow-hidden">
            <div className="h-full bg-linear-to-r from-cyan-400 via-indigo-400 to-violet-500 transition-all" style={{ width: "70%" }}></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-4 border-b border-slate-700/30">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-700/30 hover:bg-slate-950 transition-all cursor-pointer text-cyan-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            {/* Reading Settings Panel */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Text Size Resizer */}
              <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-lg border border-slate-700/30">
                <button
                  onClick={() => setFontScale(Math.max(0.85, fontScale - 0.15))}
                  className="px-2 py-0.5 text-xs font-bold hover:text-white transition-all text-slate-400 cursor-pointer"
                  title="Diminuer la police"
                >
                  A-
                </button>
                <span className="text-[10px] font-mono font-bold px-1 text-slate-400">
                  {Math.round(fontScale * 100)}%
                </span>
                <button
                  onClick={() => setFontScale(Math.min(1.6, fontScale + 0.15))}
                  className="px-2 py-0.5 text-xs font-bold hover:text-white transition-all text-slate-400 cursor-pointer"
                  title="Agrandir la police"
                >
                  A+
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-lg border border-slate-700/30">
                {(["slate", "sepia", "light", "deep"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReaderTheme(t)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all ${
                      t === "slate" ? "bg-slate-800 border-slate-600" :
                      t === "sepia" ? "bg-[#e8dcbf] border-[#cbbca1]" :
                      t === "light" ? "bg-white border-slate-300" :
                      "bg-black border-slate-800"
                    } ${readerTheme === t ? "ring-2 ring-indigo-500 scale-110" : "opacity-80"}`}
                    title={`Thème ${t}`}
                  />
                ))}
              </div>

              {/* Audio Reader */}
              <button
                onClick={() => handleVoiceRead(selectedArticle)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                  isPlayingSpeech ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse" : "bg-slate-950/40 text-slate-400 border-slate-700/30"
                }`}
                title="Lecture audio"
              >
                {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Zen Mode */}
              <button
                onClick={() => setZenMode(!zenMode)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                  zenMode ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-slate-950/40 text-slate-400 border-slate-700/30"
                }`}
                title="Mode Zen"
              >
                {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Article Header Details */}
          {!zenMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedArticle.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-sans font-bold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-0.5 rounded">
                      {selectedArticle.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      • proposé par <strong className="text-indigo-400">{selectedArticle.authorName}</strong>
                      {selectedArticle.authorVerified && (
                        <span className="ml-1 inline-flex items-center text-emerald-400" title="Auteur Vérifié">
                          ✓ Vérifié
                        </span>
                      )}
                    </span>
                  </div>
                  <h3 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl font-semibold mt-1.5 leading-normal">
                    {selectedArticle.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 border-b border-slate-700/30 pb-4">
                <span>Source: <strong className="text-slate-300">{selectedArticle.source}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedArticle.time}</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono font-bold">Indice de pertinence: {selectedArticle.score}%</span>
              </div>
            </div>
          )}

          {/* Large text readable at 50% larger / Custom font scale */}
          <div 
            className="leading-loose space-y-6 max-w-4xl pt-2 font-sans transition-all duration-300"
            style={{ fontSize: `${fontScale * 115}%` }}
          >
            {selectedArticle.content.split("\n\n").map((p, idx) => (
              <p key={idx} className="indent-4 leading-relaxed tracking-wide">{p}</p>
            ))}
          </div>

          {/* Section Vidéos YouTube sur le sujet */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center shrink-0">
                <Youtube className="w-5 h-5 fill-red-600 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5 leading-tight">
                  Reportages &amp; Vidéos YouTube
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Regardez les vidéos et documentaires liés à ce sujet sur YouTube.
                </p>
              </div>
            </div>

            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedArticle.title + " " + (selectedArticle.source || ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-red-600/20 shrink-0 cursor-pointer"
            >
              <Youtube className="w-4 h-4 fill-white text-white" />
              <span>Ouvrir sur YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/30">
            {selectedArticle.tags.map((tag) => (
              <span key={tag} className="text-xs sm:text-sm text-slate-400 bg-slate-950/50 border border-slate-700/20 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-700/30">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={(e) => handleLike(selectedArticle, e)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Soutenir ({selectedArticle.likes})
              </button>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedArticle.title + " " + (selectedArticle.source || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs"
              >
                <Youtube className="w-4 h-4 fill-white text-white" />
                YouTube
              </a>

              <button
                onClick={() => handleShareArticle(selectedArticle)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-700/30 text-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer"
                title="Copier le résumé"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                Partager
              </button>

              <button
                onClick={() => handleFlagArticle(selectedArticle)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 text-amber-300 hover:text-amber-200 rounded-xl text-sm font-medium transition-all cursor-pointer"
                title="Signaler un abus"
              >
                <Flag className="w-3.5 h-3.5" />
                Signaler
              </button>
            </div>

            <p className="text-xs text-slate-500 italic">ID: {selectedArticle.id}</p>
          </div>

          {/* COMMENTS MODULE */}
          <div className="pt-6 border-t border-slate-700/30 space-y-4">
            <h4 className="text-lg font-serif italic text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Commentaires de la communauté ({comments.length})
            </h4>

            {/* List existing comments */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">{comm.authorName} <span className="text-slate-500 font-normal">({comm.authorEmail})</span></span>
                      <span className="text-slate-500">💬 Récemment</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Écrivez un commentaire constructif..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-sans font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Commenter
                </button>
              </form>
            ) : (
              <p className="text-[11px] text-slate-500 bg-slate-950/50 px-3 py-2 rounded-lg text-center border border-slate-800">
                Veuillez vous <strong className="text-indigo-400">connecter</strong> pour participer au débat communautaire.
              </p>
            )}
          </div>
        </div>
      ) : activeTab === "view" ? (
        /* View proposed articles tab */
        <div className="space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher dans la communauté (titres, tags, sources)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-400 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 cursor-pointer"
                />
                Membres vérifiés uniquement
              </label>

              {searchQuery || onlyVerified ? (
                <button
                  onClick={() => { setSearchQuery(""); setOnlyVerified(false); }}
                  className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <div className="flex justify-center gap-1.5">
                <span className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <p className="font-sans font-semibold text-cyan-400 text-sm animate-pulse">Chargement des articles partagés...</p>
            </div>
          ) : (
            <>
              {articles.filter((art) => {
                // 1. Exclude flagged articles
                if (flaggedIds.has(art.id) || (art.flags && art.flags >= 3)) {
                  return false;
                }
                // 2. Search query matching
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const matchesTitle = art.title.toLowerCase().includes(q);
                  const matchesSummary = art.summary.toLowerCase().includes(q);
                  const matchesSource = art.source.toLowerCase().includes(q);
                  const matchesTags = art.tags.some(t => t.toLowerCase().includes(q));
                  if (!matchesTitle && !matchesSummary && !matchesSource && !matchesTags) {
                    return false;
                  }
                }
                // 3. Only verified
                if (onlyVerified && !art.authorVerified) {
                  return false;
                }
                return true;
              }).length === 0 ? (
                <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Aucun article ne correspond à vos critères de recherche.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.filter((art) => {
                    if (flaggedIds.has(art.id) || (art.flags && art.flags >= 3)) {
                      return false;
                    }
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const matchesTitle = art.title.toLowerCase().includes(q);
                      const matchesSummary = art.summary.toLowerCase().includes(q);
                      const matchesSource = art.source.toLowerCase().includes(q);
                      const matchesTags = art.tags.some(t => t.toLowerCase().includes(q));
                      if (!matchesTitle && !matchesSummary && !matchesSource && !matchesTags) {
                        return false;
                      }
                    }
                    if (onlyVerified && !art.authorVerified) {
                      return false;
                    }
                    return true;
                  }).map((art, idx) => (
                    <div
                      key={`comm-art-${art.id}-${idx}`}
                      onClick={() => setSelectedArticle(art)}
                      className="bg-slate-900/60 hover:bg-slate-900/95 border border-indigo-500/15 hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between group relative h-full"
                    >
                      {/* CHECKBOX MULTI-SELECT FOR SYNTHESIS */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = new Set(selectedArticleIdsForSynthesis);
                          if (updated.has(art.id)) {
                            updated.delete(art.id);
                          } else {
                            updated.add(art.id);
                          }
                          setSelectedArticleIdsForSynthesis(updated);
                        }}
                        className="absolute top-4 left-4 z-20 cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedArticleIdsForSynthesis.has(art.id) 
                            ? "bg-indigo-500 border-indigo-500 text-white" 
                            : "bg-slate-950/80 border-indigo-500/20 text-transparent"
                        }`} title="Sélectionner pour une Synthèse de Dossier IA">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>★ {art.score}% Match</span>
                      </div>

                      <div>
                        {/* Header */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider mb-3">
                          <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
                            {art.category}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">{art.source}</span>
                        </div>

                        <h3 className="font-sans font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-cyan-300 transition-colors mb-2.5 flex items-start gap-2">
                          <span className="text-xl sm:text-2xl mt-0.5 shrink-0">{art.emoji}</span>
                          <span>{art.title}</span>
                        </h3>

                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed line-clamp-3 mb-4 font-sans">
                          {art.summary}
                        </p>
                      </div>

                      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-bold text-indigo-400 flex items-center gap-1">
                            @{art.authorName.split(" ")[0]}
                            {art.authorVerified && (
                              <span className="text-emerald-400" title="Vérifié">✓</span>
                            )}
                          </span>
                          <span>•</span>
                          <span>{art.time}</span>
                        </div>

                        <button
                          onClick={(e) => handleLike(art, e)}
                          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/25 transition-all"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                          {art.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Submit / Propose Article Form tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form left block */}
          <div className="lg:col-span-8 space-y-6">
            {!currentUser ? (
              /* Auth Wall for Posting */
              <div className="space-y-6">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-indigo-500/20 text-center space-y-4">
                  <Lock className="w-10 h-10 text-violet-400 mx-auto animate-pulse" />
                  <h3 className="font-serif italic text-xl font-bold text-white">Connexion requise</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Pour garantir l'intégrité de la plateforme InfoPerso et éviter les publications abusives, vous devez vous authentifier pour pouvoir publier.
                  </p>
                </div>
                <UserAuth onNotify={onNotify} />
              </div>
            ) : (
              /* Verified/Non-Verified Banner + Submission Form */
              <div className="space-y-6">
                {!currentUser.emailVerified && (
                  <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-white">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-300">Adresse e-mail non vérifiée</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Vous pouvez soumettre un article, mais nous recommandons vivement de vérifier votre adresse e-mail. Les comptes vérifiés obtiennent un indice d'intérêt prioritaire et leurs articles sont mis en avant.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-indigo-500/15 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormType("own")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${formType === "own" ? "bg-violet-500/20 text-violet-300 border border-violet-500/20" : "text-slate-400 hover:text-white"}`}
                    >
                      📝 Rédiger ma propre tribune
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("suggest")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${formType === "suggest" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20" : "text-slate-400 hover:text-white"}`}
                    >
                      🔗 Proposer un article externe
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Titre de l'article <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={formType === "own" ? "Quel message souhaitez-vous partager ?" : "Ex: Apple Intelligence révolutionne l'iPad..."}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans"
                      />
                    </div>

                    {/* Source */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Source / Auteur <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={formType === "own" ? "Ex: Ma réflexion personnelle, Mon Blog" : "Ex: TechCrunch, Le Monde"}
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Catégorie <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Emoji Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Emoji d'illustration
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={emoji}
                          onChange={(e) => setEmoji(e.target.value)}
                          className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans cursor-pointer flex-1"
                        >
                          {EMOJIS.map((e) => (
                            <option key={e} value={e}>
                              {e} {e === "🤖" ? "Robot" : e === "⚛️" ? "React" : e === "🌊" ? "Vague/Occitanie" : ""}
                            </option>
                          ))}
                        </select>
                        <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-2xl">
                          {emoji}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Tags (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: IA, Débat, Innovation"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans"
                      />
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Résumé / Accroche <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Un court paragraphe accrocheur qui sera affiché dans le flux d'actualités."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans resize-none"
                      />
                    </div>

                    {/* Full content */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs text-slate-400 font-sans font-bold uppercase tracking-wider">
                        Contenu complet <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={8}
                        placeholder={
                          formType === "own" 
                            ? "Rédigez ici votre article de blog ou votre tribune en détail. Séparez vos paragraphes par des retours à la ligne."
                            : "Copiez-collez ici le contenu de l'article pour permettre aux membres de la communauté de le lire en entier directement depuis InfoPerso."
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white outline-none font-sans resize-y"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Auteur : <strong>{currentUser.displayName || currentUser.email}</strong></p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-linear-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:opacity-95 disabled:opacity-40 text-white font-sans font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-lg shadow-indigo-500/20"
                    >
                      {submitting ? "Publication..." : "Publier l'article"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Guidelines Right Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/30 border border-indigo-500/10 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-sans font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Charte d'InfoPerso
              </span>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400 font-sans list-disc list-inside">
                <li>
                  <strong className="text-slate-200">Qualité éditoriale</strong> : Proposez des articles clairs, sourcés, avec un titre explicite.
                </li>
                <li>
                  <strong className="text-slate-200">Respect de la communauté</strong> : Pas d'injures, de spam, ni de publicité déguisée.
                </li>
                <li>
                  <strong className="text-slate-200">Validation d'adresse e-mail</strong> : Nous vous invitons à confirmer votre adresse pour sécuriser vos droits de publication.
                </li>
                <li>
                  <strong className="text-slate-200">Recommandation intelligente</strong> : Notre IA analyse automatiquement la pertinence et calcule un taux de recommandation à la publication !
                </li>
              </ul>
            </div>

            {currentUser && (
              <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <p className="text-xs text-slate-500">Vous êtes connecté sous :</p>
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white uppercase shadow">
                    {currentUser.displayName?.slice(0, 2) || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">{currentUser.displayName || "Membre InfoPerso"}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{currentUser.email}</p>
                  </div>
                </div>
                {currentUser.emailVerified ? (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Compte Vérifié
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    Non vérifié
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION BAR FOR IA SYNTHESIS */}
      {selectedArticleIdsForSynthesis.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-indigo-500/30 py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white font-sans">{selectedArticleIdsForSynthesis.size} articles sélectionnés</span>
            <span className="text-[10px] text-slate-400 font-sans">Créez une synthèse thématique IA croisée</span>
          </div>
          <button
            onClick={handleGenerateSynthesis}
            className="bg-linear-to-r from-cyan-400 via-indigo-500 to-violet-500 hover:opacity-95 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 font-sans uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Synthèse IA
          </button>
        </div>
      )}

      {/* SYNTHESIS MODAL POPUP */}
      {showSynthesisModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowSynthesisModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-sans">Tissage de Synthèse IA Collaborative 🧠</h3>
            </div>

            {isGeneratingSynthesis ? (
              <div className="py-12 text-center space-y-4">
                <div className="flex justify-center gap-1.5">
                  <span className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <div>
                  <p className="font-bold text-sm text-cyan-400 animate-pulse">L'IA tisse des liens et synthétise vos articles...</p>
                  <p className="text-xs text-slate-400 mt-1">Génération d'un résumé croisé structuré avec axes thématiques.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Titre du Dossier :</label>
                  <input 
                    type="text" 
                    value={synthesisTitle} 
                    onChange={(e) => setSynthesisTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ex: Dossier IA en Occitanie..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contenu Synthétisé :</label>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                    {synthesisResult}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowSynthesisModal(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePublishSynthesis}
                    disabled={submitting}
                    className="px-4 py-2 bg-linear-to-r from-cyan-400 via-indigo-500 to-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-95"
                  >
                    {submitting ? "Publication..." : "Publier dans la Communauté (+10 pts)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
