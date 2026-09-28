import React, { useState, useEffect } from "react";
import {
  Wrench,
  Camera,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  Mic,
  MapPin,
  Calendar,
  CloudOff,
  CloudCheck,
  FileText,
  Upload
} from "lucide-react";
import {
  ArtisanIntervention,
  ChantierPhoto,
  getAllInterventionsOffline,
  saveInterventionOffline,
  deleteInterventionOffline,
  serializePhotoFile,
  syncPendingInterventions,
  getPendingSyncCount
} from "../lib/artisanInterventionDb";
import { ArtisanVoiceCommand } from "./ArtisanVoiceCommand";

interface ArtisanWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArtisanWorkshopModal: React.FC<ArtisanWorkshopModalProps> = ({
  isOpen,
  onClose
}) => {
  const [interventions, setInterventions] = useState<ArtisanIntervention[]>([]);
  const [pendingCounts, setPendingCounts] = useState<{ interventions: number; photos: number }>({
    interventions: 0,
    photos: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<ArtisanIntervention | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formulaire d'intervention
  const [formTitle, setFormTitle] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formTrade, setFormTrade] = useState("Plomberie");
  const [formUrgency, setFormUrgency] = useState<"Normale" | "Urgente" | "Critique">("Normale");
  const [formEstimatedHours, setFormEstimatedHours] = useState(2);
  const [formMaterials, setFormMaterials] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPhotos, setFormPhotos] = useState<ChantierPhoto[]>([]);

  const loadData = async () => {
    try {
      const items = await getAllInterventionsOffline();
      setInterventions(items);
      const counts = await getPendingSyncCount();
      setPendingCounts(counts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDbUpdated = () => loadData();
    const handleSyncStatus = (e: any) => {
      loadData();
      if (e.detail?.message) setSyncMessage(e.detail.message);
    };

    window.addEventListener("artisan-db-updated", handleDbUpdated);
    window.addEventListener("artisan-sync-status", handleSyncStatus);

    return () => {
      window.removeEventListener("artisan-db-updated", handleDbUpdated);
      window.removeEventListener("artisan-sync-status", handleSyncStatus);
    };
  }, []);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncPendingInterventions();
      setSyncMessage(res.message);
      await loadData();
    } catch (err: any) {
      setSyncMessage("Erreur de synchronisation : " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { dataUrl, sizeKb } = await serializePhotoFile(file);
        const newPhoto: ChantierPhoto = {
          id: "photo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          interventionId: selectedIntervention?.id || "temp",
          caption: file.name,
          dataUrl,
          timestamp: Date.now(),
          sizeKb,
          mimeType: file.type || "image/jpeg",
          syncStatus: "pending"
        };
        setFormPhotos((prev) => [...prev, newPhoto]);
      } catch (err) {
        console.error("Erreur de sérialisation photo :", err);
      }
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const materialsArray = formMaterials
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const intervention: ArtisanIntervention = {
      id: selectedIntervention?.id || "int_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: formTitle.trim(),
      clientName: formClient.trim() || "Client Chantier",
      location: formLocation.trim() || "Sur site",
      trade: formTrade,
      description: formDescription.trim(),
      materials: materialsArray,
      urgency: formUrgency,
      estimatedHours: Number(formEstimatedHours) || 1,
      photos: formPhotos,
      createdAt: selectedIntervention?.createdAt || Date.now(),
      updatedAt: Date.now(),
      synced: false,
      source: "manuel"
    };

    await saveInterventionOffline(intervention);
    await loadData();
    setSelectedIntervention(intervention);
    setIsCreatingNew(false);
  };

  const handleDelete = async (id: string) => {
    await deleteInterventionOffline(id);
    if (selectedIntervention?.id === id) {
      setSelectedIntervention(null);
      setIsCreatingNew(false);
    }
    await loadData();
  };

  const handleSelectIntervention = (item: ArtisanIntervention) => {
    setSelectedIntervention(item);
    setIsCreatingNew(false);
    setFormTitle(item.title);
    setFormClient(item.clientName);
    setFormLocation(item.location);
    setFormTrade(item.trade);
    setFormUrgency(item.urgency);
    setFormEstimatedHours(item.estimatedHours);
    setFormMaterials((item.materials || []).join(", "));
    setFormDescription(item.description);
    setFormPhotos(item.photos || []);
  };

  const startNewForm = () => {
    setSelectedIntervention(null);
    setIsCreatingNew(true);
    setFormTitle("");
    setFormClient("");
    setFormLocation("");
    setFormTrade("Plomberie");
    setFormUrgency("Normale");
    setFormEstimatedHours(2);
    setFormMaterials("");
    setFormDescription("");
    setFormPhotos([]);
  };

  const copyInterventionSummary = (item: ArtisanIntervention) => {
    const summary = `[INTERVENTION CHANTIER - L'ŒIL DE L'ATELIER]
Titre : ${item.title}
Client : ${item.clientName}
Lieu : ${item.location}
Corps de métier : ${item.trade}
Urgence : ${item.urgency}
Temps estimé : ${item.estimatedHours}h
Matériaux : ${(item.materials || []).join(", ")}
Photos associées : ${item.photos?.length || 0}
Consignes : ${item.description}
Statut : ${item.synced ? "Synchronisé Cloud Souverain" : "Enregistré en local (IndexedDB)"}`;

    navigator.clipboard.writeText(summary);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-amber-500/30 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-600/30">
              <Wrench className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  L'Œil de l'Atelier — Gestion de Chantier Résiliente
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  PWA • Hors-ligne 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Service Worker Cache-First • IndexedDB photos sérialisées • Reprise auto à la reconnexion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceModeActive(!isVoiceModeActive)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                isVoiceModeActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                  : "bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-slate-700"
              }`}
            >
              <Mic className="h-4 w-4" />
              {isVoiceModeActive ? "Masquer Commande Vocale" : "Commande Vocale Atelier"}
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
              title="Synchroniser avec le serveur"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-amber-400" : ""}`} />
              Sync ({pendingCounts.interventions})
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Volet vocal déployable si activé */}
        {isVoiceModeActive && (
          <div className="p-4 border-b border-slate-800 bg-slate-900/80">
            <ArtisanVoiceCommand
              onInterventionCreated={(newInt) => {
                loadData();
                setSelectedIntervention(newInt);
              }}
            />
          </div>
        )}

        {/* Message de synchronisation */}
        {syncMessage && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span>{syncMessage}</span>
            <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* Contenu principal : 2 colonnes (liste / détail) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Colonne gauche : liste des interventions */}
          <div className="w-full sm:w-80 md:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chantiers ({interventions.length})
              </span>
              <button
                onClick={startNewForm}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 shadow transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau chantier
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {interventions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Aucun chantier enregistré. Utilisez la commande vocale ou créez une fiche manuellement.
                </div>
              ) : (
                interventions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectIntervention(item)}
                    className={`rounded-xl p-3 border cursor-pointer transition-all ${
                      selectedIntervention?.id === item.id
                        ? "bg-amber-950/40 border-amber-500/50 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold truncate">{item.title}</h4>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          item.synced
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {item.synced ? "Synchronisé" : "Local IDB"}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.clientName}</span>
                      <span>{item.trade}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      {item.photos && item.photos.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Camera className="h-3 w-3" />
                          {item.photos.length} photo(s)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Colonne droite : Formulaire / Visualisation */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 sm:p-6 bg-slate-950/40">
            {isCreatingNew || selectedIntervention ? (
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-400" />
                    {isCreatingNew ? "Nouvelle Fiche d'Intervention Artisan" : selectedIntervention?.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    {selectedIntervention && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyInterventionSummary(selectedIntervention)}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
                          title="Copier la fiche 1-clic"
                        >
                          {copiedId === selectedIntervention.id ? (
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
                        <button
                          type="button"
                          onClick={() => handleDelete(selectedIntervention.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Supprimer la fiche"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Titre de l'intervention
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Remplacement ballon d'eau chaude"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nom du Client / Chantier
                    </label>
                    <input
                      type="text"
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="Ex: M. Dupont / Résidence Les Pins"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Localisation / Adresse
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ex: 12 avenue de la Mer, La Grande-Motte"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Corps d'état
                    </label>
                    <select
                      value={formTrade}
                      onChange={(e) => setFormTrade(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Plomberie">Plomberie / Sanitaire</option>
                      <option value="Électricité">Électricité générale</option>
                      <option value="Menuiserie">Menuiserie / Agencement</option>
                      <option value="Chauffage">Chauffage & Climatisation</option>
                      <option value="Maçonnerie">Maçonnerie / Gros œuvre</option>
                      <option value="Peinture">Peinture & Finitions</option>
                      <option value="Serrurerie">Serrurerie & Dépannage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Degré d'Urgence
                    </label>
                    <select
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Normale">Normale</option>
                      <option value="Urgente">Urgente (intervention dans les 24h)</option>
                      <option value="Critique">Critique (dépannage immédiat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Durée estimée (heures)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formEstimatedHours}
                      onChange={(e) => setFormEstimatedHours(+e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Matériaux et outillage requis (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formMaterials}
                    onChange={(e) => setFormMaterials(e.target.value)}
                    placeholder="Ex: Raccord multicouche 20, téflon, joint fibre, clé à molette"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Consignes & Remarques techniques
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Détails d'accès, précautions particulières, coupure d'eau requise..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Section Photos de Chantier sérialisées en local */}
                <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-amber-400" />
                      Photos de Chantier (Sérialisées dans IndexedDB)
                    </span>
                    <label className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-bold hover:bg-amber-500/30 cursor-pointer transition-all">
                      <Upload className="h-3.5 w-3.5" />
                      Ajouter une photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {formPhotos.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Aucune photo attachée à cette intervention. Les photos sont compressées et stockées localement sans consommer d'espace serveur.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formPhotos.map((photo, idx) => (
                        <div key={photo.id || idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-1.5 text-[10px] text-slate-400 truncate flex items-center justify-between">
                            <span className="truncate">{photo.sizeKb} Ko</span>
                            <span className="text-amber-400">{photo.syncStatus}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Enregistrer dans IndexedDB
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Wrench className="h-12 w-12 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-300">
                  Sélectionnez un chantier ou créez-en un nouveau.
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Grâce au Service Worker et à IndexedDB, vos interventions et photos restent 100% opérationnelles sur le chantier sans connexion internet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
