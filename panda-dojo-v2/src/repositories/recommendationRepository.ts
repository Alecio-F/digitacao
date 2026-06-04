import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import type { TrainingRecommendation } from '@/features/recommendations/types';

export function getRecommendations(): TrainingRecommendation[] {
  const stored = persistence.getItem<TrainingRecommendation[]>(PERSISTENCE_KEYS.recommendations, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveRecommendations(recommendations: TrainingRecommendation[]): void {
  persistence.setItem(PERSISTENCE_KEYS.recommendations, recommendations);
}

export function clearRecommendations(): void {
  persistence.removeItem(PERSISTENCE_KEYS.recommendations);
}
