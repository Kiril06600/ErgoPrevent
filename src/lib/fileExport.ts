import type {
  ExportOperationResult,
  ExportPdfOptions,
  ExportTextFileOptions,
} from "./fileExportTypes";

export async function exportTextFile(
  _options: ExportTextFileOptions
): Promise<ExportOperationResult> {
  return {
    success: false,
    message: "Export non disponible sur cette plateforme.",
  };
}

export async function exportPdfFromHtml(
  _options: ExportPdfOptions
): Promise<ExportOperationResult> {
  return {
    success: false,
    message: "Export PDF non disponible sur cette plateforme.",
  };
}
