export interface GeneratedContent {
  id: string;
  imageUrl: string;
  imageDescription: string;
  theme: string; // The name of the visual concept (e.g., "Iceberg Theory")
  text: string[]; // Array of 3 paragraphs
  advantageUsed: string;
  timestamp: number;
  isUploaded?: boolean; // New field to indicate if the image was uploaded by the user
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  textSnippet: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  IMAGE_READY = 'IMAGE_READY',
  GENERATING_TEXT = 'GENERATING_TEXT',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface SellingPoint {
  id: number;
  content: string;
}