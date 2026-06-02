import { Link } from 'react-router';
import { Chip, ProgressBar } from '@/components/ui';
import styles from '../LearnPage.module.css';

export function LearnHero() {
  return (
    <section className={styles.learnHero} aria-labelledby="learn-title">
      <div className={styles.learnHeroContent}>
        <span className={styles.eyebrow}>Tutorial do Dojo</span>
        <h1 id="learn-title">Aprenda com o Mestre Panda.</h1>
        <p>
          Domine postura, dedos e ritmo para evoluir sua digitação com mais precisão.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryLink} href="#fundamentos">
            Começar fundamentos
          </a>
          <Link className={styles.secondaryLink} to="/arena">
            Ir para Arena
          </Link>
        </div>
        <div className={styles.chipRow} aria-label="Informações do tutorial">
          <Chip variant="purple">+50 XP</Chip>
          <Chip>Nível iniciante</Chip>
          <Chip>5 min</Chip>
          <Chip variant="green">Precisão</Chip>
        </div>
      </div>

      <aside className={styles.learnHeroVisual} aria-label="Cartão do Mestre Panda">
        <div className={styles.masterCard}>
          <div className={styles.masterHeader}>
            <div>
              <span className={styles.eyebrow}>Mentor Panda</span>
              <strong>Mestre Panda</strong>
            </div>
            <Chip variant="yellow">Tutorial</Chip>
          </div>
          <img src="/mentor-panda.png" alt="Mestre Panda" />
          <p>
            Complete os fundamentos para desbloquear treinos com mais controle no Dojo.
          </p>
          <ProgressBar label="Fundamentos" value={33} showValue animated />
        </div>
      </aside>
    </section>
  );
}
