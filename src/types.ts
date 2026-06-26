export type ParaphraseMode = "humanize" | "formal" | "casual" | "professional" | "creative" | "academic";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: "user" | "admin";
  createdAt?: string;
  photoURL?: string;
}

export interface ParaphraseHistoryItem {
  id: string;
  userId?: string; // Menghubungkan riwayat dengan user tertentu
  originalText: string;
  paraphrasedText: string;
  mode: ParaphraseMode;
  language: "id" | "en";
  timestamp: string;
  scores: {
    aiProbability: number;
    originalAiProbability: number;
    readabilityScore: number;
    humanizedScore: number;
    feedback: string[];
    turnitinScore?: number;
    gptzeroScore?: number;
    copyleaksScore?: number;
    zerogptScore?: number;
    phraseReplacements?: {
      original: string;
      replacement: string;
      category: string;
      explanation: string;
    }[];
  };
  similarity: number;
}
