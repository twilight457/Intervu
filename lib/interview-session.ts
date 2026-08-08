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
  expected_answer?: string; // Model answer based strictly on curriculum content
}

export interface InterviewTurn {
  id: string;
  type: "MAIN_QUESTION" | "FOLLOW_UP";
  mainQuestionNumber: number;
  subQuestionCode?: string; // e.g., "1a"
  parentMainQuestionId?: string;
  curriculumDay: number;
  curriculumTopic: string;
  curriculumObjective?: string;
  question: string;
  answer?: string;
  evaluation?: EvaluationResult;
  timestamp: string;
}

export interface QuestionEvaluationReportItem {
  mainQuestionNumber: number;
  question: string;
  curriculumDay: number;
  curriculumTopic: string;
  curriculumObjective?: string;
  candidateAnswer: string;
  finalVerdict: EvaluationVerdict;
  evaluationReasoning: string;
  expectedAnswer?: string; // Model answer for non-correct responses
  followUpQuestion?: string;
  followUpAnswer?: string;
  conceptsDemonstrated: string[];
  conceptsMissing: string[];
}

export interface InterviewFeedbackReport {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  overallScore: number;
  questionEvaluations: QuestionEvaluationReportItem[];
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
  mainQuestionNumber: number;
  totalPlannedMainQuestions: number;
  followUpCount: number;
  isDone: boolean;
  feedback?: InterviewFeedbackReport;
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
