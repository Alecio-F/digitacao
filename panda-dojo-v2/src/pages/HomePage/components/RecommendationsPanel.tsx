import { useNavigate } from 'react-router';
import { Badge, Button, Panel } from '@/components/ui';
import type { TrainingRecommendation } from '@/features/recommendations/types';
import styles from '../HomePage.module.css';

const FALLBACK_RECOMMENDATION: TrainingRecommendation = {
  id: 'start-arena',
  title: 'Comece pela Type Arena',
  message: 'Complete seu primeiro treino para gerar uma recomendação personalizada.',
  targetPage: '/arena',
  targetLessonId: null,
  priority: 'normal',
  reason: 'no-history',
};

interface Props {
  recommendations: TrainingRecommendation[];
}

export function RecommendationsPanel({ recommendations }: Props) {
  const navigate = useNavigate();
  const recommendation = recommendations[0] ?? FALLBACK_RECOMMENDATION;

  return (
    <Panel as="section" title="Próximo treino recomendado" subtitle="Sugestão gerada com base no histórico local.">
      <article className={styles.recommendationCard}>
        <div className={styles.recommendationHeader}>
          <Badge variant={recommendation.priority === 'high' ? 'warning' : 'info'}>
            {recommendation.priority}
          </Badge>
          <span>{recommendation.reason}</span>
        </div>
        <strong>{recommendation.title}</strong>
        <p>{recommendation.message}</p>
        {recommendation.targetPage && (
          <Button variant="primary" size="sm" onClick={() => navigate(recommendation.targetPage!)}>
            Treinar agora
          </Button>
        )}
      </article>
    </Panel>
  );
}
