import { Button, Chip, ProgressBar } from '@/components/ui';
import { useNavigate } from 'react-router';
import styles from './MentorHero.module.css';

export function MentorHero() {
  const navigate = useNavigate();

  return (
    <section className={styles.hero} aria-labelledby="learn-title">
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Tutorial do Dojo</span>
        <h1 id="learn-title" className={styles.heading}>Aprenda com o Mestre Panda.</h1>
        <p className={styles.sub}>
          Domine os fundamentos da digitação com missões rápidas: postura, posição dos dedos, ritmo e foco.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => document.getElementById('modulo-01')?.scrollIntoView({ behavior: 'smooth' })}>
            Começar fundamentos
          </Button>
          <Button variant="secondary" onClick={() => navigate('/arena')}>
            Ir para Arena
          </Button>
        </div>
        <div className={styles.chips} aria-label="Informações da missão">
          <Chip variant="special">+50 XP recompensa</Chip>
          <Chip variant="muted">Nível iniciante</Chip>
          <Chip variant="muted">5 min de leitura</Chip>
          <Chip variant="success">Habilidade: precisão</Chip>
        </div>
      </div>

      <aside className={styles.mentorCard} aria-label="Mentor Panda">
        <div className={styles.mentorHeader}>
          <div>
            <span className={styles.eyebrow}>Mentor Panda</span>
            <h2 className={styles.mentorTitle}>Mestre Panda</h2>
          </div>
          <span className={styles.rewardBadge}>+50 XP</span>
        </div>
        <p className={styles.mentorDesc}>Complete os fundamentos para liberar treinos melhores no mapa do dojo.</p>
        <div className={styles.pandaEmoji} aria-hidden="true">🐼</div>
        <div className={styles.lessonProgress}>
          <div className={styles.progressHeader}>
            <span>Progresso dos fundamentos</span>
            <strong>1/3 módulos</strong>
          </div>
          <ProgressBar value={33} aria-label="Progresso: 1 de 3 módulos" animated />
        </div>
      </aside>
    </section>
  );
}
