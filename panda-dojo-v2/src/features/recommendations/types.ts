export interface TrainingRecommendation {
  id: string;
  title: string;
  message: string;
  targetPage: string | null;
  targetLessonId: string | null;
  priority: 'high' | 'medium' | 'normal';
  reason: string;
}
