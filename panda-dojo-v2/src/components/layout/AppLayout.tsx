import { useState } from 'react';
import { Outlet } from 'react-router';
import { BackgroundCanvas } from './BackgroundCanvas';
import { BambooLeaves } from './BambooLeaves';
import { HeaderHud } from './HeaderHud';
import { MobileBottomNav } from './MobileBottomNav';
import { SettingsDrawer } from './SettingsDrawer';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.root}>
      <BackgroundCanvas />
      <BambooLeaves />

      <div className={styles.content}>
        <HeaderHud onSettingsOpen={() => setDrawerOpen(true)} isSettingsOpen={drawerOpen} />
        <main className={styles.appMain}>
          <Outlet />
        </main>
        <footer>© 2025 PandaDigitações.</footer>
        <MobileBottomNav />
      </div>

      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
