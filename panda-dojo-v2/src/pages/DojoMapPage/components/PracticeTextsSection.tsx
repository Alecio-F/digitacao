import { PRACTICE_TEXTS } from '@/features/practiceTexts/data/practiceTexts';
import { PracticeTextCard } from './PracticeTextCard';
import styles from '../DojoMapPage.module.css';

export function PracticeTextsSection() {
  return (
    <section className={styles.practiceTextsSection} aria-labelledby="practice-texts-title">
      <div className={styles.practiceTextsHeader}>
        <div>
          <span className={styles.eyebrow}>Prática livre</span>
          <h2 id="practice-texts-title">Textos para Praticar</h2>
          <p>
            Escolha um texto livre para treinar fluidez, ritmo e precisão sem depender das fases do
            Dojo.
          </p>
        </div>
        <p className={styles.practiceTextsNote}>
          Use as fases para evoluir passo a passo. Use os textos livres para treinar fluidez quando
          quiser praticar sem seguir a trilha.
        </p>
      </div>

      <div className={styles.practiceTextsGrid}>
        {PRACTICE_TEXTS.map((text) => (
          <PracticeTextCard key={text.id} text={text} />
        ))}
      </div>
    </section>
  );
}
