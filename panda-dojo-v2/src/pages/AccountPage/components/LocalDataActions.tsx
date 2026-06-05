import { Button, Card } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

export function LocalDataActions({ profile }: Props) {
  function handleExport() {
    const snapshot = profile.exportData();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pandadigitacoes-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    const confirmed = window.confirm(
      'Tem certeza que deseja limpar seu progresso local? Esta ação não pode ser desfeita. Suas configurações (tema, sons) serão mantidas.',
    );
    if (!confirmed) return;
    profile.clearLocalProgress();
    window.location.reload();
  }

  return (
    <Card as="section" className={styles.dataActions} aria-labelledby="data-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Dados locais</span>
        <h2 id="data-title" className={styles.panelTitle}>Dados locais</h2>
      </header>

      <p className={styles.mutedText}>
        Gerencie os dados salvos neste navegador. Mesmo com conta online, seus dados locais
        continuam servindo como backup rápido deste dispositivo.
      </p>

      <div className={styles.dataButtons}>
        <Button variant="secondary" onClick={handleExport}>
          Exportar dados locais
        </Button>
        <Button variant="danger" onClick={handleClear}>
          Limpar progresso local
        </Button>
      </div>
    </Card>
  );
}
