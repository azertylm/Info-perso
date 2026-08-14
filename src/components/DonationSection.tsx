import React, { useState } from "react";
import { CreditCard, Copy, Check, Heart, Info, Coins, QrCode, Edit3, Save, Share2 } from "lucide-react";
import { RibInfo } from "../types";

interface DonationSectionProps {
  rib: RibInfo;
  onRibChange: (newRib: RibInfo) => void;
  onNotify: (msg: string) => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
}

export default function DonationSection({
  rib,
  onRibChange,
  onNotify,
  displayMode = "pro",
  themeMode = "dark"
}: DonationSectionProps) {
  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isPro = displayMode === "pro";

  // Class helper selectors
  const getPanelClass = () => {
    if (isSobre) return "bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs";
    if (isWarm) return "bg-[#FDFBF7] border border-amber-900/10 rounded-2xl p-5 shadow-xs font-serif";
    if (isCyber) return "bg-zinc-950 border border-cyan-500/30 rounded-none p-5 shadow-md font-mono";
    if (isFun) return "bg-pink-100 border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    return "bg-slate-900/80 backdrop-blur-md border border-indigo-500/15 rounded-2xl p-5 shadow-xl";
  };

  const getSubTitleClass = () => {
    if (isSobre) return "text-zinc-900 font-bold font-sans";
    if (isWarm) return "text-amber-950 font-bold font-serif";
    if (isCyber) return "text-[#00ffcc] font-black font-mono";
    if (isFun) return "text-black font-black font-sans uppercase italic";
    return "text-white font-sans font-bold";
  };

  const getInputClass = () => {
    if (isSobre) return "w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-500 rounded-lg p-2 text-xs text-zinc-900 outline-hidden transition-all";
    if (isWarm) return "w-full bg-[#FAF6F0] border border-amber-900/20 focus:border-amber-900 rounded-lg p-2 text-xs text-amber-950 outline-hidden transition-all font-serif";
    if (isCyber) return "w-full bg-black border border-cyan-500/30 focus:border-cyan-400 rounded-none p-2 text-xs text-cyan-400 outline-hidden transition-all font-mono";
    if (isFun) return "w-full bg-white border-3 border-black rounded-xl p-2 text-xs text-black outline-hidden transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    return "w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-hidden focus:border-indigo-500 transition-colors";
  };

  const getLabelClass = () => {
    if (isSobre) return "block text-[11px] text-zinc-600 uppercase tracking-widest mb-1 font-bold";
    if (isWarm) return "block text-[11px] text-amber-900/80 uppercase tracking-widest mb-1 font-bold font-serif";
    if (isCyber) return "block text-[11px] text-cyan-500 uppercase tracking-widest mb-1 font-mono";
    if (isFun) return "block text-[11px] text-black uppercase font-black mb-1";
    return "block text-[11px] text-slate-400 uppercase tracking-widest mb-1 font-semibold";
  };

  const getButtonClass = (isActive: boolean = false) => {
    if (isSobre) return `py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isActive ? "bg-zinc-950 border-zinc-950 text-white" : "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-350"}`;
    if (isWarm) return `py-2 rounded-lg text-xs font-serif font-bold transition-all border cursor-pointer ${isActive ? "bg-amber-900 border-amber-900 text-white" : "bg-[#FAF6F0] border-amber-900/15 text-amber-900 hover:bg-[#F2E6D0]"}`;
    if (isCyber) return `py-2 rounded-none text-xs font-mono transition-all border cursor-pointer ${isActive ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.3)]" : "bg-black border-cyan-500/30 text-cyan-400 hover:border-cyan-400"}`;
    if (isFun) return `py-2 rounded-xl text-xs font-black transition-all border-3 border-black cursor-pointer ${isActive ? "bg-fuchsia-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-102" : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50"}`;
    return `py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isActive ? "bg-indigo-500/20 border-indigo-500 text-cyan-300 shadow shadow-indigo-500/20" : "bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300"}`;
  };

  const getActionButtonClass = () => {
    if (isSobre) return "w-full py-2 bg-zinc-900 hover:bg-black text-white text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs";
    if (isWarm) return "w-full py-2 bg-amber-900 hover:bg-amber-950 text-white text-xs font-serif font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all";
    if (isCyber) return "w-full py-2 bg-black hover:bg-zinc-900 text-cyan-400 text-xs font-mono font-bold border border-cyan-400/50 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] flex items-center justify-center gap-1.5 transition-all";
    if (isFun) return "w-full py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-sans font-black border-3 border-black rounded-xl flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all";
    return "w-full py-2 bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/20";
  };
  const [isEditing, setIsEditing] = useState(false);
  const [tempRib, setTempRib] = useState<RibInfo>({ ...rib });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | "libre">(20);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donationType, setDonationType] = useState<"virement" | "cb">("virement");
  const [cbSimStep, setCbSimStep] = useState<"idle" | "submitting" | "success">("idle");

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onNotify(`Copié avec succès : ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveRib = () => {
    // Basic verification
    if (!tempRib.iban || !tempRib.bic || !tempRib.accountHolder) {
      onNotify("⚠️ Veuillez remplir le titulaire, l'IBAN et le BIC.");
      return;
    }
    onRibChange(tempRib);
    setIsEditing(false);
    onNotify("✅ Coordonnées bancaires (RIB) enregistrées !");
  };

  const handleSimulateCb = (e: React.FormEvent) => {
    e.preventDefault();
    setCbSimStep("submitting");
    setTimeout(() => {
      setCbSimStep("success");
      onNotify(`❤️ Merci infiniment pour votre don de ${donationAmount === "libre" ? customAmount : donationAmount}€ !`);
    }, 1500);
  };

  const finalDonationAmount = donationAmount === "libre" ? Number(customAmount) || 0 : donationAmount;

  return (
    <div id="donations-and-rib-view" className="max-w-4xl mx-auto space-y-6">
      {/* Introduction */}
      <div className={`flex flex-col gap-1 border-b pb-4 ${isSobre ? "border-zinc-200" : isWarm ? "border-amber-900/10" : isCyber ? "border-cyan-500/10" : isFun ? "border-black" : "border-slate-800"}`}>
        <h2 className={`font-bold tracking-tight text-2xl flex items-center gap-2 ${
          isSobre ? "text-zinc-900 font-sans" :
          isWarm ? "text-amber-950 font-serif" :
          isCyber ? "text-[#00ffcc] font-mono" :
          isFun ? "text-black font-black" :
          "text-white font-sans"
        }`}>
          <Heart className={`w-5 h-5 text-rose-500 animate-pulse ${isFun ? "fill-rose-500" : "fill-rose-500/20"}`} />
          Espace Dons &amp; Soutien Financier
        </h2>
        <p className={`text-sm ${
          isSobre ? "text-zinc-600 font-sans" :
          isWarm ? "text-amber-900/80 font-serif" :
          isCyber ? "text-cyan-500 font-mono" :
          isFun ? "text-black font-medium" :
          "text-slate-400 font-sans"
        }`}>
          Soutenez le développement d'InfoPerso et l'intégration des modèles d'IA souverains. Configurez votre RIB ou faites un virement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: RIB Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 ${
              isSobre ? "text-zinc-550 font-sans" :
              isWarm ? "text-amber-900/60 font-serif" :
              isCyber ? "text-cyan-500 font-mono" :
              isFun ? "text-black font-black" :
              "text-slate-400 font-sans"
            }`}>
              <CreditCard className={`w-4 h-4 ${isCyber ? "text-cyan-400" : isFun ? "text-black" : "text-cyan-400"}`} />
              Relevé d'Identité Bancaire (RIB)
            </h3>

            <button
              onClick={() => {
                if (isEditing) {
                  setTempRib({ ...rib });
                }
                setIsEditing(!isEditing);
              }}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs border ${
                isSobre ? "bg-white border-zinc-300 text-zinc-850 hover:bg-zinc-100 hover:border-zinc-400" :
                isWarm ? "bg-[#FAF6F0] border-amber-900/20 text-amber-900 hover:bg-[#F2E6D0]" :
                isCyber ? "bg-black border-cyan-500 text-cyan-400 font-mono hover:bg-zinc-900" :
                isFun ? "bg-yellow-300 border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                "bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50"
              }`}
            >
              <Edit3 className={`w-3.5 h-3.5 ${isFun ? "text-black" : "text-cyan-400"}`} />
              {isEditing ? "Annuler l'édition" : "Modifier mon RIB"}
            </button>
          </div>

          {isEditing ? (
            /* RIB Editor form */
            <div className={getPanelClass() + " space-y-4 shadow-xl"}>
              <h4 className={`font-bold text-sm flex items-center gap-1.5 ${getSubTitleClass()}`}>
                <Coins className={`w-4 h-4 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400"}`} />
                Configuration de votre RIB personnel
              </h4>
              <p className={`text-xs leading-normal ${isSobre ? "text-zinc-600 font-sans" : isWarm ? "text-amber-900/85 font-serif" : isCyber ? "text-cyan-500 font-mono" : isFun ? "text-black font-semibold" : "text-slate-400 font-sans"}`}>
                Saisissez les informations de votre RIB ci-dessous. Elles s'afficheront sur la carte ci-dessous pour que vos utilisateurs puissent faire des dons.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={getLabelClass()}>Nom de la Banque</label>
                  <input
                    type="text"
                    value={tempRib.bankName}
                    onChange={(e) => setTempRib({ ...tempRib, bankName: e.target.value })}
                    className={getInputClass()}
                    placeholder="ex: Crédit Agricole Occitanie"
                  />
                </div>
                <div>
                  <label className={getLabelClass()}>Titulaire du Compte</label>
                  <input
                    type="text"
                    value={tempRib.accountHolder}
                    onChange={(e) => setTempRib({ ...tempRib, accountHolder: e.target.value })}
                    className={getInputClass()}
                    placeholder="M. Jean DUPONT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={getLabelClass()}>Code Banque</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={tempRib.bankCode}
                    onChange={(e) => setTempRib({ ...tempRib, bankCode: e.target.value })}
                    className={getInputClass() + " text-center font-mono"}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className={getLabelClass()}>Code Guichet</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={tempRib.branchCode}
                    onChange={(e) => setTempRib({ ...tempRib, branchCode: e.target.value })}
                    className={getInputClass() + " text-center font-mono"}
                    placeholder="67890"
                  />
                </div>
                <div className="col-span-2">
                  <label className={getLabelClass()}>Numéro de Compte</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={tempRib.accountNumber}
                    onChange={(e) => setTempRib({ ...tempRib, accountNumber: e.target.value })}
                    className={getInputClass() + " text-center font-mono"}
                    placeholder="00012345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className={getLabelClass()}>Code IBAN</label>
                  <input
                    type="text"
                    value={tempRib.iban}
                    onChange={(e) => setTempRib({ ...tempRib, iban: e.target.value })}
                    className={getInputClass() + " font-mono"}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </div>
                <div>
                  <label className={getLabelClass()}>Code BIC</label>
                  <input
                    type="text"
                    value={tempRib.bic}
                    onChange={(e) => setTempRib({ ...tempRib, bic: e.target.value })}
                    className={getInputClass() + " font-mono text-center"}
                    placeholder="CRCAFR2RXXX"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveRib}
                className={getActionButtonClass()}
              >
                <Save className="w-4 h-4" />
                Enregistrer mon RIB
              </button>
            </div>
          ) : (
            /* Styled RIB Slip Render */
            <div id="french-rib-card" className={`rounded-2xl overflow-hidden font-mono relative transition-all duration-300 ${
              isSobre ? "bg-zinc-50 border border-zinc-200 text-zinc-900 shadow-xs" :
              isWarm ? "bg-[#FDFBF7] border border-amber-900/15 text-amber-950 font-serif shadow-xs" :
              isCyber ? "bg-black border border-cyan-500 text-cyan-400 font-mono shadow-md" :
              isFun ? "bg-white border-3 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl" :
              "bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10"
            }`}>
              {!isSobre && !isWarm && (
                <>
                  <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -left-20 -top-20 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                </>
              )}

              {/* Slip Header */}
              <div className={`p-4 flex items-center justify-between relative ${
                isSobre ? "bg-zinc-100 border-b border-zinc-200" :
                isWarm ? "bg-[#FAF6F0] border-b border-amber-900/15" :
                isCyber ? "bg-black border-b border-cyan-500/30" :
                isFun ? "bg-yellow-300 border-b-3 border-black font-black text-black" :
                "bg-slate-950/60 border-b border-slate-800/80"
              }`}>
                <span className={
                  isSobre ? "text-[10px] text-zinc-500 font-sans font-bold uppercase tracking-wider" :
                  isWarm ? "text-[10px] text-amber-900/60 font-serif uppercase tracking-wider" :
                  isCyber ? "text-[10px] text-cyan-500 font-mono tracking-widest" :
                  isFun ? "text-xs text-black font-sans font-black uppercase" :
                  "text-[10px] text-cyan-400/80 font-sans font-extrabold tracking-[0.2em] uppercase"
                }>
                  RELEVÉ D'IDENTITÉ BANCAIRE
                </span>
                <span className={
                  isSobre ? "text-xs font-bold text-zinc-800" :
                  isWarm ? "text-xs font-serif font-bold text-amber-950" :
                  isCyber ? "text-xs font-mono font-bold text-white" :
                  isFun ? "text-xs font-sans font-black text-black uppercase" :
                  "text-xs text-indigo-300 font-sans font-bold uppercase tracking-wider"
                }>
                  {rib.bankName || "BANQUE GENERALE"}
                </span>
              </div>

              {/* Slip Details Grid */}
              <div className="p-5 space-y-4 text-xs relative">
                {/* Account Holder */}
                <div>
                  <span className={
                    isSobre ? "block text-[9px] text-zinc-500 uppercase tracking-[0.25em]" :
                    isWarm ? "block text-[9px] text-amber-900/60 uppercase tracking-[0.25em]" :
                    isCyber ? "block text-[9px] text-cyan-500 uppercase tracking-widest" :
                    isFun ? "block text-[9px] text-black uppercase font-black" :
                    "block text-[9px] text-slate-500 uppercase tracking-[0.25em]"
                  }>Titulaire du compte</span>
                  <span className={`text-sm uppercase tracking-wide ${
                    isSobre ? "text-zinc-900 font-bold" :
                    isWarm ? "text-amber-950 font-serif font-bold" :
                    isCyber ? "text-[#00ffcc] font-mono font-bold" :
                    isFun ? "text-black font-sans font-black" :
                    "text-sm font-bold text-white uppercase tracking-wide"
                  }`}>{rib.accountHolder}</span>
                </div>

                {/* Classic French RIB Table */}
                <div className={
                  isSobre ? "border border-zinc-200 rounded-xl overflow-hidden bg-zinc-100/50" :
                  isWarm ? "border border-amber-900/15 rounded-xl overflow-hidden bg-amber-100/5" :
                  isCyber ? "border border-cyan-500/20 rounded-none overflow-hidden bg-black" :
                  isFun ? "border-3 border-black rounded-xl overflow-hidden bg-yellow-50" :
                  "border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60"
                }>
                  <div className={
                    isSobre ? "grid grid-cols-5 text-center bg-zinc-200/50 text-[8px] text-zinc-600 uppercase py-1.5 border-b border-zinc-200 font-sans font-bold" :
                    isWarm ? "grid grid-cols-5 text-center bg-amber-100/20 text-[8px] text-amber-900/80 uppercase py-1.5 border-b border-amber-900/10 font-serif font-bold" :
                    isCyber ? "grid grid-cols-5 text-center bg-black text-[8px] text-cyan-500 uppercase py-1.5 border-b border-cyan-500/20 font-mono" :
                    isFun ? "grid grid-cols-5 text-center bg-fuchsia-200 text-[8px] text-black uppercase py-1.5 border-b-2 border-black font-sans font-black" :
                    "grid grid-cols-5 text-center bg-slate-950/90 text-[8px] text-slate-400 uppercase py-1.5 border-b border-slate-800/60 font-sans font-bold"
                  }>
                    <div>Code Banque</div>
                    <div>Code Guichet</div>
                    <div className="col-span-2">Numéro de compte</div>
                    <div>Clé RIB</div>
                  </div>
                  <div className={
                    isSobre ? "grid grid-cols-5 text-center text-zinc-900 py-2.5 font-bold text-[11px]" :
                    isWarm ? "grid grid-cols-5 text-center text-amber-950 py-2.5 font-serif font-bold text-[11px]" :
                    isCyber ? "grid grid-cols-5 text-center text-[#00ffcc] py-2.5 font-mono font-bold text-[11px]" :
                    isFun ? "grid grid-cols-5 text-center text-black py-2.5 font-sans font-black text-[11px]" :
                    "grid grid-cols-5 text-center text-slate-100 py-2.5 font-bold text-[11px]"
                  }>
                    <div className={isSobre ? "border-r border-zinc-200" : isWarm ? "border-r border-amber-900/10" : isCyber ? "border-r border-cyan-500/20" : isFun ? "border-r-2 border-black" : "border-r border-slate-800/60"}>{rib.bankCode || "12345"}</div>
                    <div className={isSobre ? "border-r border-zinc-200" : isWarm ? "border-r border-amber-900/10" : isCyber ? "border-r border-cyan-500/20" : isFun ? "border-r-2 border-black" : "border-r border-slate-800/60"}>{rib.branchCode || "67890"}</div>
                    <div className={`col-span-2 ${isSobre ? "border-r border-zinc-200 text-zinc-900" : isWarm ? "border-r border-amber-900/10 text-amber-950" : isCyber ? "border-r border-cyan-500/20 text-cyan-300" : isFun ? "border-r-2 border-black text-black" : "border-r border-slate-800/60 text-cyan-300"}`}>{rib.accountNumber || "00012345678"}</div>
                    <div>{rib.ribKey || "90"}</div>
                  </div>
                </div>

                {/* IBAN Section */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={
                      isSobre ? "text-[9px] text-zinc-500 uppercase tracking-[0.25em]" :
                      isWarm ? "text-[9px] text-amber-900/60 uppercase tracking-[0.25em]" :
                      isCyber ? "text-[9px] text-cyan-500 uppercase tracking-widest" :
                      isFun ? "text-[9px] text-black uppercase font-black" :
                      "text-[9px] text-slate-500 uppercase tracking-[0.25em]"
                    }>Code IBAN (International Bank Account Number)</span>
                    <button
                      onClick={() => handleCopy(rib.iban, "IBAN")}
                      className={`p-1 transition-colors cursor-pointer ${isFun ? "text-black hover:text-rose-500" : "hover:text-cyan-400 text-slate-400"}`}
                      title="Copier l'IBAN"
                    >
                      {copiedField === "IBAN" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className={
                    isSobre ? "bg-zinc-150 p-2.5 rounded-lg border border-zinc-350 text-zinc-900 select-all font-bold tracking-wider text-[11px] sm:text-xs" :
                    isWarm ? "bg-[#FAF6F0] p-2.5 rounded-lg border border-amber-900/15 text-amber-950 select-all font-serif font-bold tracking-wider text-[11px] sm:text-xs" :
                    isCyber ? "bg-black p-2.5 border border-cyan-500/35 text-cyan-400 select-all font-mono font-bold tracking-wider text-[11px] sm:text-xs" :
                    isFun ? "bg-white p-2.5 border-2 border-black text-black select-all font-sans font-black tracking-wider text-[11px] sm:text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300 select-all font-bold tracking-wider text-[11px] sm:text-xs"
                  }>
                    {rib.iban}
                  </div>
                </div>

                {/* BIC Section */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={
                      isSobre ? "text-[9px] text-zinc-500 uppercase tracking-[0.25em]" :
                      isWarm ? "text-[9px] text-amber-900/60 uppercase tracking-[0.25em]" :
                      isCyber ? "text-[9px] text-cyan-500 uppercase tracking-widest" :
                      isFun ? "text-[9px] text-black uppercase font-black" :
                      "text-[9px] text-slate-500 uppercase tracking-[0.25em]"
                    }>Code BIC (Bank Identifier Code)</span>
                    <button
                      onClick={() => handleCopy(rib.bic, "BIC")}
                      className={`p-1 transition-colors cursor-pointer ${isFun ? "text-black hover:text-rose-500" : "hover:text-cyan-400 text-slate-400"}`}
                      title="Copier le BIC"
                    >
                      {copiedField === "BIC" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className={
                    isSobre ? "bg-zinc-150 p-2.5 rounded-lg border border-zinc-350 text-zinc-900 select-all font-bold tracking-wider text-[11px] sm:text-xs" :
                    isWarm ? "bg-[#FAF6F0] p-2.5 rounded-lg border border-amber-900/15 text-amber-950 select-all font-serif font-bold tracking-wider text-[11px] sm:text-xs" :
                    isCyber ? "bg-black p-2.5 border border-cyan-500/35 text-cyan-400 select-all font-mono font-bold tracking-wider text-[11px] sm:text-xs" :
                    isFun ? "bg-white p-2.5 border-2 border-black text-black select-all font-sans font-black tracking-wider text-[11px] sm:text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300 select-all font-bold tracking-wider text-[11px] sm:text-xs"
                  }>
                    {rib.bic}
                  </div>
                </div>
              </div>

              {/* Slip Action Footer */}
              <div className={`p-3 flex justify-between gap-2 relative border-t ${
                isSobre ? "bg-zinc-100 border-zinc-200" :
                isWarm ? "bg-[#FAF6F0] border-amber-900/15" :
                isCyber ? "bg-black border-cyan-500/30" :
                isFun ? "bg-yellow-200 border-t-3 border-black" :
                "bg-slate-950/60 border-t border-slate-800/80"
              }`}>
                <div className={`flex items-center gap-1.5 text-[10px] ${
                  isSobre ? "text-zinc-600 font-sans" :
                  isWarm ? "text-amber-900/80 font-serif" :
                  isCyber ? "text-cyan-500 font-mono" :
                  isFun ? "text-black font-black" :
                  "text-slate-400 font-sans"
                }`}>
                  <Info className={`w-3.5 h-3.5 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400"}`} />
                  Virement SEPA instantané supporté
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      `Titulaire: ${rib.accountHolder}\nIBAN: ${rib.iban}\nBIC: ${rib.bic}\nBanque: ${rib.bankName}`,
                      "RIB complet"
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border cursor-pointer shadow-xs ${
                    isSobre ? "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-black" :
                    isWarm ? "bg-[#FAF6F0] border-amber-900/15 text-amber-900 hover:bg-[#F2E6D0]" :
                    isCyber ? "bg-black border-cyan-500/50 text-cyan-400 font-mono hover:border-cyan-400" :
                    isFun ? "bg-fuchsia-300 border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5" :
                    "bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/20"
                  }`}
                >
                  <Share2 className={`w-3 h-3 ${isFun ? "text-black" : "text-indigo-400"}`} />
                  Partager / Copier Tout
                </button>
              </div>
            </div>
          )}

          {/* Virement Instructions */}
          <div className={`border rounded-xl p-4 flex gap-3 ${
            isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-900" :
            isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
            isCyber ? "bg-black border-cyan-500/20 text-cyan-400 font-mono" :
            isFun ? "bg-pink-100 border-3 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl" :
            "bg-slate-900/40 border border-slate-800 text-slate-300"
          }`}>
            <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isFun ? "text-black" : "text-cyan-400 animate-pulse"}`} />
            <div className="space-y-1">
              <h5 className={`font-bold text-sm ${
                isSobre ? "text-zinc-900 font-sans" :
                isWarm ? "text-amber-950 font-serif" :
                isCyber ? "text-[#00ffcc] font-mono" :
                isFun ? "text-black font-black uppercase font-sans" :
                "text-slate-200 font-sans"
              }`}>Comment faire un virement ?</h5>
              <p className={`text-xs leading-relaxed ${
                isSobre ? "text-zinc-600 font-sans" :
                isWarm ? "text-amber-900/80 font-serif" :
                isCyber ? "text-cyan-500 font-mono" :
                isFun ? "text-black font-semibold" :
                "text-slate-400 font-sans"
              }`}>
                1. Copiez l'<strong>IBAN</strong> et le <strong>BIC</strong> ci-dessus.<br />
                2. Rendez-vous sur votre application bancaire personnelle.<br />
                3. Ajoutez un nouveau bénéficiaire en collant ces coordonnées.<br />
                4. Effectuez le virement (un virement de type "instantané" permet de recevoir le don en quelques secondes).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Support & Credit Card Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className={`font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 ${
            isSobre ? "text-zinc-550 font-sans" :
            isWarm ? "text-amber-900/60 font-serif" :
            isCyber ? "text-cyan-500 font-mono" :
            isFun ? "text-black font-black" :
            "text-slate-400 font-sans"
          }`}>
            <Coins className={`w-4 h-4 ${isFun ? "text-black" : "text-cyan-400"}`} />
            Don Rapide
          </h3>

          <div className={getPanelClass() + " space-y-5"}>
            {/* Amount Presets */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${
                isSobre ? "text-zinc-800 font-sans" :
                isWarm ? "text-amber-950 font-serif" :
                isCyber ? "text-cyan-500 font-mono" :
                isFun ? "text-black font-black" :
                "text-slate-300 font-sans"
              }`}>Choisir un montant :</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setDonationAmount(val);
                      setCbSimStep("idle");
                    }}
                    className={getButtonClass(donationAmount === val)}
                  >
                    {val}€
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDonationAmount("libre");
                  setCbSimStep("idle");
                }}
                className={getButtonClass(donationAmount === "libre") + " w-full"}
              >
                Montant Libre
              </button>

              {donationAmount === "libre" && (
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setCbSimStep("idle");
                    }}
                    placeholder="Saisir le montant en €"
                    className={getInputClass()}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${
                    isSobre ? "text-zinc-500 font-sans" :
                    isWarm ? "text-amber-900/60 font-serif" :
                    isCyber ? "text-cyan-500 font-mono" :
                    isFun ? "text-black font-black font-sans" :
                    "text-slate-500 font-sans"
                  }`}>
                    EUR
                  </span>
                </div>
              )}
            </div>

            {/* Donation Channel toggle */}
            <div className={`flex text-xs font-sans border-b ${
              isSobre ? "border-zinc-200" :
              isWarm ? "border-amber-900/15" :
              isCyber ? "border-cyan-500/20" :
              isFun ? "border-black" :
              "border-slate-800"
            }`}>
              <button
                onClick={() => setDonationType("virement")}
                className={`flex-1 pb-2.5 text-center cursor-pointer ${
                  donationType === "virement"
                    ? isSobre ? "border-b-2 border-zinc-950 text-zinc-950 font-bold"
                      : isWarm ? "border-b-2 border-amber-900 text-amber-950 font-serif font-bold"
                      : isCyber ? "border-b-2 border-cyan-400 text-cyan-400 font-mono"
                      : isFun ? "border-b-3 border-black text-black font-black bg-pink-200 rounded-t-lg"
                      : "border-b-2 border-indigo-500 text-cyan-300 font-bold"
                    : isSobre ? "text-zinc-400 hover:text-zinc-600 font-medium"
                      : isWarm ? "text-amber-900/50 hover:text-amber-900 font-serif"
                      : isCyber ? "text-cyan-700 hover:text-cyan-500 font-mono"
                      : isFun ? "text-black opacity-60 hover:opacity-100 font-bold"
                      : "text-slate-500 hover:text-slate-400 font-semibold"
                }`}
              >
                Virement bancaire
              </button>
              <button
                onClick={() => {
                  setDonationType("cb");
                  setCbSimStep("idle");
                }}
                className={`flex-1 pb-2.5 text-center cursor-pointer ${
                  donationType === "cb"
                    ? isSobre ? "border-b-2 border-zinc-950 text-zinc-950 font-bold"
                      : isWarm ? "border-b-2 border-amber-900 text-amber-950 font-serif font-bold"
                      : isCyber ? "border-b-2 border-cyan-400 text-cyan-400 font-mono"
                      : isFun ? "border-b-3 border-black text-black font-black bg-pink-200 rounded-t-lg"
                      : "border-b-2 border-indigo-500 text-cyan-300 font-bold"
                    : isSobre ? "text-zinc-400 hover:text-zinc-600 font-medium"
                      : isWarm ? "text-amber-900/50 hover:text-amber-900 font-serif"
                      : isCyber ? "text-cyan-700 hover:text-cyan-500 font-mono"
                      : isFun ? "text-black opacity-60 hover:opacity-100 font-bold"
                      : "text-slate-500 hover:text-slate-400 font-semibold"
                }`}
              >
                Simulation Carte
              </button>
            </div>

            {donationType === "virement" ? (
              /* Virement display details */
              <div className={`space-y-3 pt-2 text-xs leading-relaxed ${
                isSobre ? "text-zinc-600 font-sans" :
                isWarm ? "text-amber-900/80 font-serif" :
                isCyber ? "text-cyan-500 font-mono" :
                isFun ? "text-black font-medium" :
                "text-slate-400 font-sans"
              }`}>
                <p>
                  Les virements SEPA n'engendrent <strong>aucun frais de commission</strong>. C'est le moyen de soutien le plus efficace.
                </p>
                <div className={`p-3 rounded-xl border ${
                  isSobre ? "bg-zinc-100 border-zinc-200 text-zinc-900 space-y-1.5" :
                  isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 space-y-1.5 font-serif" :
                  isCyber ? "bg-black border-cyan-500/20 text-cyan-400 space-y-1.5 font-mono" :
                  isFun ? "bg-white border-3 border-black rounded-xl text-black space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                  "bg-slate-950 border border-slate-850 text-slate-300 space-y-1.5 font-sans"
                }`}>
                  <div className="flex justify-between">
                    <span className={
                      isSobre ? "text-zinc-500 font-medium" :
                      isWarm ? "text-amber-900/60" :
                      isCyber ? "text-cyan-600 font-mono" :
                      isFun ? "text-black font-bold" :
                      "text-slate-500"
                    }>Bénéficiaire :</span>
                    <span className={`font-bold uppercase ${
                      isSobre ? "text-zinc-950" :
                      isWarm ? "text-amber-950" :
                      isCyber ? "text-[#00ffcc]" :
                      isFun ? "text-black font-black" :
                      "text-white"
                    }`}>{rib.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={
                      isSobre ? "text-zinc-500 font-medium" :
                      isWarm ? "text-amber-900/60" :
                      isCyber ? "text-cyan-600 font-mono" :
                      isFun ? "text-black font-bold" :
                      "text-slate-500"
                    }>Montant suggéré :</span>
                    <span className={`font-bold ${
                      isSobre ? "text-zinc-950" :
                      isWarm ? "text-amber-950" :
                      isCyber ? "text-[#00ffcc]" :
                      isFun ? "text-black font-black" :
                      "text-cyan-300"
                    }`}>{finalDonationAmount} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={
                      isSobre ? "text-zinc-500 font-medium" :
                      isWarm ? "text-amber-900/60" :
                      isCyber ? "text-cyan-600 font-mono" :
                      isFun ? "text-black font-bold" :
                      "text-slate-500"
                    }>Motif conseillé :</span>
                    <span className={`font-mono font-semibold ${
                      isSobre ? "text-zinc-800" :
                      isWarm ? "text-amber-950" :
                      isCyber ? "text-[#00ffcc]" :
                      isFun ? "text-black" :
                      "text-white"
                    }`}>DON INFOPERSO {donorName ? `- ${donorName}` : ""}</span>
                  </div>
                </div>

                <div>
                  <label className={getLabelClass()}>Votre Nom (Optionnel)</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="ex: Jean de Montpellier"
                    className={getInputClass()}
                  />
                </div>
              </div>
            ) : (
              /* Credit Card Mock Simulator */
              <form onSubmit={handleSimulateCb} className="space-y-3 pt-2">
                {cbSimStep === "success" ? (
                  <div className={`border p-4 text-center space-y-2 rounded-xl ${
                    isSobre ? "bg-emerald-50 border-emerald-200 text-zinc-900 shadow-xs" :
                    isWarm ? "bg-[#F5F8F2] border border-amber-900/10 text-amber-950 font-serif" :
                    isCyber ? "bg-black border border-cyan-500/20 text-[#00ffcc] font-mono" :
                    isFun ? "bg-emerald-100 border-3 border-black rounded-2xl text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-emerald-500/5 border border-emerald-500/20"
                  }`}>
                    <Heart className={`w-8 h-8 text-rose-500 mx-auto animate-bounce ${isFun ? "fill-rose-500" : "fill-rose-500/20"}`} />
                    <h4 className={`font-bold text-base ${
                      isSobre ? "text-emerald-800 font-sans" :
                      isWarm ? "text-emerald-900 font-serif" :
                      isCyber ? "text-[#00ffcc] font-mono" :
                      isFun ? "text-black font-black uppercase font-sans" :
                      "text-emerald-400 font-sans"
                    }`}>Paiement Simulé Réussi !</h4>
                    <p className={`text-[11px] leading-relaxed ${
                      isSobre ? "text-zinc-600 font-sans" :
                      isWarm ? "text-amber-900/80 font-serif" :
                      isCyber ? "text-cyan-550 font-mono" :
                      isFun ? "text-black font-semibold" :
                      "text-slate-300 font-sans"
                    }`}>
                      Votre don fictif de <strong>{finalDonationAmount}€</strong> a été simulé.
                      Pour un vrai soutien, veuillez utiliser le virement vers l'IBAN à gauche !
                    </p>
                    <button
                      type="button"
                      onClick={() => setCbSimStep("idle")}
                      className={
                        isSobre ? "text-xs text-zinc-900 underline hover:text-black font-bold font-sans cursor-pointer" :
                        isWarm ? "text-xs text-amber-900 underline hover:text-amber-950 font-serif font-bold cursor-pointer" :
                        isCyber ? "text-xs text-[#00ffcc] underline hover:text-cyan-350 font-mono cursor-pointer" :
                        isFun ? "text-xs text-black font-sans font-black bg-yellow-350 border-2 border-black px-3 py-1 rounded-xl inline-block hover:translate-y-0.5 cursor-pointer" :
                        "text-xs text-cyan-400 underline hover:text-cyan-300 font-sans font-semibold cursor-pointer"
                      }
                    >
                      Refaire une simulation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className={`text-xs leading-normal ${
                      isSobre ? "text-zinc-600 font-sans" :
                      isWarm ? "text-amber-900/80 font-serif" :
                      isCyber ? "text-cyan-500 font-mono" :
                      isFun ? "text-black font-semibold" :
                      "text-slate-400 font-sans"
                    }`}>
                      Simulez instantanément un don sécurisé par carte bancaire.
                    </p>
                    <div>
                      <label className={getLabelClass()}>Numéro de carte</label>
                      <input
                        type="text"
                        required
                        className={getInputClass() + " font-mono"}
                        placeholder="4973 8274 9182 0384"
                        defaultValue="4973 8274 9182 0384"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={getLabelClass()}>Date d'exp.</label>
                        <input
                          type="text"
                          required
                          className={getInputClass() + " text-center font-mono"}
                          placeholder="12/28"
                          defaultValue="08/29"
                        />
                      </div>
                      <div>
                        <label className={getLabelClass()}>CVC / Cryptogramme</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          className={getInputClass() + " text-center font-mono"}
                          placeholder="382"
                          defaultValue="382"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cbSimStep === "submitting"}
                      className={getActionButtonClass()}
                    >
                      {cbSimStep === "submitting" ? "Simulation en cours..." : `Faire un don simulé de ${finalDonationAmount} €`}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* QR Code section */}
            <div className={`pt-4 flex items-center gap-3 border-t ${
              isSobre ? "border-zinc-200" :
              isWarm ? "border-amber-900/10" :
              isCyber ? "border-cyan-500/10" :
              isFun ? "border-black" :
              "border-slate-800"
            }`}>
              <div className={isFun ? "border-3 border-black p-1 rounded-xl bg-white shrink-0" : "bg-white p-1 rounded-md shrink-0"}>
                <QrCode className="w-12 h-12 text-slate-950" />
              </div>
              <p className={`text-[11px] leading-snug font-medium ${
                isSobre ? "text-zinc-600 font-sans" :
                isWarm ? "text-amber-900/80 font-serif" :
                isCyber ? "text-cyan-500 font-mono" :
                isFun ? "text-black font-bold" :
                "text-slate-500 font-sans"
              }`}>
                Scannez pour accéder rapidement aux informations de virement SEPA depuis votre mobile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
