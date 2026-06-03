export interface Era {
  id: string;
  name: string;
  year: string;
  period: string;
  description: string;
  image: string;
  defaultFaceProps: FaceLayer;
  suggestedPrompts: string[];
  historicalRole: string;
}

export interface FaceLayer {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  scale: number; // scale multiplier (0.1 to 3)
  rotation: number; // degrees (-180 to 180)
  feather: number; // px (0 to 40)
  brightness: number; // percent (50 to 150)
  contrast: number; // percent (50 to 150)
  sepia: number; // percent (0 to 100)
  grayscale: number; // percent (0 to 100)
  opacity: number; // percent (0 to 100)
  hFlip: boolean;
  cropShape: 'circle' | 'oval' | 'soft-square' | 'vintage-frame';
}

export interface TimeTravelNarrative {
  journalEntry: string;
  historicalContext: string;
  anachronismScan: string;
  butterflyEffectRisk: number; // 0 - 100
  butterflyEffectWarning: string;
}

export interface TimeTravelSession {
  id: string;
  username: string;
  userPhoto: string | null; // Base64 or Blob URL
  selectedEraId: string;
  isCustomEra: boolean;
  customEraName?: string;
  customEraImage?: string;
  faceLayer: FaceLayer;
  narrative: TimeTravelNarrative | null;
  loadingNarrative: boolean;
  loadingCustomScene: boolean;
}
