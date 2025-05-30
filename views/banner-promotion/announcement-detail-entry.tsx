import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import AnnouncementDetail from './announcement-detail';
import { TolgeeProvider, Tolgee, BackendFetch } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

const root = createRoot(document.getElementById('root'));

const Unauthorized = lazy(() => import('../unauthorized'));
let initialComponent: React.ReactNode = (
  <React.Suspense fallback={null}>
    <Unauthorized />
  </React.Suspense>
);

if (window.AppInitialState?.results?.isSuccessful) {
  const gameList = window.AppInitialState?.game || [];
  const nsList = Array.isArray(gameList) ? gameList.map(g => g.name) : [];
  const defaultNs = nsList.length > 0 ? nsList[0] : undefined;

  const tolgee = Tolgee()
    .use(FormatIcu())
    .use(BackendFetch())
    .init({
      availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw'],
      fallbackLanguage: 'en',
      defaultLanguage: 'en',
      ns: nsList,
      defaultNs,
      projectId: '8',
    });

  root.render(
    <TolgeeProvider tolgee={tolgee}>
      <AnnouncementDetail data={window.AppInitialState} />
    </TolgeeProvider>
  );
} else {
  root.render(initialComponent);
} 