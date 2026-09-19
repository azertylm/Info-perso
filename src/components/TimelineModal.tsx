import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NewsArticle, TimelineEvent } from "../types";
import {
  Clock,
  Calendar,
  Sparkles,
  X,
  ChevronRight,
  Milestone,
  ArrowRight,
  Share2,
  CheckCircle2
} from "lucide-react";

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isDark: boolean;
  onNotify: (msg: string) => void;
  geminiApiKey?: string;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  article,
  isDark,
  onNotify,
  geminiApiKey
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!article) return;

    // Generate contextual heuristic timeline
    const generateHeuristicTimeline = (art: NewsArticle): TimelineEvent[] => {
      const title = art.title;
      const cat = art.category || "Actualité";

      // Rigorous fact-checked chronological milestones for La Grande-Motte Ville-Port
      if (art.id === 3 || (art.title && art.title.toLowerCase().includes("grande-motte"))) {
        return [
          {
            date: "2018 - 2019",
            title: "Genèse du projet 'Ville-Port'",
            description: "La municipalité et les partenaires régionaux engagent les études initiales pour transformer le port cinquantenaire (Acte II de la Mission Racine).",
            badge: "Origines",
            isMilestone: false
          },
          {
            date: "Septembre 2023",
            title: "Validation de 'Ville-Port 2'",
            description: "Après concertations citoyennes et concertations sur le patrimoine de Balladur, le conseil municipal valide le projet réajusté.",
            badge: "Délibération",
            isMilestone: false
          },
          {
            date: "2024 - 2025",
            title: "Enquête publique & travaux préparatoires",
            description: "Avis d'enquête publique favorable, réorganisation des zones techniques et fermetures préalables des accès fin 2025.",
            badge: "Préparation",
            isMilestone: false
          },
          {
            date: "Janvier 2026",
            title: "Démarrage des travaux portuaires",
            description: "Lancement effectif du dragage lourd, confortement des quais et sécurisation des bassins face aux submersions marines.",
            badge: "Travaux engagés",
            isMilestone: true
          },
          {
            date: "Automne 2026 - 2028",
            title: "Chantier Presqu'île Baumel & Halle Nautique",
            description: "Requalification du cœur opérationnel, construction de la Halle Nautique de 3 000 m² et du Bureau du Port (agence ODA).",
            badge: "Phases en cours",
            isMilestone: true
          },
          {
            date: "Horizon 2030",
            title: "Livraison finale des 400 anneaux & 'La Colline'",
            description: "Achèvement complet des extensions éco-conçues, des 2,5 km de promenade littorale et du quartier résidentiel de 250 logements.",
            badge: "Projection finale",
            isMilestone: false
          }
        ];
      }

      return [
        {
          date: "Il y a 6 à 12 mois",
          title: "Genèse et premières alertes",
          description: `Premières expérimentations et signaux faibles précurseurs dans le domaine ${cat}. Mise en place des cadres initiaux liés à "${art.tags[0] || 'ce secteur'}".`,
          badge: "Origines",
          isMilestone: false
        },
        {
          date: "Le mois dernier",
          title: "Accélération et négociations clés",
          description: `Publication de premiers rapports d'étape et phase d'arbitrage stratégique par ${art.source} et les parties prenantes.`,
          badge: "Préparation",
          isMilestone: false
        },
        {
          date: "Aujourd'hui (Fait d'actualité)",
          title: title,
          description: art.summary || art.content.slice(0, 220) + "...",
          badge: "Point de rupture",
          isMilestone: true
        },
        {
          date: "D'ici 3 à 6 mois",
          title: "Mise en application & Premiers retours d'expérience",
          description: `Déploiement des premières directives, audit d'impact opérationnel et réactions des usagers et régulateurs.`,
          badge: "Échéance future",
          isMilestone: false
        },
        {
          date: "À horizon 1 an",
          title: "Standardisation et nouvel équilibre de marché",
          description: `Stabilisation des normes, intégration définitive dans les pratiques sectorielles et éventuels ajustements législatifs.`,
          badge: "Projection",
          isMilestone: false
        }
      ];
    };

    setEvents(generateHeuristicTimeline(article));
  }, [article]);

  const handleEnrichWithAI = async () => {
    if (!article) return;
    setIsGenerating(true);
    onNotify("⏳ Reconstitution de la frise chronologique avec l'IA...");

    try {
      const prompt = `Tu es un historien et journaliste d'investigation. Reconstitue la frise chronologique détaillée (passé, présent, futur) de cet événement :
Titre : "${article.title}"
Contenu : "${article.summary || article.content.slice(0, 600)}"

Génère une chronologie en 5 étapes clés.
Réponds STRICTEMENT au format JSON comme suit :
{
  "events": [
    {
      "date": "Date ou période estimée",
      "title": "Titre marquant",
      "description": "Explication factuelle claire (2 phrases)",
      "badge": "Origines" | "Point de bascule" | "Aujourd'hui" | "Échéance future",
      "isMilestone": true/false
    }
  ]
}`;

      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-3.8-flash",
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
          if (parsed.events && Array.isArray(parsed.events)) {
            setEvents(parsed.events);
            onNotify("✨ Frise chronologique enrichie par l'IA !");
          }
        }
      }
    } catch (e) {
      console.warn("AI timeline generation error:", e);
      onNotify("⚠️ Frise heuristique conservée.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !article) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88vh] overflow-hidden ${
          isDark
            ? "bg-slate-900 border-indigo-500/30 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Frise Chronologique : De la Genèse au Futur</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono font-bold">
                  {events.length} étapes
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

        {/* Timeline Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto scrollbar flex-1 min-h-0 relative">
          <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/30 space-y-8 my-2">
            {events.map((ev, idx) => (
              <div key={idx} className="relative group">
                {/* Node icon / dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    ev.isMilestone
                      ? "bg-indigo-600 border-white text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] ring-4 ring-indigo-500/20"
                      : isDark
                      ? "bg-slate-950 border-indigo-400 text-indigo-400"
                      : "bg-white border-indigo-500 text-indigo-600"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                </div>

                {/* Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    ev.isMilestone
                      ? isDark
                        ? "bg-indigo-950/50 border-indigo-500/50 shadow-lg text-white"
                        : "bg-indigo-50/80 border-indigo-300 shadow-md text-slate-900"
                      : isDark
                      ? "bg-slate-800/50 border-slate-700/60 text-slate-200"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ev.date}
                      </span>
                      {ev.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded border border-slate-700/50 opacity-75">
                          {ev.badge}
                        </span>
                      )}
                    </div>
                    {ev.isMilestone && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                        ⚡ Événement Déclencheur
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base leading-snug mb-1">
                    {ev.title}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 font-sans">
                    {ev.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-3 bg-black/20 shrink-0">
          <button
            onClick={handleEnrichWithAI}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Chronologie en cours..." : "Reconstituer avec l'IA"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700/60 hover:bg-slate-800/60 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
