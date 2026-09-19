import { jsPDF } from "jspdf";
import { NewsArticle } from "../types";
import { fixTemporalConsistency } from "./temporalConsistency";
import { getArticleIllustration } from "./photoService";

/**
 * Charge une URL d'image et la convertit en Base64 JPEG/PNG pour jsPDF.
 * Tente d'abord un chargement direct via Canvas (CORS anonymous),
 * puis se rabat sur le proxy serveur /api/image-proxy en cas d'échec CORS.
 */
export async function loadImageAsBase64(
  url: string
): Promise<{ dataUrl: string; format: "JPEG" | "PNG"; width: number; height: number } | null> {
  if (!url || typeof url !== "string") return null;

  // 1. Si c'est déjà une data URL base64
  if (url.startsWith("data:image/")) {
    const isPng = url.startsWith("data:image/png");
    return {
      dataUrl: url,
      format: isPng ? "PNG" : "JPEG",
      width: 800,
      height: 450
    };
  }

  // 2. Tenter le chargement direct via Image DOM avec canvas
  const tryDirectCanvas = (): Promise<{ dataUrl: string; format: "JPEG" | "PNG"; width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 450;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          resolve({
            dataUrl,
            format: "JPEG",
            width: canvas.width,
            height: canvas.height
          });
        } catch (_err) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const directResult = await tryDirectCanvas();
  if (directResult) return directResult;

  // 3. Repli via proxy serveur pour contourner d'éventuelles restrictions CORS (ex: Wikimedia/Wikipedia)
  try {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (base64data && base64data.startsWith("data:image/")) {
          const isPng = base64data.includes("image/png");
          resolve({
            dataUrl: base64data,
            format: isPng ? "PNG" : "JPEG",
            width: 800,
            height: 450
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (_e) {
    return null;
  }
}

/**
 * Nettoie les balises markdown et caractères spéciaux pour l'affichage PDF
 */
function cleanMarkdownForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // gras **
    .replace(/\*(.*?)\*/g, "$1")     // italique *
    .replace(/__(.*?)__/g, "$1")     // gras __
    .replace(/_(.*?)_/g, "$1")       // italique _
    .replace(/`([^`]+)`/g, "$1")     // code
    .replace(/#+\s+/g, "")           // titres markdown ###
    .replace(/[«»]/g, '"')           // guillemets français compatibles
    .trim();
}

/**
 * Nettoie le nom de fichier pour le téléchargement
 */
function sanitizeFileName(title: string): string {
  return (title || "article")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 36)
    .replace(/^_|_$/g, "");
}

export interface PdfExportOptions {
  article: NewsArticle;
  photoUrl?: string | null;
  deepDiveHistory?: Array<{ question: string; answer: string; parentQuestion?: string }>;
  onProgress?: (status: string) => void;
}

/**
 * Génère et déclenche le téléchargement d'un PDF élégant avec illustration photo
 */
export async function exportArticleAsPdf({
  article,
  photoUrl,
  deepDiveHistory = [],
  onProgress
}: PdfExportOptions): Promise<boolean> {
  try {
    if (onProgress) onProgress("Préparation de l'illustration...");

    // 1. Résolution de l'illustration photo
    const targetPhotoUrl = photoUrl || article.imageUrl || getArticleIllustration(article);
    const photoData = await loadImageAsBase64(targetPhotoUrl);

    if (onProgress) onProgress("Création de la mise en page PDF...");

    // Dimensions A4 en millimètres
    // Largeur : 210mm, Hauteur : 297mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 18;
    const contentWidth = pageWidth - (margin * 2); // 174mm
    const maxContentY = pageHeight - 20; // marge basse 20mm

    let currentY = 18;

    // Fonction d'ajout de nouvelle page avec réinitialisation de Y
    const checkPageBreak = (neededHeight: number) => {
      if (currentY + neededHeight > maxContentY) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // ==========================================
    // 1. BANDEAU D'EN-TÊTE SUPÉRIEUR (Header)
    // ==========================================
    // Barre colorée d'accent
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(margin, currentY, contentWidth, 2.5, "F");
    currentY += 8;

    // Logo / Marque InfoPerso
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text("INFOPERSO", margin, currentY);

    // Date et métadonnées
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate 500
    const todayStr = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    doc.text(`Édition du ${todayStr}`, margin + 35, currentY);

    // Source & Catégorie à droite
    const sourceCategoryText = `${article.source || "Presse"} • ${article.category || "Actualité"}`;
    doc.text(sourceCategoryText, pageWidth - margin, currentY, { align: "right" });

    currentY += 8;

    // Ligne séparatrice fine
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // ==========================================
    // 2. TITRE DE L'ARTICLE
    // ==========================================
    const cleanTitle = cleanMarkdownForPdf(article.title);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42); // Slate 900

    const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
    const titleHeight = titleLines.length * 7;
    doc.text(titleLines, margin, currentY);
    currentY += titleHeight + 4;

    // ==========================================
    // 3. ILLUSTRATION PHOTO (PHOTO IMAGE)
    // ==========================================
    if (photoData && photoData.dataUrl) {
      // Hauteur au ratio ~ 16:9 adapté pour tenir élégamment
      const imgWidth = contentWidth;
      const imgHeight = Math.min(84, Math.round(contentWidth * (photoData.height / (photoData.width || 1))));

      checkPageBreak(imgHeight + 14);

      try {
        // Cadre rectangulaire de l'image
        doc.addImage(
          photoData.dataUrl,
          photoData.format,
          margin,
          currentY,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        currentY += imgHeight + 4;

        // Légende photo & licence
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // Slate 400
        const photoCaption = `Photo d'illustration • ${article.category || "Actualité"} • Licence libre de droit (Unsplash / Wikimedia)`;
        doc.text(photoCaption, margin, currentY);

        currentY += 8;
      } catch (imgErr) {
        console.warn("Erreur lors de l'insertion de l'image dans le PDF:", imgErr);
      }
    }

    // ==========================================
    // 4. RÉSUMÉ & ANALYSE DE SYNTHÈSE
    // ==========================================
    const rawSummary = article.aiSummaryCustom || article.summary || "";
    const cleanSummary = fixTemporalConsistency(cleanMarkdownForPdf(rawSummary));

    if (cleanSummary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(cleanSummary, contentWidth - 14);
      const boxHeight = (summaryLines.length * 5.2) + 16;

      checkPageBreak(boxHeight + 6);

      // Fond de boîte de synthèse
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, "FD");

      // Barre d'accentuation violette/indigo à gauche
      doc.setFillColor(99, 102, 241); // Indigo 500
      doc.rect(margin, currentY, 3, boxHeight, "F");

      // Titre du résumé
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text("SYNTHÈSE & ANALYSE", margin + 7, currentY + 6.5);

      // Texte du résumé
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text(summaryLines, margin + 7, currentY + 12);

      currentY += boxHeight + 8;
    }

    // ==========================================
    // 5. TEXTE INTÉGRAL DE L'ARTICLE
    // ==========================================
    const rawContent = article.content || "";
    const cleanContent = fixTemporalConsistency(cleanMarkdownForPdf(rawContent));

    if (cleanContent) {
      checkPageBreak(15);

      // Sous-titre "TEXTE INTÉGRAL"
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text("TEXTE INTÉGRAL", margin, currentY);
      currentY += 3;

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, margin + 40, currentY);
      currentY += 6;

      // Paragraphes du corps de texte
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // Slate 700

      const paragraphs = cleanContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

      for (const p of paragraphs) {
        const lines = doc.splitTextToSize(p, contentWidth);
        const paragraphHeight = lines.length * 4.8;

        checkPageBreak(paragraphHeight + 4);

        doc.text(lines, margin, currentY);
        currentY += paragraphHeight + 4; // espacement inter-paragraphe
      }
    }

    // ==========================================
    // 6. FICHES D'APPROFONDISSEMENT (SI DISPONIBLES)
    // ==========================================
    if (deepDiveHistory && deepDiveHistory.length > 0) {
      checkPageBreak(20);

      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text("FICHES D'APPROFONDISSEMENT (IA)", margin, currentY);
      currentY += 6;

      for (let i = 0; i < deepDiveHistory.length; i++) {
        const item = deepDiveHistory[i];
        const qClean = cleanMarkdownForPdf(item.question);
        const aClean = cleanMarkdownForPdf(item.answer);

        const qLines = doc.splitTextToSize(`Question : ${qClean}`, contentWidth - 8);
        const aLines = doc.splitTextToSize(aClean, contentWidth - 8);
        const itemHeight = (qLines.length * 4.5) + (aLines.length * 4.4) + 12;

        checkPageBreak(itemHeight + 4);

        // Fond gris doux
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, contentWidth, itemHeight, 1.5, 1.5, "FD");

        // Question
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(qLines, margin + 4, currentY + 5);

        // Réponse
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(aLines, margin + 4, currentY + 6 + (qLines.length * 4.5));

        currentY += itemHeight + 5;
      }
    }

    // ==========================================
    // 7. NUMÉROTATION DES PAGES ET PIED DE PAGE
    // ==========================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Ligne séparatrice de bas de page
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      // Texte de pied de page gauche
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(
        "Document généré par InfoPerso • Édition numérique personnelle et synthèse d'actualité",
        margin,
        pageHeight - 7.5
      );

      // Pagination droite
      doc.text(
        `Page ${i} / ${totalPages}`,
        pageWidth - margin,
        pageHeight - 7.5,
        { align: "right" }
      );
    }

    // ==========================================
    // 8. TÉLÉCHARGEMENT DU FICHIER PDF
    // ==========================================
    if (onProgress) onProgress("Téléchargement du fichier...");
    const fileName = `${sanitizeFileName(article.title)}_infoperso.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return false;
  }
}
