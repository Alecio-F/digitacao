import { BrowserRouter, Route, Routes } from 'react-router';
import { Providers } from './providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LearnPage } from '@/pages/LearnPage';
import { DojoMapPage } from '@/pages/DojoMapPage';
import { ArenaPage } from '@/pages/ArenaPage';
import { ArcadePage } from '@/pages/ArcadePage';
import { AccountPage } from '@/pages/AccountPage';
import { RankingPage } from '@/pages/RankingPage';
import { DesignSystemPreview } from '@/pages/DesignSystemPreview';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/aprenda" element={<LearnPage />} />
            <Route path="/mapa" element={<DojoMapPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/arcade" element={<ArcadePage />} />
            <Route path="/conta" element={<AccountPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/design-system" element={<DesignSystemPreview />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
