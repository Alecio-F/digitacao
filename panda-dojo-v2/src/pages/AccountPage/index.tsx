import { useNavigate } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { useDailyMissions } from '@/features/missions/hooks/useDailyMissions';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const profile = usePlayerProgress();
  const missions = useDailyMissions();
  const navigate = useNavigate();
  const completedMissions = missions.filter((mission) => mission.completed).length;

  return (
    <PageShell title="Conta">
      <section className={`dojo-section ${styles.hero}`}>
        <div className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            <img src="/mentor-panda.png" alt="" className={styles.avatar} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.eyebrow}>Conta local</span>
            <h1 className={styles.heading}>Mestre Panda</h1>
            <p className={styles.sub}>
              Seu progresso fica salvo neste navegador. Login, ranking global e sincronizaÃ§Ã£o ficam preparados para uma etapa futura.
            </p>
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={() => navigate('/arena')}>Continuar treino</button>
              <button className={styles.secondaryBtn} onClick={() => navigate('/mapa')}>Ver mapa</button>
            </div>
          </div>
        </div>
      </section>

      <section className="dojo-section">
        <div className={styles.grid}>
          <article className={styles.panel}>
            <span className={styles.eyebrow}>Progresso</span>
            <h2 className={styles.panelTitle}>{profile.title}</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span>NÃ­vel</span>
                <strong>{profile.level}</strong>
              </div>
              <div className={styles.statBox}>
                <span>XP</span>
                <strong>{profile.xp}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Melhor PPM</span>
                <strong>{profile.bestPpm || '--'}</strong>
              </div>
              <div className={styles.statBox}>
                <span>MissÃµes hoje</span>
                <strong>{completedMissions}/{missions.length}</strong>
              </div>
            </div>
            <div className={styles.progressBar}>
              <span style={{ width: `${profile.progressPercent}%` }} />
            </div>
            <p className={styles.mutedText}>
              {profile.currentLevelXp}/{profile.requiredForLevel} XP para {profile.nextTitle}.
            </p>
          </article>

          <article className={styles.panel}>
            <span className={styles.eyebrow}>Recursos futuros</span>
            <h2 className={styles.panelTitle}>Conta em preparaÃ§Ã£o</h2>
            <ul className={styles.featureList}>
              <li>Login real e sincronizaÃ§Ã£o entre dispositivos.</li>
              <li>Ranking global com temporadas.</li>
              <li>Backup online de histÃ³rico, XP e medalhas.</li>
              <li>Perfil pÃºblico do Dojo.</li>
            </ul>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
