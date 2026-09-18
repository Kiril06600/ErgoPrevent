import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type {
  ExportOperationResult,
  ExportPdfOptions,
  ExportTextFileOptions,
} from "./fileExportTypes";

function createCachedFile(filename: string, content: string) {
  const file = new File(Paths.cache, filename);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(content);

  return file;
}

export async function exportTextFile({
  filename,
  content,
  mimeType,
  dialogTitle,
}: ExportTextFileOptions): Promise<ExportOperationResult> {
  try {
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
      return {
        success: false,
        message: "Le partage de fichiers n’est pas disponible sur cet appareil.",
      };
    }

    const file = createCachedFile(filename, content);

    await Sharing.shareAsync(file.uri, {
      dialogTitle,
      mimeType,
    });

    return {
      success: true,
      message: "Fichier prêt à être partagé ou enregistré.",
    };
  } catch {
    return {
      success: false,
      message: "Le fichier n’a pas pu être généré ou partagé.",
    };
  }
}

export async function exportPdfFromHtml({
  html,
  dialogTitle,
}: ExportPdfOptions): Promise<ExportOperationResult> {
  try {
    const sharingAvailable = await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
      return {
        success: false,
        message: "Le partage de fichiers n’est pas disponible sur cet appareil.",
      };
    }

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri, {
      dialogTitle,
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });

    return {
      success: true,
      message: "Rapport PDF prêt à être partagé ou enregistré.",
    };
  } catch {
    return {
      success: false,
      message: "Le rapport PDF n’a pas pu être généré ou partagé.",
    };
  }
}
