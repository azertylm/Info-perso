import React from "react";
import { createPortal } from "react-dom";
import { NewsArticle } from "../types";
import {
  FileText,
  Copy,
  Printer,
  Check,
  X,
  ExternalLink,
  Building2,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isDark: boolean;
  onNotify: (msg: string) => void;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  article,
  isDark,
  onNotify
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !article) return null;

  const handleCopyMarkdown = () => {
    const md = `# 📄 NOTE DE DÉCISION EXÉCUTIVE - ${article.title.toUpperCase()}
**Date :** ${new Date().toLocaleDateString("fr-FR")} | **Source :** ${article.source} | **Catégorie :** ${article.category}

---

## 🎯 SYNTHÈSE STRATÉGIQUE (TL;DR)
${article.summary || article.content.slice(0, 250)}

## 🔢 CHIFFRES & INDICATEURS CLÉS
- **Pertinence éditoriale :** ${article.score}/100
- **Délai d'impact estimé :** 30 à 90 jours
- **Périmètre concerné :** Écosystème ${article.tags.slice(0, 3).join(", ")}

## ⚡ FAITS MAJEURS & ENJEUX
1. ${article.content.slice(0, 140)}...
2. Négociations et arbitrages en cours auprès des instances de régulation et des leaders de marché.
3. Évolution des standards concurrentiels impactant directement les décideurs du secteur.

## 🛡️ RISQUES & OPPORTUNITÉS
- **Opportunité :** Anticiper la transition et positionner son offre avant la standardisation.
- **Risque :** Coût d'inaction et exposition réglementaire ou technologique accrue.

## 🚀 RECOMMANDATION OPÉRATIONNELLE
Mettre sous surveillance active le mot-clé "${article.tags[0] || article.category}" et planifier un point d'étape d'ici 30 jours.

---
*Généré par InfoPerso - Veille augmentée et intelligence stratégique.*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    onNotify("📋 Fiche exécutive copiée au format Markdown !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88vh] overflow-hidden ${
          isDark
            ? "bg-slate-900 border-emerald-500/30 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Executive Memo : Fiche de Décision 1-Page</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                  Synthèse Pro
                </span>
              </h3>
              <p className="text-xs opacity-75 truncate max-w-md">
                Prêt pour réunion de direction, investisseurs ou diffusion d'équipe
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

        {/* Printable Document Canvas */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar flex-1 min-h-0 font-sans print:p-0 print:m-0">
          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-500/40 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-emerald-500 block mb-1">
                INFOPERSO STRATEGIC INTELLIGENCE BRIEF
              </span>
              <h2 className="text-lg sm:text-xl font-black leading-tight">
                {article.title}
              </h2>
            </div>
            <div className="text-right text-xs font-mono opacity-80 shrink-0">
              <div><strong>Source :</strong> {article.source}</div>
              <div><strong>Date :</strong> {new Date().toLocaleDateString("fr-FR")}</div>
              <div><strong>Score d'impact :</strong> {article.score}/100</div>
            </div>
          </div>

          {/* Section 1 : Enjeu stratégique */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? "bg-slate-950/60 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}>
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-500 flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>Enjeu Stratégique en Bref</span>
            </h4>
            <p className="text-sm font-semibold leading-relaxed">
              {article.summary || article.content.slice(0, 240)}
            </p>
          </div>

          {/* Section 2 : Key Metrics / Chiffres */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border text-center ${
              isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[11px] opacity-75 uppercase font-mono">Délai d'impact</span>
              <div className="text-lg font-black text-emerald-400 mt-0.5">30 - 90 jours</div>
              <span className="text-[10px] opacity-60">Pression court terme</span>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[11px] opacity-75 uppercase font-mono">Périmètre critique</span>
              <div className="text-base font-black text-cyan-400 mt-0.5 truncate px-1">
                {article.tags.slice(0, 2).join(" & ") || article.category}
              </div>
              <span className="text-[10px] opacity-60">Marchés exposés</span>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[11px] opacity-75 uppercase font-mono">Niveau de risque</span>
              <div className="text-lg font-black text-amber-400 mt-0.5">Modéré à Élevé</div>
              <span className="text-[10px] opacity-60">Veille recommandée</span>
            </div>
          </div>

          {/* Section 3 : Faits majeurs */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">
              ⚡ Développements opérationnels majeurs
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{article.content.slice(0, 180)}...</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Réactions vives et ajustements en chaîne observés parmi les principaux leaders industriels du secteur.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Risque d'asymétrie concurrentielle pour les organisations qui n'anticiperaient pas ces changements.</span>
              </li>
            </ul>
          </div>

          {/* Section 4 : Risques vs Recommandations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <div className="text-xs font-bold uppercase font-mono flex items-center gap-1.5 mb-1 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Points de Vigilance</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Incertitude réglementaire, risques de réputation et coût d'adaptation technique imprévu à court terme.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <div className="text-xs font-bold uppercase font-mono flex items-center gap-1.5 mb-1 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Recommandation d'Action</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Abonner l'équipe au tag « #{article.tags[0] || 'Veille'} », auditer les dépendances internes et préparer une note de cadrage.
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 bg-black/20 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copié !" : "Copier en Markdown"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Imprimer ou enregistrer au format PDF propre"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
