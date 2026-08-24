export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf-to-img'
  | 'img-to-pdf'
  | 'remove-pages'
  | 'rotate';

export interface ToolInfo {
  id: ToolId;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  color: string;
  badge?: string;
  acceptTypes: string[];
  multipleFiles: boolean;
}

export interface PDFPageInfo {
  pageNumber: number; // 1-based index
  thumbnailUrl?: string;
  rotation: number; // 0, 90, 180, 270
  selected?: boolean;
  markedForRemoval?: boolean;
  width?: number;
  height?: number;
}

export interface ProcessedResult {
  fileName: string;
  blob: Blob;
  url: string;
  fileSize: number;
  originalSize?: number;
  type: 'pdf' | 'zip' | 'image';
  previewUrl?: string;
  images?: { name: string; url: string; blob: Blob }[];
}

export type ProcessingState = 'idle' | 'loading_preview' | 'ready' | 'processing' | 'completed' | 'error';
