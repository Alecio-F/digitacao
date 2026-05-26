import { useNavigate } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { Chip, Panel } from '@/components/ui';
import { useDailyMissions } from '@/features/missions/hooks/useDailyMissions';
import { useLessonProgress } from '@/features/lessons/hooks/useLessonProgress';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { DailyMissionList } from '@/pages/HomePage/components/DailyMissionList';
import { LessonTrail } from './components/LessonTrail';
import { PlayerCard } from './components/PlayerCard';
import styles from './DojoMapPage.module.css';

export function DojoMapPage() {
  const navigate = useNavigate();
  const missions = useDailyMissions();
  const recommendations = useRecommendations();
  const { startLesson } = useLessonProgress();

  const firstRec = recommendations[0];

  function handleStart(lessonId: string) {
    const ok = startLesson(lessonId);
    if (ok) navigate('/arena');
  }

  return (
    <PageShell title="Mapa do Dojo">
      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Mapa do Dojo</span>
          <h1 className={styles.heading}>Sua jornada de aprendizado</h1>
          <p className={styles.sub}>
            Complete as lições em ordem, ganhe medalhas e desbloqueie novos desafios.
          </p>
        </header>

        <div className={styles.grid}>
          <main className={styles.main}>
            <LessonTrail onStart={handleStart} />
          </main>

          <aside className={styles.sidebar}>
            <PlayerCard />

            {firstRec && (
              <Panel>
                <Chip variant="special" style={{ marginBottom: 8 }}>Próximo treino</Chip>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4 }}>{firstRec.title}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--dojo-text-muted)', lineHeight: 1.5 }}>
                  {firstRec.message}
                </p>
              </Panel>
            )}

            <DailyMissionList missions={missions} />
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
