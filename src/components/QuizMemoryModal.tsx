import React, { useState, useEffect } from "react";
import { NewsArticle, QuizQuestion } from "../types";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  RotateCcw,
  X,
  ChevronRight
} from "lucide-react";

interface QuizMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isDark: boolean;
  onNotify: (msg: string) => void;
  onAwardCuriosityPoints?: (points: number, reason: string, category?: string, actionType?: "read" | "share" | "quiz") => void;
  geminiApiKey?: string;
}

export const QuizMemoryModal: React.FC<QuizMemoryModalProps> = ({
  isOpen,
  onClose,
  article,
  isDark,
  onNotify,
  onAwardCuriosityPoints,
  geminiApiKey
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasAwardedPoints, setHasAwardedPoints] = useState(false);

  // Generate contextual quiz based on article
  useEffect(() => {
    if (!article) return;

    const generateHeuristicQuestions = (art: NewsArticle): QuizQuestion[] => {
      const title = art.title;
      const source = art.source || "Presse";
      const cat = art.category || "Actualité";

      return [
        {
          question: `Quel est l'axe principal développé dans cet article ?`,
          options: [
            title,
            `Une simple rumeur de réseau social sans vérification préalable`,
            `Un fait divers sans lien avec le secteur ${cat}`,
            `Une rétrospective historique sans rapport avec le présent`
          ],
          correctIndex: 0,
          explanation: `L'article se concentre précisément sur "${title}", rapporté par la rédaction de ${source}.`
        },
        {
          question: `Quelle source médiatique a publié et vérifié cette information ?`,
          options: [
            `Un forum non vérifié`,
            source,
            `Un blog anonyme sans attribution`,
            `Une agence de communication inconnue`
          ],
          correctIndex: 1,
          explanation: `L'enquête et la dépêche proviennent de ${source}.`
        },
        {
          question: `Dans quelle grande catégorie thématique s'inscrit cet enjeu ?`,
          options: [
            `Divertissement & Télé-réalité`,
            `Astrologie & Ésotérisme`,
            cat,
            `Bricolage domestique`
          ],
          correctIndex: 2,
          explanation: `Cet article relève directement du domaine ${cat}, avec un score de pertinence éditoriale de ${art.score}/100.`
        }
      ];
    };

    setQuestions(generateHeuristicQuestions(article));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setHasAwardedPoints(false);
  }, [article]);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleValidateAnswer = () => {
    if (selectedOption === null || !questions[currentIndex]) return;

    const isCorrect = selectedOption === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
      if (!hasAwardedPoints && onAwardCuriosityPoints && article) {
        onAwardCuriosityPoints(25, "Défi Mémorisation réussi sur l'actualité", article.category, "quiz");
        setHasAwardedPoints(true);
        onNotify("🏆 Félicitations ! +25 Points de Curiosité ajoutés à votre profil !");
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (!isOpen || !article || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          isDark
            ? "bg-slate-900 border-amber-500/30 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>Défi Mémorisation Active (Anki)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold font-mono">
                  +25 pts
                </span>
              </h3>
              <p className="text-xs opacity-75 truncate max-w-xs">
                Question {currentIndex + 1} / {questions.length}
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

        {/* Question Stage */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar flex-1">
          {!isFinished ? (
            <div className="space-y-4">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 justify-center">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-8 bg-amber-500"
                        : idx < currentIndex
                        ? "w-4 bg-emerald-500"
                        : "w-4 bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Question Text */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}>
                <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === currentQ.correctIndex;
                  let optStyle = isDark
                    ? "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-200"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800";

                  if (isSubmitted) {
                    if (isCorrect) {
                      optStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300 line-through opacity-80";
                    } else {
                      optStyle = "opacity-40 border-transparent";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/30";
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isSubmitted}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note when submitted */}
              {isSubmitted && (
                <div className="p-3.5 rounded-xl border bg-indigo-500/10 border-indigo-500/30 text-xs leading-relaxed text-indigo-300 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explication de l'actualité :</span>
                  </div>
                  <div>{currentQ.explanation}</div>
                </div>
              )}
            </div>
          ) : (
            /* Celebration Stage */
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg animate-bounce">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-lg sm:text-xl">
                  Défi Mémorisation Terminé !
                </h4>
                <p className="text-xs sm:text-sm opacity-75">
                  Vous avez répondu correctement à {score} sur {questions.length} questions.
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold text-sm">
                🎉 +25 Points de Curiosité crédités pour votre mémorisation active !
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-700/40 flex items-center justify-between gap-3 bg-black/20">
          {!isFinished ? (
            !isSubmitted ? (
              <button
                onClick={handleValidateAnswer}
                disabled={selectedOption === null}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                Valider ma réponse
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>{currentIndex < questions.length - 1 ? "Question suivante" : "Voir mon score final"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recommencer</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Fermer & Continuer ma lecture
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
