import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Chip,
  Drawer,
  IconButton,
  MetricCard,
  Panel,
  ProgressBar,
  Toast,
} from '@/components/ui';
import styles from './DesignSystemPreview.module.css';

// Development-only preview. This route can be removed after the visual system is stable.
export function DesignSystemPreview() {
  const [toastOpen, setToastOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Panda Dojo Arcade</span>
          <h1 className={styles.title}>Design System Preview</h1>
          <p className={styles.subtitle}>
            Base visual reutilizável da V2: botões, cards, badges, chips, métricas,
            progresso, toast e drawer genérico.
          </p>
        </div>
        <Button variant="primary" onClick={() => setToastOpen(true)}>
          Mostrar toast
        </Button>
      </header>

      <div className={styles.grid}>
        <Panel title="Buttons" subtitle="Estados principais, secundários, ghost e danger.">
          <div className={styles.row}>
            <Button variant="primary">Comecar treino</Button>
            <Button variant="secondary">Ver mapa</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Resetar</Button>
            <Button variant="primary" size="sm">Pequeno</Button>
            <Button variant="primary" size="lg">Grande</Button>
            <Button variant="primary" disabled>Bloqueado</Button>
          </div>
        </Panel>

        <Panel title="IconButton" subtitle="Botões de ícone com aria-label obrigatório.">
          <div className={styles.row}>
            <IconButton icon="settings" label="Configurações" />
            <IconButton icon="pause_circle" label="Pausar" variant="ghost" />
            <IconButton icon="refresh" label="Reiniciar" variant="primary" />
            <IconButton icon="close" label="Fechar" size="sm" />
          </div>
        </Panel>

        <Panel title="Badges e Chips" subtitle="Status, tags, dificuldade e filtros.">
          <div className={styles.stack}>
            <div className={styles.row}>
              <Badge>Padrão</Badge>
              <Badge variant="success">Concluído</Badge>
              <Badge variant="warning">Prata</Badge>
              <Badge variant="danger">Erro</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="special">Recorde</Badge>
            </div>
            <div className={styles.row}>
              <Chip active>Ativo</Chip>
              <Chip variant="cyan">Foco</Chip>
              <Chip variant="purple">+80 XP</Chip>
              <Chip variant="green">Perfeito</Chip>
              <Chip variant="yellow">Médio</Chip>
              <Chip variant="danger">Sem pausa</Chip>
            </div>
          </div>
        </Panel>

        <Panel title="ProgressBar" subtitle="Com ARIA e valores limitados.">
          <div className={styles.stack}>
            <ProgressBar label="XP" value={72} showValue animated />
            <ProgressBar label="Missão" value={30} tone="success" showValue />
            <ProgressBar label="Especial" value={100} tone="special" size="lg" showValue animated />
          </div>
        </Panel>

        <Panel className={styles.wide} title="MetricCard" subtitle="HUD de resultados e progresso.">
          <div className={styles.metrics}>
            <MetricCard label="PPM" value={68} tone="special" helper="Melhor hoje" />
            <MetricCard label="Precisão" value="94%" tone="success" />
            <MetricCard label="Erros" value={3} tone="danger" />
            <MetricCard label="Combo" value="12x" compact />
          </div>
        </Panel>

        <Panel className={styles.wide} title="Cards" subtitle="Default, interativo, HUD e bloqueado.">
          <div className={styles.cards}>
            <Card>
              <strong className={styles.cardTitle}>Teclas Base</strong>
              <p className={styles.cardText}>Card padrão para conteúdo simples.</p>
            </Card>
            <Card variant="interactive" as="article">
              <strong className={styles.cardTitle}>Desafio Diário</strong>
              <p className={styles.cardText}>Hover suave com glow e elevação.</p>
            </Card>
            <Card variant="locked">
              <strong className={styles.cardTitle}>Fase bloqueada</strong>
              <p className={styles.cardText}>Estado visual sem depender apenas de cor.</p>
            </Card>
          </div>
        </Panel>

        <Panel className={styles.wide} title="Drawer genérico" subtitle="ESC, backdrop e scroll lock.">
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Abrir drawer
          </Button>
        </Panel>
      </div>

      <Toast
        open={toastOpen}
        title="Missão concluída"
        message="Você recebeu +50 XP local."
        tone="success"
        autoCloseMs={3200}
        onClose={() => setToastOpen(false)}
      />

      <Drawer
        open={drawerOpen}
        title="Drawer genérico"
        description="Componente base para painéis laterais da V2."
        onClose={() => setDrawerOpen(false)}
      >
        <div className={styles.stack}>
          <MetricCard label="XP" value="1 240" tone="special" />
          <ProgressBar label="Progresso" value={56} showValue animated />
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            Fechar painel
          </Button>
        </div>
      </Drawer>
    </main>
  );
}
