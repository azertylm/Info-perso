import React, { useState } from "react";
import {
  Check,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Heart,
  X,
  CreditCard,
  KeyRound,
  ExternalLink,
  Award
} from "lucide-react";

interface AlphabettePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
  isDark?: boolean;
}

export default function AlphabettePricingModal({
  isOpen,
  onClose,
  onNotify,
  isDark = true
}: AlphabettePricingModalProps) {
  const [accessCode, setAccessCode] = useState("");
  const [activePlan, setActivePlan] = useState<"individual" | "bundle" | "free">(() => {
    return (localStorage.getItem("alphabette_user_plan") as any) || "free";
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: "individual" | "bundle") => {
    setIsProcessing(true);
    setTimeout(() => {
      setActivePlan(plan);
      localStorage.setItem("alphabette_user_plan", plan);
      setIsProcessing(false);
      if (onNotify) {
        onNotify(`🎉 Félicitations ! Votre abonnement annuel ${plan === "individual" ? "Individuel (15 € TTC / an)" : "Pass ALPHABETTE (40 € TTC / an)"} est activé.`);
      }
    }, 600);
  };

  const handleValidateAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();
    if (!code) return;

    if (code === "ALPHABETTE" || code === "VALENTIN" || code === "SOVEREIGN" || code.startsWith("ALPHA-")) {
      setActivePlan("bundle");
      localStorage.setItem("alphabette_user_plan", "bundle");
      localStorage.setItem("alphabette_access_code", code);
      if (onNotify) {
        onNotify("🔑 Code d'accès vérifié ! Pass ALPHABETTE complet déverrouillé.");
      }
      setAccessCode("");
    } else {
      if (onNotify) {
        onNotify("❌ Code d'accès invalide. Utilisez 'ALPHABETTE' pour la démonstration.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isDark
            ? "bg-zinc-950 border-zinc-800 text-zinc-100"
            : "bg-white border-zinc-250 text-zinc-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-gradient-to-r from-emerald-950/40 via-indigo-950/20 to-transparent flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ALPHABETTE SASU
              </span>
              <span className="text-xs text-zinc-400">Éditeur souverain fondé par Valentin RICHAUD à La Grande-Motte</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              Abonnements Souverains & Transparents
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Zéro publicité, zéro revente de vos données personnelles. Traitement optimisé et respect strict de votre vie privée.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note frais bancaires / Pas de mensuel */}
        <div className="px-4 sm:px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-[11px] sm:text-xs text-amber-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Tarification annuelle directe :</strong> Aucun prélèvement mensuel n'est proposé sur ce pôle afin d'éviter les frais bancaires intermédiaires et de garantir le tarif le plus juste.
          </span>
        </div>

        {/* Plans Grid */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Formule 1: Application Individuelle */}
            <div
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                activePlan === "individual"
                  ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/40"
                  : isDark
                  ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  : "bg-zinc-50 border-zinc-250 hover:border-zinc-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-zinc-100">Application Individuelle</h3>
                  {activePlan === "individual" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Actif
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-white">15 €</span>
                  <span className="text-xs text-zinc-400 font-semibold">TTC / an</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Accès complet et illimité à l'application de votre choix (ex: <strong>Infos Perso</strong>, <strong>IADébat</strong> ou <strong>L'Œil de l'Atelier</strong>).
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Accès illimité sans publicité ni traqueurs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Confidentialité stricte & souveraineté numérique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Synchronisation multi-appareils (PC, tablette, mobile)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Abonnement annuel simple (1,25 € / mois équivalent)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan("individual")}
                disabled={isProcessing || activePlan === "individual"}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activePlan === "individual"
                    ? "bg-zinc-800 text-zinc-400 cursor-default"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                }`}
              >
                {activePlan === "individual" ? (
                  <>
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Abonnement Actif</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Choisir cette formule (15 € TTC / an)</span>
                  </>
                )}
              </button>
            </div>

            {/* Formule 2: Pass ALPHABETTE Complet */}
            <div
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                activePlan === "bundle"
                  ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40"
                  : isDark
                  ? "bg-zinc-900/80 border-zinc-750 hover:border-zinc-700"
                  : "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
              }`}
            >
              <div className="absolute -top-3 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-md">
                  Bouquet Complet
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Pass ALPHABETTE
                  </h3>
                  {activePlan === "bundle" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Actif
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-white">40 €</span>
                  <span className="text-xs text-zinc-400 font-semibold">TTC / an</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Accès universel à l'ensemble du bouquet applicatif actuel et à toutes les futures applications éditées par ALPHABETTE SASU :
                </p>

                <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 space-y-1.5 mb-4 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <strong>Infos Perso</strong> (Presse citoyenne & veille approfondie)
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <strong>IADébat</strong> (Confrontation d'arguments & esprit critique)
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <strong>L'Œil de l'Atelier</strong> (Outils métiers & inspection 3D)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <strong>+ Toutes les futures applications</strong> incluses d'office
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Toutes les applications actuelles et futures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zéro régie publicitaire, zéro revente de données</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Compte unifié citoyen ALPHABETTE</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan("bundle")}
                disabled={isProcessing || activePlan === "bundle"}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activePlan === "bundle"
                    ? "bg-zinc-800 text-zinc-400 cursor-default"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 font-black"
                }`}
              >
                {activePlan === "bundle" ? (
                  <>
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Pass ALPHABETTE Actif</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Souscrire au Pass ALPHABETTE (40 € TTC / an)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saisie de code d'accès entreprise ou citoyen */}
          <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-zinc-200">
                Vous disposez d'un code d'accès ou d'une licence ?
              </h4>
            </div>
            <form onSubmit={handleValidateAccessCode} className="flex gap-2">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Ex: ALPHABETTE"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Valider
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>ALPHABETTE SASU • La Grande-Motte • Hébergement souverain OVH</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
