import { CandidateProfile } from "@/types/profile";

const STORAGE_KEY = "intervu_selected_candidate";

export function getStoredCandidate(): CandidateProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? (JSON.parse(item) as CandidateProfile) : null;
  } catch (error) {
    console.error("Failed to read candidate from localStorage", error);
    return null;
  }
}

export function setStoredCandidate(candidate: CandidateProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
  } catch (error) {
    console.error("Failed to save candidate to localStorage", error);
  }
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
