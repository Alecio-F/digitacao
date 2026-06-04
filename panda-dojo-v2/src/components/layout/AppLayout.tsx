import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { BackgroundCanvas } from './BackgroundCanvas';
import { BambooLeaves } from './BambooLeaves';
import { HeaderHud } from './HeaderHud';
import { MobileBottomNav } from './MobileBottomNav';
import { SettingsDrawer } from './SettingsDrawer';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const focusRoute = location.pathname === '/arena';

  return (
    <div className={[styles.root, focusRoute ? styles.focusRoot : ''].filter(Boolean).join(' ')}>
      <BackgroundCanvas />
      <BambooLeaves />

      <div className={styles.content}>
        <HeaderHud onSettingsOpen={() => setDrawerOpen(true)} isSettingsOpen={drawerOpen} />
        <main className={styles.appMain}>
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        {!focusRoute && <footer>© 2025 PandaDigitações.</footer>}
        <MobileBottomNav />
      </div>

      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
