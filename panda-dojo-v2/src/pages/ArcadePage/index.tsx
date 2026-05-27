import { PageShell } from '@/components/layout/PageShell';
import { Chip } from '@/components/ui';
import { PandaKeysGame } from './components/PandaKeysGame';
import { SealChallenge } from './components/SealChallenge';
import styles from './ArcadePage.module.css';

export function ArcadePage() {
  return (
    <PageShell title="Arcade do Panda">

      {/* Hero */}
      <section className={`dojo-section ${styles.hero}`}>
        <span className={styles.eyebrow}>Arcade do Panda</span>
        <h1 className={styles.heading}>Escolha seu desafio</h1>
        <p className={styles.sub}>
          Minigames para treinar reflexo, precisão e sequência no ritmo do Dojo.
        </p>
      </section>

      {/* Main game */}
      <section className={`dojo-section ${styles.gameSection}`}>
        <div className={styles.gameLabel}>
          <span className={styles.gameLabelChip}>Jogo principal</span>
          <span className={styles.gameLabelText}>Panda Keys</span>
        </div>
        <PandaKeysGame />
      </section>

      {/* Other challenges */}
      <section className={`dojo-section ${styles.sideSection}`} aria-labelledby="challenges-title">
        <header className={styles.sideHeader}>
          <span className={styles.eyebrow}>Protótipos arcade</span>
          <h2 id="challenges-title" className={styles.subHeading}>Outros desafios</h2>
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

    </PageShell>
  );
}
