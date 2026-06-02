import { useNavigate } from 'react-router';
import { Badge, Button, Panel } from '@/components/ui';
import type { Achievement } from '@/features/gamification/types';
import styles from '../HomePage.module.css';

interface Props {
  achievements: Achievement[];
  mistakes: [string, number][];
}

export function AchievementsPreview({ achievements, mistakes }: Props) {
  const navigate = useNavigate();

  return (
    <Panel
      as="section"
      title="Conquistas"
      subtitle="Medalhas locais desbloqueadas pelo seu progresso."
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate('/conta')}>
          Conta
        </Button>
      }
    >
      <div className={styles.badgeList}>
        {achievements.length ? (
          achievements.slice(0, 4).map((achievement) => (
            <Badge key={achievement.id} variant="special">
              {achievement.title}
            </Badge>
          ))
        ) : (
          <span className={styles.emptyState}>
            Complete seu primeiro treino para desbloquear conquistas.
          </span>
        )}
      </div>

      {mistakes.length > 0 && (
        <div className={styles.mistakesBlock}>
          <strong>Teclas para revisar</strong>
          <div className={styles.badgeList}>
            {mistakes.slice(0, 6).map(([key, qty]) => (
              <Badge key={key || 'space'} variant="danger">
                {key || 'espaço'} x{qty}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
