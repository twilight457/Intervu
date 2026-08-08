import { CandidateProfile } from "@/types/profile";

export type EvaluationVerdict =
  | "correct"
  | "partially_correct"
  | "incorrect"
  | "not_attempted";

export interface EvaluationResult {
  verdict: EvaluationVerdict;
  reasoning: string;
  concepts_demonstrated: string[];
  concepts_missing: string[];
  factual_errors: string[];
  should_follow_up: boolean;
}

export interface InterviewTurn {
  id: string;
  type: "MAIN_QUESTION" | "FOLLOW_UP";
  mainQuestionNumber: number;
  subQuestionCode?: string; // e.g., "1a"
  parentMainQuestionId?: string;
  curriculumDay: number;
  curriculumTopic: string;
  curriculumObjective?: string; // Specific learning objective selected for this main question
  question: string;
  answer?: string;
  evaluation?: EvaluationResult;
  timestamp: string;
}

export interface InterviewSession {
  sessionId: string;
  candidate: CandidateProfile;
  completedDays: Array<{
    day: number;
    title: string;
    objectives: string[];
    tools: string[];
  }>;
  turns: InterviewTurn[];
  mainQuestionNumber: number; // Current MAIN question (1, 2, 3...)
  totalPlannedMainQuestions: number; // Dynamic planned main questions (e.g. 8, 9, 10, 11)
  followUpCount: number; // 0 or 1 max per main question
  isDone: boolean;
  feedback?: {
    summary: string;
    strengths: string[];
    gaps: string[];
    next: string[];
    overallScore?: number;
    questionEvaluations?: Array<{
      mainQuestionNumber: number;
      topic: string;
      day: number;
      verdict: EvaluationVerdict;
      conceptsDemonstrated: string[];
      conceptsMissing: string[];
    }>;
  };
  createdAt: number;
}

// In-memory session store
const sessionsStore = new Map<string, InterviewSession>();

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessionsStore.get(sessionId);
}

export function saveSession(session: InterviewSession): void {
  sessionsStore.set(session.sessionId, session);
}

export function deleteSession(sessionId: string): void {
  sessionsStore.delete(sessionId);
}
