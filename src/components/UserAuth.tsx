import React, { useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  User
} from "../lib/firebase";
import { LogIn, LogOut, Mail, Lock, User as UserIcon, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

interface UserAuthProps {
  onNotify: (msg: string) => void;
  onClose?: () => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
}

export default function UserAuth({ 
  onNotify, 
  onClose, 
  displayMode = "pro", 
  themeMode = "dark" 
}: UserAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isDark = themeMode === "dark";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onNotify("Connexion Google réussie ! 🎉");
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la connexion Google");
      onNotify("Échec de la connexion Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const signedUpUser = userCredential.user;

        // Set Display Name
        if (displayName) {
          await updateProfile(signedUpUser, { displayName });
        }

        // Send Email Verification
        await sendEmailVerification(signedUpUser);
        setVerificationSent(true);
        onNotify("Compte créé ! E-mail de vérification envoyé. ✉️");
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        onNotify("Connexion réussie ! Ravie de vous revoir. 👋");
        if (onClose) onClose();
      }
    } catch (err: any) {
      console.error(err);
      let frenchError = err.message;
      if (err.code === "auth/email-already-in-use") {
        frenchError = "Cette adresse e-mail est déjà utilisée par un autre compte.";
      } else if (err.code === "auth/invalid-email") {
        frenchError = "L'adresse e-mail n'est pas valide.";
      } else if (err.code === "auth/weak-password") {
        frenchError = "Le mot de passe doit contenir au moins 6 caractères.";
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        frenchError = "Identifiants incorrects. Veuillez réessayer.";
      }
      setError(frenchError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        onNotify("E-mail de vérification renvoyé ! ✉️");
      } catch (err: any) {
        onNotify("Erreur lors de l'envoi : " + err.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onNotify("Déconnexion réussie ! À bientôt.");
      setVerificationSent(false);
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err: any) {
      onNotify("Erreur de déconnexion : " + err.message);
    }
  };

  const getContainerClass = () => {
    if (isSobre) {
      return isDark 
        ? "bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl text-zinc-100 max-w-md mx-auto"
        : "bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-md text-zinc-900 max-w-md mx-auto";
    }
    if (isWarm) {
      return isDark
        ? "bg-[#382F2A] border border-amber-900/20 rounded-2xl p-6 space-y-6 shadow-xl text-[#F4ECE1] max-w-md mx-auto font-serif"
        : "bg-[#FDFBF7] border border-amber-900/15 rounded-2xl p-6 space-y-6 shadow-md text-amber-950 max-w-md mx-auto font-serif";
    }
    if (isCyber) {
      return isDark
        ? "bg-black border border-cyan-500/30 rounded-none p-6 space-y-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-[#00ffcc] max-w-md mx-auto font-mono"
        : "bg-white border border-cyan-500/40 rounded-none p-6 space-y-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-black max-w-md mx-auto font-mono";
    }
    if (isFun) {
      return isDark
        ? "bg-[#2A263D] border-3 border-black rounded-3xl p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] text-white max-w-md mx-auto font-sans"
        : "bg-white border-3 border-black rounded-3xl p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black max-w-md mx-auto font-sans";
    }
    return isDark
      ? "bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-6 space-y-6 shadow-xl text-white max-w-md mx-auto"
      : "bg-white border border-slate-250 rounded-2xl p-6 space-y-6 shadow-lg text-slate-900 max-w-md mx-auto";
  };

  const getInputClass = (focusColor: "cyan" | "violet" | "fuchsia") => {
    const focusColors = {
      cyan: isCyber ? "focus:border-cyan-400" : "focus:border-cyan-500",
      violet: isCyber ? "focus:border-pink-400" : "focus:border-violet-500",
      fuchsia: isCyber ? "focus:border-pink-500" : "focus:border-fuchsia-500"
    };

    if (isSobre) {
      return isDark
        ? `w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-xl p-2.5 text-xs sm:text-sm text-white outline-none font-sans`
        : `w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-zinc-900 outline-none font-sans`;
    }
    if (isWarm) {
      return isDark
        ? `w-full bg-[#2B231F] border border-amber-900/30 focus:border-amber-700 rounded-xl p-2.5 text-xs sm:text-sm text-amber-50 outline-none font-serif`
        : `w-full bg-[#FAF6F0] border border-amber-950/15 focus:border-amber-900 rounded-xl p-2.5 text-xs sm:text-sm text-amber-950 outline-none font-serif`;
    }
    if (isCyber) {
      return isDark
        ? `w-full bg-black border border-cyan-500/30 ${focusColors[focusColor]} rounded-none p-2.5 text-xs sm:text-sm text-[#00ffcc] outline-none font-mono`
        : `w-full bg-[#f4fffe] border border-cyan-500/50 ${focusColors[focusColor]} rounded-none p-2.5 text-xs sm:text-sm text-black outline-none font-mono`;
    }
    if (isFun) {
      return isDark
        ? `w-full bg-[#1D1B26] border-2 border-black rounded-xl p-2.5 text-xs sm:text-sm text-white outline-none font-bold`
        : `w-full bg-white border-2 border-black rounded-xl p-2.5 text-xs sm:text-sm text-black outline-none font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`;
    }
    return isDark
      ? `w-full bg-slate-950 border border-slate-800 ${focusColors[focusColor]} rounded-xl p-2.5 text-xs sm:text-sm text-white outline-none font-sans`
      : `w-full bg-slate-50 border border-slate-200 ${focusColors[focusColor]} rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 outline-none font-sans`;
  };

  const getTabClass = (active: boolean, type: "login" | "signup") => {
    if (isSobre) {
      return active
        ? isDark ? "border-zinc-300 text-white" : "border-zinc-900 text-zinc-950"
        : isDark ? "border-transparent text-zinc-500 hover:text-white" : "border-transparent text-zinc-400 hover:text-zinc-800";
    }
    if (isWarm) {
      return active
        ? isDark ? "border-amber-500 text-amber-100" : "border-amber-900 text-amber-950"
        : isDark ? "border-transparent text-amber-800/60 hover:text-white" : "border-transparent text-amber-900/40 hover:text-amber-900";
    }
    if (isCyber) {
      return active
        ? isDark ? "border-cyan-400 text-cyan-300" : "border-cyan-600 text-black"
        : isDark ? "border-transparent text-cyan-800 hover:text-cyan-400" : "border-transparent text-zinc-400 hover:text-black";
    }
    if (isFun) {
      return active
        ? "border-b-3 border-black bg-yellow-300 text-black font-black uppercase italic rounded-t-xl"
        : "border-transparent text-black/60 hover:text-black font-bold";
    }
    const color = type === "login" ? "border-cyan-400 text-cyan-300" : "border-violet-400 text-violet-300";
    return active
      ? `${color} border-b-2`
      : isDark ? "border-transparent text-slate-400 hover:text-white" : "border-transparent text-slate-500 hover:text-slate-800";
  };

  if (user) {
    return (
      <div className={getContainerClass()}>
        <div className={`flex items-center gap-4 border-b pb-4 ${isSobre ? "border-zinc-800/50" : isWarm ? "border-amber-900/20" : isCyber ? "border-cyan-500/20" : isFun ? "border-2 border-black bg-pink-100 p-3 rounded-2xl text-black" : "border-slate-800"}`}>
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center font-bold text-lg text-white uppercase shadow-lg shadow-indigo-500/25 shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || "U")
            )}
          </div>
          <div className="min-w-0">
            <h3 className={`font-sans font-bold text-base sm:text-lg truncate ${isFun ? "text-black font-black" : isDark ? "text-white" : "text-zinc-900"}`}>
              {user.displayName || "Utilisateur InfoPerso"}
            </h3>
            <p className={`text-xs font-mono truncate ${isFun ? "text-black/70" : isDark ? "text-zinc-400" : "text-zinc-500"}`}>{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Verification Status */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSobre ? isDark ? "bg-zinc-950/60 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-800" :
            isWarm ? isDark ? "bg-[#2B231F]/80 border-amber-900/30 text-amber-100" : "bg-[#FAF6F0] border-amber-950/15 text-amber-900" :
            isCyber ? isDark ? "bg-black border-cyan-500/20 text-[#00ffcc]" : "bg-[#f4fffe] border-cyan-500/40 text-black" :
            isFun ? "bg-yellow-100 border-2 border-black rounded-xl text-black" :
            isDark ? "bg-slate-950/50 border-slate-800/60 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}>
            {user.emailVerified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`text-sm font-bold ${isFun ? "font-black uppercase" : isDark ? "text-emerald-300" : "text-emerald-700"}`}>Compte Vérifié</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-85">
                    Votre adresse e-mail a été confirmée. Vous pouvez proposer des articles sans restriction.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${isFun ? "font-black uppercase" : isDark ? "text-amber-300" : "text-amber-700"}`}>Adresse e-mail non vérifiée</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-85">
                    Pour garantir l'intégrité de la communauté, veuillez vérifier votre adresse e-mail.
                  </p>
                  {verificationSent ? (
                    <p className={`text-xs font-medium mt-2 px-2.5 py-1.5 rounded-lg border ${
                      isCyber ? "bg-cyan-950/30 border-cyan-500/20 text-cyan-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}>
                      ✉️ Un e-mail de confirmation vient d'être envoyé. Veuillez vérifier votre boîte de réception.
                    </p>
                  ) : (
                    <button
                      onClick={handleResendVerification}
                      className="mt-3 text-xs font-semibold text-cyan-500 hover:text-cyan-600 hover:underline cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Renvoyer l'e-mail de vérification
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs opacity-60">Connecté avec {user.providerData[0]?.providerId === "google.com" ? "Google" : "E-mail"}</p>
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isFun ? "bg-rose-400 hover:bg-rose-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                "bg-red-950/40 hover:bg-red-900/30 text-red-300 hover:text-red-200 border border-red-500/20"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClass()}>
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isFun ? "font-black uppercase tracking-tight italic" : isWarm ? "font-serif italic font-bold" : "font-sans"}`}>
          Espace Connexion
        </h3>
        <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
          Rejoignez la communauté InfoPerso pour proposer des articles et personnaliser votre filtre d'actualités.
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isSobre ? "border-zinc-800/30" : isWarm ? "border-amber-900/10" : isCyber ? "border-cyan-500/25" : isFun ? "border-3 border-black" : "border-slate-800"}`}>
        <button
          onClick={() => { setIsSignUp(false); setError(null); }}
          className={`flex-1 pb-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${getTabClass(!isSignUp, "login")}`}
        >
          Se connecter
        </button>
        <button
          onClick={() => { setIsSignUp(true); setError(null); }}
          className={`flex-1 pb-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${getTabClass(isSignUp, "signup")}`}
        >
          Créer un compte
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-500/30 text-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Auth Provider Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.01] ${
          isFun ? "bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
          isDark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 hover:bg-slate-850 text-white"
        }`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        S'authentifier avec Google
      </button>

      <div className="flex items-center my-4">
        <div className={`flex-1 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}></div>
        <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">ou par e-mail</span>
        <div className={`flex-1 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}></div>
      </div>

      {/* Email Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isSignUp && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-sans font-bold flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-violet-400" /> Nom d'affichage
            </label>
            <input
              type="text"
              placeholder="Ex: Jean D."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={getInputClass("violet")}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-sans font-bold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" /> Adresse e-mail
          </label>
          <input
            type="email"
            required
            placeholder="votre.nom@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getInputClass("cyan")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-sans font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-fuchsia-400" /> Mot de passe
          </label>
          <input
            type="password"
            required
            placeholder="Au moins 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClass("fuchsia")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 disabled:opacity-50 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg mt-2 ${
            isFun 
              ? "bg-fuchsia-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5" 
              : "bg-linear-to-r from-cyan-500 to-indigo-500 text-white shadow-cyan-500/20 hover:scale-[1.01]"
          }`}
        >
          {loading ? "Chargement..." : isSignUp ? "Créer mon compte & envoyer vérification" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
