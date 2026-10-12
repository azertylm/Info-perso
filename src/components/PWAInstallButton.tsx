import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Masquer le bouton si l'application est déjà exécutée en mode PWA autonome
  if (isInstalled) {
    return null;
  }

  // Flux Chromium / Android / Desktop (beforeinstallprompt intercepté)
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Installer l'application InfoPerso sur votre appareil"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow transition-all cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer l'app</span>
      </button>
    );
  }

  // Flux iOS Safari (WebKit ne supporte pas beforeinstallprompt nativement)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Installer InfoPerso sur votre iPhone ou iPad"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Installer sur iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-950 text-blue-400 text-xs font-bold shrink-0">1</span>
                  <p>
                    Touchez le bouton <strong className="text-white flex items-center gap-1 inline-flex"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Partager</strong> dans la barre d'outils de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-950 text-blue-400 text-xs font-bold shrink-0">2</span>
                  <p>
                    Faites défiler le menu vers le bas et sélectionnez <strong className="text-white">Sur l'écran d'accueil</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-950 text-blue-400 text-xs font-bold shrink-0">3</span>
                  <p>
                    Confirmez en touchant <strong className="text-blue-400">Ajouter</strong> en haut à droite.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Mode hors-ligne Workbox inclus
                </span>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
