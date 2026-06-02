import type { ReactNode } from 'react';
import { Badge, Panel } from '@/components/ui';
import styles from '../LearnPage.module.css';

interface Benefit {
  title: string;
  text: string;
}

interface Props {
  id: string;
  tag: string;
  title: string;
  text: string;
  children?: ReactNode;
  benefits?: Benefit[];
}

export function LessonModuleCard({ id, tag, title, text, benefits, children }: Props) {
  return (
    <Panel as="section" id={id} className={styles.lessonModule}>
      <div className={styles.moduleTop}>
        <Badge variant="info">{tag}</Badge>
        <Badge variant="warning">+ XP</Badge>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>

      {benefits && (
        <div className={styles.benefitGrid}>
          {benefits.map((benefit) => (
            <article key={benefit.title} className={styles.benefitCard}>
              <strong>{benefit.title}</strong>
              <span>{benefit.text}</span>
            </article>
          ))}
        </div>
      )}

      {children}
    </Panel>
  );
}
