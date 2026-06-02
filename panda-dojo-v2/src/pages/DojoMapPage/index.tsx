import { useNavigate } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui';
import { useLessonProgress } from '@/features/lessons/hooks/useLessonProgress';
import type { Lesson } from '@/features/lessons/types';
import { DojoMapHero } from './components/DojoMapHero';
import { LessonTrail } from './components/LessonTrail';
import { PlayerMapCard } from './components/PlayerMapCard';
import { RecommendedLessonPanel } from './components/RecommendedLessonPanel';
import styles from './DojoMapPage.module.css';

export function DojoMapPage() {
  const navigate = useNavigate();
  const {
    lessons,
    progress,
    recommendedLesson,
    getStatus,
    startLesson,
  } = useLessonProgress();

  function handleStart(lesson: Lesson) {
    startLesson(lesson);
  }

  return (
    <PageShell title="Mapa do Dojo" className={styles.dojoMapPage}>
      <div className={styles.container}>
        <DojoMapHero
          recommendedLesson={recommendedLesson ?? lessons[0]}
          onStart={handleStart}
          onArena={() => navigate('/arena')}
        />

        <section className={styles.mapOverviewGrid} aria-label="Resumo do mapa">
          <PlayerMapCard progress={progress} />
          <RecommendedLessonPanel
            lesson={recommendedLesson}
            onStart={handleStart}
            onArena={() => navigate('/arena')}
          />
        </section>

        <LessonTrail
          lessons={lessons}
          progress={progress}
          getStatus={getStatus}
          onStart={handleStart}
        />

        <section className={styles.mapFinalCta} aria-labelledby="map-final-title">
          <div>
            <span className={styles.eyebrow}>Próximo passo</span>
            <h2 id="map-final-title">Quer revisar antes de começar?</h2>
            <p>Revise fundamentos no Aprenda ou vá direto para a Arena com a fase selecionada.</p>
          </div>
          <div className={styles.finalActions}>
            <Button variant="ghost" onClick={() => navigate('/aprenda')}>
              Revisar fundamentos
            </Button>
            <Button variant="primary" onClick={() => navigate('/arena')}>
              Ir para Arena
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
