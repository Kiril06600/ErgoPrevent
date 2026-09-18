import type {
  ExportOperationResult,
  ExportPdfOptions,
  ExportTextFileOptions,
} from "./fileExportTypes";

export async function exportTextFile({
  filename,
  content,
  mimeType,
}: ExportTextFileOptions): Promise<ExportOperationResult> {
  if (
    typeof document === "undefined" ||
    typeof Blob === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return {
      success: false,
      message: "Le téléchargement n’est pas disponible dans ce navigateur.",
    };
  }

  try {
    const blob = new Blob([content], {
      type: `${mimeType};charset=utf-8`,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: "Fichier téléchargé.",
    };
  } catch {
    return {
      success: false,
      message: "Le fichier n’a pas pu être téléchargé.",
    };
  }
}

export async function exportPdfFromHtml({
  html,
}: ExportPdfOptions): Promise<ExportOperationResult> {
  if (
    typeof window === "undefined" ||
    typeof window.open !== "function"
  ) {
    return {
      success: false,
      message: "Le rapport PDF n’est pas disponible dans ce navigateur.",
    };
  }

  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    return {
      success: false,
      message:
        "Le rapport n’a pas pu s’ouvrir. Vérifiez si le navigateur bloque les fenêtres.",
    };
  }

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();

  return {
    success: true,
    message: "Rapport ouvert pour impression ou enregistrement en PDF.",
  };
}
