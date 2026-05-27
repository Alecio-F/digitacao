import { PageShell } from '@/components/layout/PageShell';
import { Chip } from '@/components/ui';
import { PandaKeysGame } from './components/PandaKeysGame';
import { SealChallenge } from './components/SealChallenge';
import styles from './ArcadePage.module.css';

export function ArcadePage() {
  return (
    <PageShell title="Arcade do Panda">
      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Arcade do Panda</span>
          <h1 className={styles.heading}>Escolha seu desafio</h1>
          <p className={styles.sub}>
            Minigames para treinar reflexo, precisão e sequência no ritmo do Dojo.
          </p>
        </header>

        <PandaKeysGame />

        <section aria-labelledby="challenges-title">
          <header style={{ marginBottom: 'var(--dojo-space-4)' }}>
            <span className={styles.eyebrow}>Protótipos arcade</span>
            <h2 id="challenges-title" className={styles.heading} style={{ fontSize: '1.1rem' }}>
              Outros desafios
            </h2>
          </header>

          <div className={styles.sideGrid}>
            <SealChallenge />

            <article className={styles.soonCard}>
              <div className={styles.soonHead}>
                <span className={styles.soonIcon}>BC</span>
                <div>
                  <h3 className={styles.soonTitle}>Expedição Bamboo Code</h3>
                </div>
              </div>
              <p className={styles.soonDesc}>
                Resolva obstáculos digitando comandos como &quot;abrir passagem&quot;, &quot;ativar ponte&quot; e &quot;coletar bambu&quot;.
              </p>
              <Chip variant="muted">Em breve</Chip>
            </article>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
