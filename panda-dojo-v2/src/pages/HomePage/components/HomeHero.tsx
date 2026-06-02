import { useNavigate } from 'react-router';
import { Button, Chip, MetricCard, ProgressBar } from '@/components/ui';
import type { DojoProfile } from '@/features/gamification/types';
import styles from '../HomePage.module.css';

interface Props {
  profile: DojoProfile;
}

export function HomeHero({ profile }: Props) {
  const navigate = useNavigate();

  return (
    <section className={styles.homeHero}>
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>Panda Dojo Arcade</span>
        <h1>Treine digitação como se estivesse evoluindo em um jogo.</h1>
        <p>
          Pratique velocidade, precisão e foco com fases, missões, ranking local
          e minigames.
        </p>
        <div className={styles.heroActions}>
          <Button variant="primary" size="lg" onClick={() => navigate('/arena')}>
            Começar na Arena
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/mapa')}>
            Ver Mapa do Dojo
          </Button>
        </div>
      </div>

      <aside className={styles.heroVisual} aria-label="Resumo do jogador">
        <div className={styles.pandaCard}>
          <img src="/panda-banner.png" alt="Mestre Panda do Dojo Arcade" />
          <div className={styles.pandaStatus}>
            <Chip variant="purple">{profile.title}</Chip>
            <strong>Nível {profile.level}</strong>
            <ProgressBar
              value={profile.progressPercent}
              label="XP do nível"
              showValue
              animated
            />
          </div>
        </div>
        <div className={styles.heroMetrics}>
          <MetricCard label="XP" value={profile.xp} compact tone="special" />
          <MetricCard label="PPM" value={profile.bestPpm || '--'} compact />
          <MetricCard label="Panda Keys" value={profile.gameBestScore || '--'} compact />
        </div>
      </aside>
    </section>
  );
}
