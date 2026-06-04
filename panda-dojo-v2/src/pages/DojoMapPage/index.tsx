import { useNavigate } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui';
import { useLessonProgress } from '@/features/lessons/hooks/useLessonProgress';
import type { Lesson } from '@/features/lessons/types';
import { DailyChallengeMapCard } from './components/DailyChallengeMapCard';
import { DojoMapHero } from './components/DojoMapHero';
import { LessonTrail } from './components/LessonTrail';
import { PlayerMapCard } from './components/PlayerMapCard';
import { PracticeTextsSection } from './components/PracticeTextsSection';
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

        <DailyChallengeMapCard />

        <section className={styles.mapOverviewGrid} aria-label="Resumo do mapa">
          <PlayerMapCard progress={progress} />
          <RecommendedLessonPanel
            lesson={recommendedLesson}
            onStart={handleStart}
            onArena={() => navigate('/arena')}
          />
        </section>

        <section className={styles.progressRules} aria-labelledby="map-rules-title">
          <span className={styles.eyebrow}>Regra local</span>
          <h2 id="map-rules-title">Como desbloquear a próxima fase</h2>
          <p>
            Inicie uma fase pelo Mapa e conclua a rodada na Type Arena. Quando o resultado local
            atingir pelo menos 85% de precisão, a fase pode registrar conclusão, medalha e XP. O
            tempo usado vem das preferências locais do navegador.
          </p>
        </section>

        <LessonTrail
          lessons={lessons}
          progress={progress}
          getStatus={getStatus}
          onStart={handleStart}
        />

        <PracticeTextsSection />

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
