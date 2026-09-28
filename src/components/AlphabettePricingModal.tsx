import React, { useState, useEffect } from "react";
import {
  Check,
  Sparkles,
  Shield,
  Layers,
  X,
  CreditCard,
  KeyRound,
  ExternalLink,
  Award,
  Clock,
  Gift,
  Copy,
  CheckCircle2,
  Lock,
  Loader2
} from "lucide-react";
import { AlphabetteSuiteConfig } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

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
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSuccessMsg, setCodeSuccessMsg] = useState<string | null>(null);
  const [codeErrorMsg, setCodeErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Configuration dynamique avec valeurs par défaut officielles
  const [config, setConfig] = useState<AlphabetteSuiteConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // État du forfait actuel
  const [activePlan, setActivePlan] = useState<string>(() => {
    return localStorage.getItem("alphabette_user_plan") || "trial";
  });

  // Calcul du temps restant pour l'essai gratuit 7 jours
  const [trialDaysLeft] = useState<number>(() => {
    const trialStarted = localStorage.getItem("alphabette_trial_started_at");
    if (!trialStarted) {
      const now = Date.now();
      localStorage.setItem("alphabette_trial_started_at", String(now));
      return 7;
    }
    const elapsedDays = Math.floor((Date.now() - Number(trialStarted)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - elapsedDays);
  });

  // Chargement des données dynamiques du hub
  useEffect(() => {
    if (isOpen) {
      setIsLoadingConfig(true);
      safeFetchJson<AlphabetteSuiteConfig>("/api/alphabette/config")
        .then(({ ok, data }) => {
          if (ok && data) {
            setConfig(data);
          }
        })
        .finally(() => setIsLoadingConfig(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Tarifs stricts et officiels ALPHABETTE SASU (Valentin RICHAUD)
  const soloPrice = 15; // 15 € TTC / an
  const passPrice = 40; // 40 € TTC / an
  const hubUrl = config?.hubUrl || "http://alphabette.fr";

  // Copie 1-clic de la grille tarifaire officielle
  const handleCopyTarifs = () => {
    const textToCopy = `# GRILLE TARIFAIRE OFFICIELLE — ALPHABETTE SASU
Éditeur : ALPHABETTE SASU • Valentin RICHAUD • La Grande-Motte
Hébergement souverain : VPS OVH (France) • Zéro revente de données • Aucune publicité

1. OFFRE SOLO — INFO PERSO : 15 € TTC / an
- Accès complet et illimité à l'application Info Perso
- Traitement IA souverain et confidentiel
- Aucun prélèvement mensuel, paiement annuel direct

2. LE « PASS ALPHABETTE » : 40 € TTC / an (Recommandé)
- Accès illimité à tout le bouquet des 15 applications actuelles et futures
- Info Perso, IADébat, L'Œil de l'Atelier, et toute la suite logicielle
- Rentabilité maximale : seulement 2,66 € / an par application

3. CODE PRIVILÈGE & ESSAI
- Essai gratuit immédiat de 7 jours
- Activation par code d'accès ou invitation (1 an offert)

Site officiel : http://alphabette.fr`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      if (onNotify) onNotify("📋 Grille tarifaire copiée dans le presse-papier !");
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  // Validation des Codes Privilèges / Amis (Usage Unique)
  const handleValidateAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();
    if (!code || isVerifyingCode) return;

    setIsVerifyingCode(true);
    setCodeErrorMsg(null);
    setCodeSuccessMsg(null);

    try {
      const userEmail = localStorage.getItem("infoperso_user_email") || "";
      const { ok, data, error } = await safeFetchJson<{
        success: boolean;
        message?: string;
        error?: string;
        plan?: string;
        duration?: string;
      }>("/api/alphabette/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userEmail })
      });

      if (ok && data?.success) {
        const planAssigned = data.plan || "pass_alphabette";
        setActivePlan(planAssigned);
        localStorage.setItem("alphabette_user_plan", planAssigned);
        localStorage.setItem("alphabette_access_code", code);
        setCodeSuccessMsg(data.message || "Code privilège validé avec succès (1 an d'accès offert) !");
        setAccessCode("");
        if (onNotify) {
          onNotify("🔑 Code privilège activé ! Accès complet accordé.");
        }
      } else {
        const errMsg = data?.error || error || "Code d'accès invalide ou déjà consommé.";
        setCodeErrorMsg(errMsg);
      }
    } catch {
      setCodeErrorMsg("Erreur lors de la validation avec le hub Alphabette.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Redirection Stripe Checkout sur alphabette.fr
  const handleStripeCheckout = (planId: string) => {
    const checkoutUrl = `${hubUrl}/checkout?plan=${planId}&app=infoperso`;
    if (typeof window !== "undefined") {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
    if (onNotify) {
      onNotify("Redirection vers la session sécurisée Stripe sur alphabette.fr...");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl rounded-2xl border-2 shadow-2xl overflow-hidden my-auto transition-all ${
          isDark
            ? "bg-slate-900 border-slate-700 text-white"
            : "bg-white border-slate-300 text-slate-900"
        }`}
      >
        {/* En-tête : Ultra-lisible et direct */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
            isDark
              ? "bg-slate-950 border-slate-800"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                ALPHABETTE SASU
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white flex items-center gap-1.5 shadow-xs">
                <Shield className="w-3.5 h-3.5" />
                Hébergé en France (OVH) • Zéro Publicité
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
              Tarifs et Abonnements Annuels
            </h2>
            <p className={`text-sm mt-1 max-w-xl font-medium leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Tarification simple, juste et transparente. Aucun prélèvement mensuel, aucun renouvellement dissimulé.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 border ${
              isDark
                ? "bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-200"
            }`}
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bannière Essai Gratuit 7 Jours */}
        <div
          className={`px-5 sm:px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm font-semibold ${
            isDark
              ? "bg-indigo-950 border-indigo-800 text-white"
              : "bg-indigo-100 border-indigo-200 text-indigo-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Essai gratuit immédiat :</strong> 7 jours offerts pour tester l'ensemble des fonctionnalités.
            </span>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                trialDaysLeft > 0
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {trialDaysLeft > 0 ? `${trialDaysLeft} jour(s) d'essai restant(s)` : "Essai terminé"}
            </span>
          </div>
        </div>

        {/* Corps de la modale */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          
          {/* Section 1 : Deux Formules Claires (Pas de gris sur gris) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Formule 1 : Application Seule - 15 € / an */}
            <div
              className={`p-6 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                activePlan === "solo" || activePlan === "solo_byok" || activePlan === "solo_managed"
                  ? "border-indigo-500 ring-4 ring-indigo-500/20"
                  : isDark
                  ? "bg-slate-800/90 border-slate-600 hover:border-indigo-400"
                  : "bg-slate-50 border-slate-300 hover:border-indigo-500 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                    Application Seule
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-indigo-600 text-white">
                    Info Perso
                  </span>
                </div>

                <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Abonnement Annuel
                </h3>

                <div className="flex items-baseline gap-2 my-3">
                  <span className={`text-4xl sm:text-5xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    {soloPrice} €
                  </span>
                  <span className={`text-sm font-bold uppercase ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    TTC / an
                  </span>
                </div>

                <p className={`text-sm mb-4 leading-relaxed font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  Accès complet et illimité à l'application Info Perso pendant 1 an.
                </p>

                <ul className="space-y-2.5 text-sm font-medium">
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Flux d'actualités filtré et veille éditoriale vérifiée</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Coffre-fort chiffré Zero-Knowledge & simulateurs</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Zéro pub, zéro revente de données personnelles</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Paiement annuel direct (aucun prélèvement mensuel)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleStripeCheckout("solo")}
                className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-black text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Choisir Info Perso (15 € / an)</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Formule 2 : Pass ALPHABETTE Complet - 40 € / an (Recommandé) */}
            <div
              className={`p-6 rounded-2xl border-2 flex flex-col justify-between transition-all relative overflow-hidden ${
                activePlan === "pass_alphabette" || activePlan === "bundle_integral"
                  ? "border-emerald-400 ring-4 ring-emerald-500/20"
                  : isDark
                  ? "bg-slate-800/90 border-emerald-500/80 shadow-lg"
                  : "bg-emerald-50/70 border-emerald-500 shadow-md"
              }`}
            >
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-xs px-3 py-1 uppercase tracking-wider rounded-bl-xl shadow-xs">
                Recommandé • Meilleur Tarif
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Bouquet Complet (15 Apps)
                  </span>
                </div>

                <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                  Pass ALPHABETTE
                </h3>

                <div className="flex items-baseline gap-2 my-3">
                  <span className={`text-4xl sm:text-5xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                    {passPrice} €
                  </span>
                  <span className={`text-sm font-bold uppercase ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    TTC / an
                  </span>
                </div>

                <p className={`text-sm mb-4 leading-relaxed font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  Débloquez l'ensemble du bouquet applicatif actuel et les futures applications.
                </p>

                <ul className="space-y-2.5 text-sm font-medium">
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Accès illimité aux 15 applications souveraines</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Info Perso, IADébat, L'Œil de l'Atelier, et futures sorties</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Revient à seulement <strong>2,66 € / an</strong> par application !</span>
                  </li>
                  <li className={`flex items-start gap-2.5 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Compte unifié Alphabette, aucun prélèvement mensuel</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleStripeCheckout("pass_alphabette")}
                className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Prendre le Pass ALPHABETTE (40 € / an)</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 2 : Validation Code Privilège / Invitation */}
          <div
            className={`p-5 rounded-2xl border-2 space-y-3 ${
              isDark
                ? "bg-slate-950 border-slate-700"
                : "bg-slate-100 border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h4 className={`text-sm font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-950"}`}>
                  Vous avez un code privilège ou une invitation ?
                </h4>
              </div>
              <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Activation instantanée (1 an offert)
              </span>
            </div>

            <form onSubmit={handleValidateAccessCode} className="flex gap-2.5">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Entrez votre code (ex: AMIS-2026, ALPHABETTE)..."
                className={`flex-1 rounded-xl px-4 py-3 text-sm uppercase font-mono font-bold outline-none transition-colors border-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-400"
                    : "bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:border-indigo-600"
                }`}
              />
              <button
                type="submit"
                disabled={!accessCode.trim() || isVerifyingCode}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md"
              >
                {isVerifyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Activer
              </button>
            </form>

            {codeSuccessMsg && (
              <p className="text-sm text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4" />
                {codeSuccessMsg}
              </p>
            )}

            {codeErrorMsg && (
              <p className="text-sm text-rose-400 font-bold flex items-center gap-1.5 pt-1">
                <X className="w-4 h-4" />
                {codeErrorMsg}
              </p>
            )}
          </div>

          {/* Section 3 : Éthique & Absence de prélèvement mensuel */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Engagement éthique :</strong> Aucun prélèvement mensuel afin d'éviter les frais d'intermédiaires bancaires. Zéro revente de données personnelles, aucune régie pub tierce.
              </span>
            </div>
            
            {/* Bouton de copie directe 1-clic de la grille tarifaire */}
            <button
              onClick={handleCopyTarifs}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors border ${
                isCopied
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                  : "bg-white hover:bg-slate-200 text-slate-900 border-slate-300"
              }`}
              title="Copier la grille tarifaire officielle en 1-clic"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isCopied ? "Copié !" : "Copier les tarifs"}</span>
            </button>
          </div>
        </div>

        {/* Pied de page standardisé */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm ${
            isDark
              ? "bg-slate-950 border-slate-800 text-slate-200"
              : "bg-slate-100 border-slate-200 text-slate-700"
          }`}
        >
          <a
            href={hubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 font-bold transition-colors flex items-center gap-2 text-emerald-500"
          >
            <Layers className="w-4 h-4" />
            <span>Découvrir les 15 applications sur {hubUrl}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-600"
                : "bg-white hover:bg-slate-200 text-slate-900 border-slate-300"
            }`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
