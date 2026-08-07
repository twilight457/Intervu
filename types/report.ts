export interface StrengthItem {
  id: string;
  topicTitle: string;
  dayNumber: number;
  description: string;
}

export interface WeaknessItem {
  id: string;
  topicTitle: string;
  dayNumber: number;
  description: string;
  suggestedAction: string;
}

export interface ReviewRecommendation {
  dayNumber: number;
  dayTitle: string;
  priority: 'high' | 'medium' | 'low';
  focusTopics: string[];
  reasoning: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  technicalAccuracy: number;
  problemSolving: number;
  communicationClarity: number;
  curriculumCoveragePercentage: number;
}

export interface FeedbackReport {
  reportId: string;
  sessionId: string;
  learnerId: string;
  createdAt: string;
  scores: ScoreBreakdown;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  recommendedReviewDays: ReviewRecommendation[];
  summary: string;
}
