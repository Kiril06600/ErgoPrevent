export type ExportTextFileOptions = {
  filename: string;
  content: string;
  mimeType: string;
  dialogTitle: string;
};

export type ExportPdfOptions = {
  html: string;
  dialogTitle: string;
};

export type ExportOperationResult = {
  success: boolean;
  message: string;
};
