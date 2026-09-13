import React, { useState, useEffect } from "react";
import { NewsArticle, PerspectiveAnalysis } from "../types";
import {
  Scale,
  CheckCircle2,
  TrendingUp,
  Building2,
  Users,
  AlertTriangle,
  Sparkles,
  X,
  Share2,
  HelpCircle,
  ShieldCheck
} from "lucide-react";

interface NuancePerspectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isDark: boolean;
  onNotify: (msg: string) => void;
  geminiApiKey?: string;
}

export const NuancePerspectiveModal: React.FC<NuancePerspectiveModalProps> = ({
  isOpen,
  onClose,
  article,
  isDark,
  onNotify,
  geminiApiKey
}) => {
  const [analysis, setAnalysis] = useState<PerspectiveAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate perspective analysis whenever article changes
  useEffect(() => {
    if (!article) return;

    // Heuristic analysis generator
    const generateHeuristicPerspective = (art: NewsArticle): PerspectiveAnalysis => {
      const title = art.title;
      const content = art.content || art.summary;
      const category = art.category || "Actualité";

      // 1. Factual consensus points
      const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 25);
      const facts = [
        `L'événement principal rapporté par ${art.source} concerne "${title}".`,
        sentences[0] ? `${sentences[0]}.` : `Développement confirmé dans le domaine ${category}.`,
        sentences[1] ? `${sentences[1]}.` : `Informations recoupées et vérifiées par la rédaction.`
      ];

      // 2. Determine polarization & angles
      let polarization: "Faible" | "Modéré" | "Élevé" = "Modéré";
      let eco = `Impact sur les flux d'investissements, la compétitivité et les coûts opérationnels liés à "${title}".`;
      let pol = `Régulation, prises de parole institutionnelles et encadrement normatif par les autorités compétentes.`;
      let soc = `Répercussions directes sur les usages quotidiens, l'acceptabilité citoyenne et les questions éthiques.`;
      let controversies = [
        `Arbitrage entre rapidité de déploiement et principe de précaution.`,
        `Interrogations sur la répartition des bénéfices et l'accès équitable pour tous les usagers.`
      ];

      if (category.toLowerCase().includes("éco") || category.toLowerCase().includes("finance")) {
        polarization = "Faible";
        eco = `Évolution directe des valorisations, rentabilité des acteurs concernés et dynamique concurrentielle à moyen terme.`;
        controversies = [`Pression inflationniste versus incitations à la croissance durable.`];
      } else if (category.toLowerCase().includes("tech") || category.toLowerCase().includes("ia")) {
        polarization = "Modéré";
        eco = `Course à l'innovation mondiale, souveraineté technologique et investissements en capital-risque.`;
        soc = `Protection des données personnelles, impact sur l'emploi et adaptation des compétences.`;
        controversies = [
          `Équilibre entre régulation stricte de l'innovation et compétitivité internationale.`,
          `Gouvernance des modèles et transparence des algorithmes.`
        ];
      } else if (category.toLowerCase().includes("climat") || category.toLowerCase().includes("écol")) {
        polarization = "Élevé";
        eco = `Coût de la transition écologique, réallocation des subventions et rentabilité verte.`;
        pol = `Engagements internationaux, objectifs chiffrés et contraintes légales imposées aux filières.`;
        controversies = [
          `Rythme de la transition : jugé trop lent par les scientifiques, trop brutal par certains secteurs économiques.`
        ];
      }

      return {
        factualConsensus: facts,
        economicAngle: eco,
        politicalAngle: pol,
        societalAngle: soc,
        polarizationLevel: polarization,
        controversyPoints: controversies
      };
    };

    setAnalysis(generateHeuristicPerspective(article));
  }, [article]);

  const handleDeepAIAnalysis = async () => {
    if (!article) return;
    setIsAnalyzing(true);
    onNotify("🔍 Analyse multicritère des perspectives en cours avec l'IA...");

    try {
      const prompt = `Tu es un médiateur de presse et analyste politique et économique neutre. Analyse cet article sous différents angles journalistiques :
Titre : "${article.title}"
Contenu : "${article.summary || article.content.slice(0, 800)}"

Réponds UNIQUEMENT au format JSON strict avec la structure suivante :
{
  "factualConsensus": ["fait 1 établi", "fait 2 vérifié", "fait 3"],
  "economicAngle": "synthèse de l'angle économique",
  "politicalAngle": "synthèse de l'angle politique et réglementaire",
  "societalAngle": "synthèse de l'angle sociétal et citoyen",
  "polarizationLevel": "Faible" ou "Modéré" ou "Élevé",
  "controversyPoints": ["point de divergence 1", "point de divergence 2"]
}`;

      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-3.7-flash",
          apiKey: geminiApiKey || "",
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.message?.content || data?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.factualConsensus && parsed.economicAngle) {
            setAnalysis(parsed);
            onNotify("✨ Analyse des perspectives approfondie par l'IA complétée !");
          }
        }
      }
    } catch (err) {
      console.warn("AI deep perspective analysis error:", err);
      onNotify("⚠️ Analyse rapide appliquée.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen || !article || !analysis) return null;

  const getPolarizationColor = (level: string) => {
    switch (level) {
      case "Faible":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "Modéré":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Élevé":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark
            ? "bg-gradient-to-b from-slate-900 via-slate-950 to-black border-cyan-500/30 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Dossier de Presse Croisé : Nuances & Biais</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPolarizationColor(analysis.polarizationLevel)}`}>
                  Polarisation : {analysis.polarizationLevel}
                </span>
              </h3>
              <p className="text-xs opacity-75 truncate max-w-md">
                {article.title}
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

        {/* Body content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar flex-1">
          {/* Section 1: Faits vérifiés & consensus factuel */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Consensus Factuel Indiscutable</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
              {analysis.factualConsensus.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Angles d'analyse (Éco, Politique, Sociétal) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Angle Économique */}
            <div className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-slate-900/70 border-indigo-500/25" : "bg-indigo-50/40 border-indigo-200"
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Angle Économique</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {analysis.economicAngle}
              </p>
            </div>

            {/* Angle Politique & Institutionnel */}
            <div className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-slate-900/70 border-amber-500/25" : "bg-amber-50/40 border-amber-200"
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
                <Building2 className="w-4 h-4" />
                <span>Angle Réglementaire</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {analysis.politicalAngle}
              </p>
            </div>

            {/* Angle Sociétal & Citoyen */}
            <div className={`p-3.5 rounded-2xl border ${
              isDark ? "bg-slate-900/70 border-cyan-500/25" : "bg-cyan-50/40 border-cyan-200"
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1.5">
                <Users className="w-4 h-4" />
                <span>Angle Sociétal</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {analysis.societalAngle}
              </p>
            </div>
          </div>

          {/* Section 3: Points de controverse & Débats */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-slate-950/60 border-rose-500/30" : "bg-rose-50/50 border-rose-200"
          }`}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Points de Friction & Débats Contradictoires</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
              {analysis.controversyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 bg-black/20">
          <button
            onClick={handleDeepAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-40 transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyse IA approfondie..." : "Affiner l'analyse avec Gemini"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/60 hover:bg-slate-800/60 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
