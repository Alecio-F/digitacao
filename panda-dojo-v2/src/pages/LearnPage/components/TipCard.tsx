import styles from './TipCard.module.css';

export interface Tip {
  icon: string;
  title: string;
  text: string;
}

interface Props {
  tip: Tip;
  visible: boolean;
}

export function TipCard({ tip, visible }: Props) {
  return (
    <article className={[styles.card, visible ? styles.visible : styles.hidden].join(' ')} aria-hidden={!visible}>
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">{tip.icon}</span>
      <h3 className={styles.title}>{tip.title}</h3>
      <p className={styles.text}>{tip.text}</p>
    </article>
  );
}
