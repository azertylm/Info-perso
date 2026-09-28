import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Calculator,
  Zap,
  Wrench,
  Euro,
  Layers,
  Copy,
  Check,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface ArtisanProfitabilitySimulatorProps {
  className?: string;
}

export const ArtisanProfitabilitySimulator: React.FC<ArtisanProfitabilitySimulatorProps> = ({
  className = ""
}) => {
  // Paramètres d'entrée
  const [softwarePlan, setSoftwarePlan] = useState<"pass40" | "solo15" | "saas60">("pass40");
  const [hourlyRate, setHourlyRate] = useState<number>(55); // € HT / h
  const [hoursPerJob, setHoursPerJob] = useState<number>(8); // heures par intervention
  const [jobsPerMonth, setJobsPerMonth] = useState<number>(10); // nombre de chantiers par mois
  const [energySavingsYearly, setEnergySavingsYearly] = useState<number>(650); // € / an d'économies d'énergie
  const [equipmentCost, setEquipmentCost] = useState<number>(9000); // Coût total outillage / camionnette
  const [equipmentAmortizationYears, setEquipmentAmortizationYears] = useState<number>(3); // Années d'amortissement
  const [fixedMonthlyCharges, setFixedMonthlyCharges] = useState<number>(1200); // Loyer atelier, assurance décennale, carburant

  const [hoveredJobs, setHoveredJobs] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Coût logiciel annuel selon les tarifs officiels ALPHABETTE
  const softwareCostYearly = useMemo(() => {
    switch (softwarePlan) {
      case "solo15":
        return 15; // 15 € TTC / an
      case "pass40":
        return 40; // 40 € TTC / an (Pass complet)
      case "saas60":
        return 60 * 12; // 720 € / an (SaaS propriétaire concurrent)
    }
  }, [softwarePlan]);

  // Économie logicielle annuelle vs SaaS concurrent standard (720 €)
  const softwareSavingsVsSaaS = useMemo(() => {
    return Math.max(0, 720 - softwareCostYearly);
  }, [softwareCostYearly]);

  // Amortissement annuel du matériel
  const equipmentAmortizationYearly = useMemo(() => {
    if (equipmentAmortizationYears <= 0) return 0;
    return Math.round(equipmentCost / equipmentAmortizationYears);
  }, [equipmentCost, equipmentAmortizationYears]);

  // Coûts fixes annuels totaux (hors fournitures proportionnelles de chantier)
  const totalFixedCostsYearly = useMemo(() => {
    const rentAndInsurance = fixedMonthlyCharges * 12;
    // Les économies d'énergie réduisent directement les charges fixes
    const netFixed = rentAndInsurance + equipmentAmortizationYearly + softwareCostYearly - energySavingsYearly;
    return Math.max(0, netFixed);
  }, [fixedMonthlyCharges, equipmentAmortizationYearly, softwareCostYearly, energySavingsYearly]);

  // Chiffre d'affaires par chantier
  const revenuePerJob = useMemo(() => {
    return hourlyRate * hoursPerJob;
  }, [hourlyRate, hoursPerJob]);

  // Coûts variables par chantier (consommables, déplacement moyen estimé à 20% du CA)
  const variableCostPerJob = useMemo(() => {
    return Math.round(revenuePerJob * 0.22);
  }, [revenuePerJob]);

  // Marge sur coût variable par chantier
  const marginPerJob = useMemo(() => {
    return revenuePerJob - variableCostPerJob;
  }, [revenuePerJob, variableCostPerJob]);

  // Seuil de rentabilité (Point mort) en nombre de chantiers par an
  const breakEvenJobsYearly = useMemo(() => {
    if (marginPerJob <= 0) return 0;
    return Math.ceil(totalFixedCostsYearly / marginPerJob);
  }, [totalFixedCostsYearly, marginPerJob]);

  const breakEvenJobsMonthly = useMemo(() => {
    return +(breakEvenJobsYearly / 12).toFixed(1);
  }, [breakEvenJobsYearly]);

  // Bilan annuel réel avec le volume actuel choisi
  const actualJobsYearly = jobsPerMonth * 12;
  const actualRevenueYearly = actualJobsYearly * revenuePerJob;
  const actualTotalCostsYearly = totalFixedCostsYearly + actualJobsYearly * variableCostPerJob;
  const actualNetProfitYearly = actualRevenueYearly - actualTotalCostsYearly;
  const breakEvenTurnoverYearly = breakEvenJobsYearly * revenuePerJob;

  // Calcul du nombre de jours de travail pour atteindre le point mort (sur 220 j ouvrés)
  const daysToBreakEven = useMemo(() => {
    if (actualRevenueYearly <= 0) return 0;
    const ratio = breakEvenTurnoverYearly / actualRevenueYearly;
    return Math.min(220, Math.round(ratio * 220));
  }, [breakEvenTurnoverYearly, actualRevenueYearly]);

  // Données pour le tracé graphique SVG natif
  // X = nombre de chantiers par an (de 0 à maxRange)
  const maxJobsRange = Math.max(actualJobsYearly * 1.4, breakEvenJobsYearly * 1.5, 30);
  const maxRevenueRange = maxJobsRange * revenuePerJob;

  const svgWidth = 600;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 65 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = (jobs: number) => padding.left + (jobs / maxJobsRange) * innerWidth;
  const scaleY = (amount: number) => padding.top + innerHeight - (amount / maxRevenueRange) * innerHeight;

  // Points SVG pour la courbe de Chiffre d'Affaires
  const caP1 = { x: scaleX(0), y: scaleY(0) };
  const caP2 = { x: scaleX(maxJobsRange), y: scaleY(maxRevenueRange) };

  // Points SVG pour la courbe des Coûts Totaux
  const costP1 = { x: scaleX(0), y: scaleY(totalFixedCostsYearly) };
  const costP2 = { x: scaleX(maxJobsRange), y: scaleY(totalFixedCostsYearly + maxJobsRange * variableCostPerJob) };

  // Coordonnées SVG du point d'équilibre
  const breakEvenX = scaleX(breakEvenJobsYearly);
  const breakEvenY = scaleY(breakEvenTurnoverYearly);

  // Position du point actif (volume actuel ou hover)
  const currentJobs = hoveredJobs !== null ? hoveredJobs : actualJobsYearly;
  const currentRevenue = currentJobs * revenuePerJob;
  const currentCost = totalFixedCostsYearly + currentJobs * variableCostPerJob;
  const currentProfit = currentRevenue - currentCost;

  const activePointX = scaleX(currentJobs);
  const activeCaY = scaleY(currentRevenue);
  const activeCostY = scaleY(currentCost);

  // Polygone de bénéfice net (au-delà du point mort)
  const profitAreaPoints = `
    ${breakEvenX},${breakEvenY}
    ${caP2.x},${caP2.y}
    ${costP2.x},${costP2.y}
  `;

  // Copie de la synthèse en 1 clic (Règle AGENTS.md)
  const handleCopySummary = () => {
    const summaryText = `[SIMULATION DE RENTABILITÉ ARTISAN - ALPHABETTE SASU]
Formule retenue : ${
      softwarePlan === "pass40"
        ? "Pass ALPHABETTE (40 € TTC / an)"
        : softwarePlan === "solo15"
        ? "Formule Solo (15 € TTC / an)"
        : "SaaS Propriétaire (720 € / an)"
    }
Taux horaire : ${hourlyRate} € HT / h (${hoursPerJob}h par chantier)
Volume simulé : ${jobsPerMonth} chantiers / mois (${actualJobsYearly} / an)
Économies d'énergie atelier : ${energySavingsYearly} € / an
Amortissement matériel : ${equipmentAmortizationYearly} € / an (${equipmentCost} € sur ${equipmentAmortizationYears} ans)
Coûts fixes nets annuels : ${totalFixedCostsYearly.toLocaleString("fr-FR")} € / an

RÉSULTATS DE RENTABILITÉ :
• Seuil de rentabilité (Point mort) : ${breakEvenJobsYearly} chantiers/an (${breakEvenJobsMonthly} chantiers/mois)
• Chiffre d'affaires au point mort : ${breakEvenTurnoverYearly.toLocaleString("fr-FR")} €
• Chiffre d'affaires annuel prévu : ${actualRevenueYearly.toLocaleString("fr-FR")} €
• Bénéfice net estimé : ${actualNetProfitYearly.toLocaleString("fr-FR")} € / an
• Atteinte du seuil : ${daysToBreakEven} jours ouvrés (sur 220 jours)
• Économie logiciel ALPHABETTE vs SaaS cloud : +${softwareSavingsVsSaaS.toLocaleString("fr-FR")} € / an`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 p-5 sm:p-6 shadow-2xl text-slate-100 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                Simulateur de Rentabilité & Métriques Artisan
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  ALPHABETTE SASU
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calcul en temps réel du seuil d'équilibre • Amortissements • Économies d'énergie
            </p>
          </div>
        </div>

        {/* Bouton de copie 1-clic de la synthèse */}
        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition-all shadow-sm"
          title="Copier la synthèse financière complète en 1 clic"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Synthèse copiée !</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-400" />
              <span>Copier synthèse 1-clic</span>
            </>
          )}
        </button>
      </div>

      {/* Cartes d'indicateurs clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {/* Point mort (chantiers) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            Seuil de Rentabilité
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {breakEvenJobsMonthly}
            </span>
            <span className="text-xs text-slate-400">chantiers/mois</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Soit {breakEvenJobsYearly} chantiers / an ({breakEvenTurnoverYearly.toLocaleString("fr-FR")} € CA)
          </p>
        </div>

        {/* Jours d'amortissement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            Point Mort dans l'Année
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-amber-300">
              {daysToBreakEven}
            </span>
            <span className="text-xs text-slate-400">jours ouvrés</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Chaque jour au-delà génère du bénéfice net
          </p>
        </div>

        {/* Bénéfice prévisionnel net */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Euro className="h-3.5 w-3.5 text-emerald-400" />
            Bénéfice Net Annuel
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-bold ${
                actualNetProfitYearly >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {actualNetProfitYearly.toLocaleString("fr-FR")} €
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Sur {actualRevenueYearly.toLocaleString("fr-FR")} € de CA facturé
          </p>
        </div>

        {/* Économie Souveraine Alphabette */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Économie Logicielle
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-300">
              +{softwareSavingsVsSaaS.toLocaleString("fr-FR")} €
            </span>
            <span className="text-xs text-emerald-400/80">/ an</span>
          </div>
          <p className="text-[10px] text-emerald-400/70 mt-1">
            Tarif éthique sans prélèvement mensuel
          </p>
        </div>
      </div>

      {/* Graphique Vectoriel Léger en SVG Natif (0 Mo de dépendance externe) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Graphique vectoriel du Seuil d'Équilibre (Point Mort)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-3 rounded-sm bg-emerald-500" /> Chiffre d'Affaires
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-3 rounded-sm bg-red-500" /> Coûts Totaux
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Point Mort
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[300px] select-none"
          >
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grille horizontale */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + innerHeight * (1 - ratio);
              const val = Math.round(maxRevenueRange * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k€` : `${val}€`}
                  </text>
                </g>
              );
            })}

            {/* Zone de bénéfice net */}
            {breakEvenJobsYearly < maxJobsRange && (
              <polygon points={profitAreaPoints} fill="url(#profitGrad)" />
            )}

            {/* Ligne des Coûts Totaux (Fixes + Variables) */}
            <line
              x1={costP1.x}
              y1={costP1.y}
              x2={costP2.x}
              y2={costP2.y}
              stroke="#ef4444"
              strokeWidth="2.5"
            />

            {/* Ligne du Chiffre d'Affaires */}
            <line
              x1={caP1.x}
              y1={caP1.y}
              x2={caP2.x}
              y2={caP2.y}
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Ligne verticale repère du Point Mort */}
            {breakEvenJobsYearly < maxJobsRange && (
              <>
                <line
                  x1={breakEvenX}
                  y1={padding.top}
                  x2={breakEvenX}
                  y2={padding.top + innerHeight}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={breakEvenX}
                  cy={breakEvenY}
                  r="6"
                  fill="#f59e0b"
                  className="animate-pulse"
                />
                <circle cx={breakEvenX} cy={breakEvenY} r="3" fill="#ffffff" />
                <text
                  x={breakEvenX}
                  y={padding.top - 8}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="10"
                  fontWeight="bold"
                >
                  Point Mort ({breakEvenJobsYearly} chantiers)
                </text>
              </>
            )}

            {/* Repère actif (Volume actuel simulé) */}
            <line
              x1={activePointX}
              y1={padding.top}
              x2={activePointX}
              y2={padding.top + innerHeight}
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle cx={activePointX} cy={activeCaY} r="4" fill="#10b981" />
            <circle cx={activePointX} cy={activeCostY} r="4" fill="#ef4444" />

            {/* Axe X (Labels chantiers) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = padding.left + innerWidth * ratio;
              const val = Math.round(maxJobsRange * ratio);
              return (
                <text
                  key={ratio}
                  x={x}
                  y={padding.top + innerHeight + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  {val} ch.
                </text>
              );
            })}
          </svg>
        </div>

        {/* Infobulle dynamique sur le point actif */}
        <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span>
            Volume actuel : <strong>{actualJobsYearly} chantiers / an</strong> ({jobsPerMonth}/mois)
          </span>
          <span>
            CA : <strong className="text-emerald-400">{actualRevenueYearly.toLocaleString("fr-FR")} €</strong>
          </span>
          <span>
            Coûts totaux : <strong className="text-red-400">{actualTotalCostsYearly.toLocaleString("fr-FR")} €</strong>
          </span>
          <span>
            Résultat net :{" "}
            <strong className={actualNetProfitYearly >= 0 ? "text-emerald-400" : "text-red-400"}>
              {actualNetProfitYearly >= 0 ? "+" : ""}
              {actualNetProfitYearly.toLocaleString("fr-FR")} €
            </strong>
          </span>
        </div>
      </div>

      {/* Panneau de réglages interactifs */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Choix Formule Logicielle ALPHABETTE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-blue-400" />
            Abonnement Logiciel
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setSoftwarePlan("pass40")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                softwarePlan === "pass40"
                  ? "bg-blue-600/20 border-blue-500 text-white font-semibold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span>Pass ALPHABETTE (Bouquet Complet)</span>
              <span className="font-bold text-blue-300">40 € TTC / an</span>
            </button>

            <button
              onClick={() => setSoftwarePlan("solo15")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                softwarePlan === "solo15"
                  ? "bg-blue-600/20 border-blue-500 text-white font-semibold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span>L'Œil de l'Atelier (Solo)</span>
              <span className="font-bold text-blue-300">15 € TTC / an</span>
            </button>

            <button
              onClick={() => setSoftwarePlan("saas60")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                softwarePlan === "saas60"
                  ? "bg-red-600/20 border-red-500 text-white font-semibold"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span>Concurrent Cloud SaaS Propriétaire</span>
              <span className="font-bold text-red-300">720 € / an (60€/m)</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Sans prélèvement mensuel ni frais bancaires cachés.
          </p>
        </div>

        {/* Facturation & Taux horaire */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-400" />
            Activité & Taux de Facturation
          </label>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Taux horaire moyen</span>
              <span className="text-white font-bold">{hourlyRate} € HT / h</span>
            </div>
            <input
              type="range"
              min="30"
              max="130"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(+e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Heures par intervention</span>
              <span className="text-white font-bold">{hoursPerJob} h</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={hoursPerJob}
              onChange={(e) => setHoursPerJob(+e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Chantiers par mois</span>
              <span className="text-white font-bold">{jobsPerMonth} chantiers</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={jobsPerMonth}
              onChange={(e) => setJobsPerMonth(+e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Amortissements & Économies d'Énergie */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-emerald-400" />
            Énergie & Matériel Amorti
          </label>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Économies d'énergie atelier</span>
              <span className="text-emerald-400 font-bold">{energySavingsYearly} € / an</span>
            </div>
            <input
              type="range"
              min="0"
              max="2500"
              step="50"
              value={energySavingsYearly}
              onChange={(e) => setEnergySavingsYearly(+e.target.value)}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Matériel / Outillage à amortir</span>
              <span className="text-white font-bold">{equipmentCost.toLocaleString("fr-FR")} €</span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={equipmentCost}
              onChange={(e) => setEquipmentCost(+e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Durée d'amortissement :</span>
            <div className="flex gap-1.5">
              {[2, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setEquipmentAmortizationYears(y)}
                  className={`px-2 py-0.5 rounded text-xs ${
                    equipmentAmortizationYears === y
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {y} ans
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
