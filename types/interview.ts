export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewQuestion {
  id: string;
  dayNumber: number;
  topicId: string;
  questionText: string;
  difficulty: QuestionDifficulty;
  expectedConcepts: string[];
  isFollowUp: boolean;
  parentQuestionId?: string;
}

export interface AnswerEvaluation {
  accuracyScore: number;
  depthScore: number;
  clarityScore: number;
  feedback: string;
  keyConceptsCovered: string[];
  missedConcepts: string[];
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'learner' | 'system';
  timestamp: string;
  text: string;
  questionRef?: InterviewQuestion;
  evaluationRef?: AnswerEvaluation;
}

export interface InterviewSession {
  sessionId: string;
  learnerId: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'terminated';
  coveredDayNumbers: number[];
  questionsAskedCount: number;
  messages: ConversationMessage[];
  currentQuestionIndex: number;
}
