import { useState } from 'react';
import { Badge, Button, Card, Chip, IconButton, MetricCard, Panel, ProgressBar } from '@/components/ui';
import styles from './DevPage.module.css';

export function DevPage() {
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panda Dojo — Design System</h1>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {dark ? 'Light' : 'Dark'} mode
        </Button>
      </header>

      <section className={styles.section}>
        <h2>Button</h2>
        <div className={styles.row}>
          <Button variant="primary">Treinar agora</Button>
          <Button variant="secondary">Ver mapa</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary" size="sm">SM</Button>
          <Button variant="primary" size="lg">LG</Button>
          <Button variant="primary" disabled>Bloqueado</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>IconButton</h2>
        <div className={styles.row}>
          <IconButton icon="settings" label="Configurações" />
          <IconButton icon="pause_circle" label="Pausar" />
          <IconButton icon="settings" label="Configurações ativo" active />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Badge</h2>
        <div className={styles.row}>
          <Badge variant="success">Ouro</Badge>
          <Badge variant="warning">Prata</Badge>
          <Badge variant="danger">Erro</Badge>
          <Badge variant="muted">Bronze</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Chip</h2>
        <div className={styles.row}>
          <Chip variant="special">Missão concluída +80 XP</Chip>
          <Chip variant="success">Recorde!</Chip>
          <Chip variant="danger">Sem pausa</Chip>
          <Chip variant="muted">Nível 4</Chip>
        </div>
      </section>

      <section className={styles.section}>
        <h2>ProgressBar</h2>
        <div className={styles.stack}>
          <ProgressBar value={72} aria-label="XP atual" animated />
          <ProgressBar value={30} aria-label="Progresso lição" />
          <ProgressBar value={100} aria-label="Completo" animated />
        </div>
      </section>

      <section className={styles.section}>
        <h2>MetricCard</h2>
        <div className={styles.row}>
          <MetricCard label="PPM" value={68} highlight />
          <MetricCard label="Precisão" value="94%" />
          <MetricCard label="Erros" value={3} />
          <MetricCard label="Combo" value="12×" highlight />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Card</h2>
        <div className={styles.row}>
          <Card style={{ width: 200 }}>
            <strong>Teclas Base</strong>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Desbloqueado</p>
          </Card>
          <Card locked style={{ width: 200 }}>
            <strong>Letras Especiais</strong>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Bloqueado</p>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Panel</h2>
        <Panel style={{ maxWidth: 360 }}>
          <MetricCard label="XP Total" value="1 240" highlight />
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={56} aria-label="XP para próximo nível" animated />
          </div>
        </Panel>
      </section>
    </div>
  );
}
