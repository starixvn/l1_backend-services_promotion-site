import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import AnnouncementDetail from './announcement-detail';
import { Tolgee, BackendFetch, TolgeeProvider } from '@tolgee/react';
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

  const params = new URLSearchParams(window.location.search);
  let lang = params.get('language') || 'en';

  lang = lang.toLowerCase();
  if (lang !== 'zh-cn' && lang !== 'zh-tw') {
    lang = lang.split('-')[0];
  }

  const tolgee = Tolgee()
    .use(FormatIcu())
    .use(BackendFetch())
    .init({
      availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw'],
      defaultLanguage: lang,
      language: lang,
      ns: ['DefaultAnnouncementTemplate', ...nsList],
      defaultNs: 'DefaultAnnouncementTemplate',
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