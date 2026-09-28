import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Info,
  X,
  CreditCard,
  UserCheck,
  FolderLock
} from "lucide-react";
import {
  VaultRecordPlain,
  EncryptedVaultRecord,
  unlockVaultSession,
  lockVaultSession,
  isVaultUnlocked,
  encryptPersonalRecord,
  decryptPersonalRecord,
  loadEncryptedRecordsFromStorage,
  saveEncryptedRecordToStorage,
  deleteEncryptedRecordFromStorage,
  onVaultLocked
} from "../lib/zeroKnowledgeVault";

interface ZeroKnowledgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZeroKnowledgeVaultModal: React.FC<ZeroKnowledgeVaultModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [encryptedList, setEncryptedList] = useState<EncryptedVaultRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<VaultRecordPlain | null>(null);
  const [selectedEncryptedId, setSelectedEncryptedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Formulaire d'édition / création
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<VaultRecordPlain["category"]>("note_secrete");
  const [formContent, setFormContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rafraîchir l'état du coffre
  const refreshRecords = () => {
    setEncryptedList(loadEncryptedRecordsFromStorage());
  };

  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(isVaultUnlocked());
      refreshRecords();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = onVaultLocked(() => {
      setIsUnlocked(false);
      setSelectedRecord(null);
      setSelectedEncryptedId(null);
      setIsCreatingNew(false);
    });

    const handleStorage = () => refreshRecords();
    window.addEventListener("zk-vault-records-updated", handleStorage);

    return () => {
      unsub();
      window.removeEventListener("zk-vault-records-updated", handleStorage);
    };
  }, []);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await unlockVaultSession(passphrase);
      setIsUnlocked(true);
      setPassphrase("");
      refreshRecords();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de déverrouillage");
    }
  };

  const handleManualLock = () => {
    lockVaultSession();
    setIsUnlocked(false);
    setSelectedRecord(null);
    setSelectedEncryptedId(null);
    setIsCreatingNew(false);
  };

  const handleOpenRecord = async (enc: EncryptedVaultRecord) => {
    setErrorMsg("");
    try {
      const decrypted = await decryptPersonalRecord(enc);
      setSelectedRecord(decrypted);
      setSelectedEncryptedId(enc.id);
      setIsCreatingNew(false);
      setFormTitle(decrypted.title);
      setFormCategory(decrypted.category);
      setFormContent(decrypted.content);
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de déchiffrement.");
    }
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setErrorMsg("Veuillez renseigner un titre et un contenu.");
      return;
    }

    try {
      const plain: VaultRecordPlain = {
        id: selectedEncryptedId || "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        createdAt: selectedRecord?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      const encrypted = await encryptPersonalRecord(plain);
      saveEncryptedRecordToStorage(encrypted);

      refreshRecords();
      setSelectedRecord(plain);
      setSelectedEncryptedId(plain.id);
      setIsCreatingNew(false);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de chiffrement AES-256-GCM.");
    }
  };

  const handleDeleteRecord = (id: string) => {
    deleteEncryptedRecordFromStorage(id);
    if (selectedEncryptedId === id) {
      setSelectedRecord(null);
      setSelectedEncryptedId(null);
      setIsCreatingNew(false);
    }
    refreshRecords();
  };

  const copyDecryptedContent = () => {
    if (!selectedRecord) return;
    const textToCopy = `[FICHE SOUVERAINE INFOS PERSO - ${selectedRecord.title}]
Catégorie : ${selectedRecord.category}
Date : ${new Date(selectedRecord.updatedAt).toLocaleString("fr-FR")}

${selectedRecord.content}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-indigo-500/30 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* En-tête du coffre-fort */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <FolderLock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Coffre-Fort Numérique Zero-Knowledge
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  Infos Perso • ALPHABETTE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PBKDF2 (100k itérations) • AES-256-GCM • Auto-verrouillage 5 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUnlocked && (
              <button
                onClick={handleManualLock}
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-amber-400 border border-amber-500/30 transition-all shadow-sm"
                title="Verrouiller manuellement le coffre"
              >
                <Lock className="h-3.5 w-3.5" />
                Verrouiller
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corps principal : verrouillé vs déverrouillé */}
        {!isUnlocked ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">
                Déverrouillage du Coffre Souverain
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Votre phrase maîtresse dérive une clé éphémère AES-256-GCM dans la mémoire RAM volatile de votre appareil.
                Aucun mot de passe n'est envoyé à un serveur ni enregistré sur disque.
              </p>

              <form onSubmit={handleUnlock} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phrase maîtresse secrète
                  </label>
                  <div className="relative">
                    <input
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Entrez votre phrase secrète..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!passphrase.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4" />
                  Déverrouiller la session
                </button>
              </form>

              <div className="mt-5 border-t border-slate-800 pt-4 text-left">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>
                    La session s'auto-verrouille automatiquement après <strong>5 minutes d'inactivité</strong> pour préserver votre souveraineté.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Volet gauche : Liste des fiches chiffrées */}
            <div className="w-full sm:w-80 border-r border-slate-800 flex flex-col bg-slate-900/40">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Fiches chiffrées ({encryptedList.length})
                </span>
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    setSelectedEncryptedId(null);
                    setIsCreatingNew(true);
                    setFormTitle("");
                    setFormCategory("note_secrete");
                    setFormContent("");
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-xs font-bold text-white shadow transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle fiche
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {encryptedList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Aucune fiche enregistrée dans votre coffre. Créez-en une en toute confidentialité.
                  </div>
                ) : (
                  encryptedList.map((enc) => (
                    <div
                      key={enc.id}
                      onClick={() => handleOpenRecord(enc)}
                      className={`group relative flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all border ${
                        selectedEncryptedId === enc.id
                          ? "bg-indigo-950/60 border-indigo-500/50 text-white"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate">{enc.titleHint}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{enc.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(enc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Supprimer la fiche chiffrée"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Indicateur de session active */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-emerald-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session déverrouillée (timer 5 min actif)</span>
              </div>
            </div>

            {/* Volet droit : Contenu de la fiche (Consultation ou Édition) */}
            <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-slate-950/30">
              {isCreatingNew || selectedRecord ? (
                <form onSubmit={handleSaveRecord} className="flex-1 flex flex-col space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-indigo-400" />
                      <h3 className="font-bold text-sm sm:text-base text-slate-100">
                        {isCreatingNew ? "Nouvelle Fiche Chiffrée" : "Fiche Déchiffrée (Zero-Knowledge)"}
                      </h3>
                    </div>

                    {selectedRecord && (
                      <button
                        type="button"
                        onClick={copyDecryptedContent}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 transition-all"
                        title="Copier le texte en 1 clic (Règle ALPHABETTE)"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copier 1-clic</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Titre de la fiche
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Ex: Identifiants Bancaires / Clés API souveraines"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="note_secrete">Note Confidentielle</option>
                        <option value="bancaire">Coordonnées Bancaires / RIB</option>
                        <option value="identite">Documents d'Identité</option>
                        <option value="sante">Dossier Santé Privé</option>
                        <option value="patrimoine">Patrimoine & Actifs</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Contenu confidentiel (chiffré en AES-256-GCM avant écriture sur disque)
                    </label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Tapez ici vos données sensibles : IBAN, mots de passe, clés de récupération, codes d'alarme..."
                      rows={10}
                      className="flex-1 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 text-xs text-slate-100 font-mono leading-relaxed focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-500">
                      Chiffrement matériel : Salt 16B + IV 96-bit unique par enregistrement.
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Chiffrer et enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <FileText className="h-12 w-12 text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-300">
                    Sélectionnez une fiche chiffrée ou créez-en une nouvelle.
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Toutes vos fiches sont chiffrées localement sur votre appareil sans jamais transiter en clair.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
