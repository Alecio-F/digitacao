import { Link } from 'react-router';
import styles from '../LearnPage.module.css';

export function LearnFinalCta() {
  return (
    <section className={styles.learnFinalCta} aria-labelledby="learn-final-title">
      <span className={styles.eyebrow}>Missão concluída</span>
      <h2 id="learn-final-title">Pronto para testar o que aprendeu?</h2>
      <p>
        Agora que você conhece os fundamentos, entre na arena e transforme postura,
        ritmo e precisão em resultado real.
      </p>
      <div className={styles.finalActions}>
        <Link className={styles.primaryLink} to="/arena">
          Ir para Arena
        </Link>
        <Link className={styles.secondaryLink} to="/mapa">
          Abrir Mapa do Dojo
        </Link>
      </div>
    </section>
  );
}
