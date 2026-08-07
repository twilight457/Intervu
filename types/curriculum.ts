export interface CurriculumTool {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  subtopics: string[];
  keyConcepts: string[];
}

export interface CurriculumDay {
  dayNumber: number;
  title: string;
  theme: string;
  description: string;
  topics: CurriculumTopic[];
  objectives: LearningObjective[];
  tools: CurriculumTool[];
}

export interface CohortSyllabus {
  cohortId: string;
  cohortName: string;
  description: string;
  totalDays: number;
  days: CurriculumDay[];
}
