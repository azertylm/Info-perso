import { useState, useEffect, useCallback } from "react";

export type FoldMode = "auto" | "book" | "flex" | "single";
export type FoldPosture = "book" | "flex" | "compact" | "standard";

export interface FoldableState {
  isFoldableDetected: boolean;
  foldMode: FoldMode;
  activePosture: FoldPosture;
  isBookMode: boolean;
  isFlexMode: boolean;
  isCompactCover: boolean;
  hingeGuard: boolean;
  setFoldMode: (mode: FoldMode) => void;
  setHingeGuard: (guard: boolean) => void;
  cycleFoldMode: () => void;
}

export function useFoldable(): FoldableState {
  const [foldMode, setFoldModeState] = useState<FoldMode>(() => {
    try {
      const saved = localStorage.getItem("infoperso_fold_mode");
      if (saved === "book" || saved === "flex" || saved === "single" || saved === "auto") {
        return saved;
      }
    } catch {}
    return "auto";
  });

  const [hingeGuard, setHingeGuardState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("infoperso_hinge_guard");
      if (saved !== null) return saved === "true";
    } catch {}
    return true; // enabled by default for protection
  });

  const [detectedPosture, setDetectedPosture] = useState<FoldPosture>("standard");
  const [isFoldableHardware, setIsFoldableHardware] = useState<boolean>(false);

  // Monitor viewport and foldable screen media queries
  useEffect(() => {
    const checkFoldableCharacteristics = () => {
      if (typeof window === "undefined") return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const ratio = w / (h || 1);

      // 1. Check official W3C foldable screen segments media queries
      const hasHorizontalSegments = window.matchMedia?.("(horizontal-viewport-segments: 2)")?.matches ?? false;
      const hasVerticalSegments = window.matchMedia?.("(vertical-viewport-segments: 2)")?.matches ?? false;
      const isHardwareFold = hasHorizontalSegments || hasVerticalSegments;

      // 2. Detect Foldable Unfolded (Book-like aspect ratio 4:3, 5:4, 1:1 with width between 560px and 1024px)
      // Standard Galaxy Z Fold unfolded: ~674px - 720px wide, ratio ~ 0.82 - 1.25
      const isUnfoldedDimensions = w >= 560 && w <= 1100 && ratio >= 0.75 && ratio <= 1.35;

      // 3. Detect Narrow Folded Cover Screen (21:9 - 24.5:9, width <= 400px with height >= 640px)
      const isNarrowCover = w <= 400 && h >= 640 && ratio <= 0.55;

      if (isHardwareFold || isUnfoldedDimensions) {
        setIsFoldableHardware(true);
        if (hasVerticalSegments) {
          setDetectedPosture("flex");
        } else {
          setDetectedPosture("book");
        }
      } else if (isNarrowCover) {
        setIsFoldableHardware(true);
        setDetectedPosture("compact");
      } else {
        setIsFoldableHardware(false);
        setDetectedPosture("standard");
      }
    };

    checkFoldableCharacteristics();
    window.addEventListener("resize", checkFoldableCharacteristics);
    window.addEventListener("orientationchange", checkFoldableCharacteristics);

    return () => {
      window.removeEventListener("resize", checkFoldableCharacteristics);
      window.removeEventListener("orientationchange", checkFoldableCharacteristics);
    };
  }, []);

  const setFoldMode = useCallback((mode: FoldMode) => {
    setFoldModeState(mode);
    try {
      localStorage.setItem("infoperso_fold_mode", mode);
    } catch {}
  }, []);

  const setHingeGuard = useCallback((guard: boolean) => {
    setHingeGuardState(guard);
    try {
      localStorage.setItem("infoperso_hinge_guard", String(guard));
    } catch {}
  }, []);

  const cycleFoldMode = useCallback(() => {
    setFoldModeState((curr) => {
      let next: FoldMode = "auto";
      if (curr === "auto") next = "book";
      else if (curr === "book") next = "flex";
      else if (curr === "flex") next = "single";
      else next = "auto";
      try {
        localStorage.setItem("infoperso_fold_mode", next);
      } catch {}
      return next;
    });
  }, []);

  // Determine active posture based on user override or automatic detection
  const activePosture: FoldPosture = (() => {
    if (foldMode === "book") return "book";
    if (foldMode === "flex") return "flex";
    if (foldMode === "single") return "standard";
    // "auto":
    return detectedPosture;
  })();

  const isBookMode = activePosture === "book";
  const isFlexMode = activePosture === "flex";
  const isCompactCover = activePosture === "compact";

  return {
    isFoldableDetected: isFoldableHardware,
    foldMode,
    activePosture,
    isBookMode,
    isFlexMode,
    isCompactCover,
    hingeGuard,
    setFoldMode,
    setHingeGuard,
    cycleFoldMode
  };
}
