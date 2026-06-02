export type SupportedPlatform = "youtube" | "facebook" | "tiktok" | "gdrive" | "other" | "google_drive";

export interface DownloadOption {
  quality: "1080" | "720" | "480" | "360";
  label: string;
  isFps60?: boolean;
}

export interface PickerItem {
  id: number;
  url: string;
  text: string;
  type: string;
}

export interface MediaResult {
  status: "success" | "error";
  platform: SupportedPlatform;
  title: string;
  url?: string;
  pickerType?: string | null;
  picker?: PickerItem[] | null;
  timestamp: string;
}

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  platform: SupportedPlatform;
  timestamp: string;
  directUrl: string;
}

export interface LoadingStep {
  id: number;
  label: string;
  status: "idle" | "running" | "completed" | "failed";
}
