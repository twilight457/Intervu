export interface CompletedModule {
  dayNumber: number;
  completedAt: string;
  scorePercentage?: number;
  verifiedObjectives: string[];
}

export interface SkippedTopic {
  topicId: string;
  dayNumber: number;
  reason?: string;
}

export interface AttemptHistory {
  attemptId: string;
  date: string;
  interviewScore: number;
  passed: boolean;
  notes?: string;
}

export interface LearningProgress {
  overallCompletionPercentage: number;
  currentDay: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  cohortId: string;
  completedModules: CompletedModule[];
  skippedTopics: SkippedTopic[];
  attempts: AttemptHistory[];
  progress: LearningProgress;
}
