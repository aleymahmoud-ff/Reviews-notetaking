export interface Note {
  id: string;
  category: string; // Direction/Function/Core Capability
  owner: string;
  title: string;
  description: string;
  content: string; // Your Notes Here
  timestamp: number;
}

export interface NoteFormData {
  category: string;
  owner: string;
  title: string;
  description: string;
  content: string;
}

export interface ReportState {
  isGenerating: boolean;
  content: string | null;
  error: string | null;
}
