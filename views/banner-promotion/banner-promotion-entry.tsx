import React from 'react';
import { createRoot } from 'react-dom/client';
import BannerPromotion from './banner-promotion';
import { TolgeeProvider, Tolgee, BackendFetch } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

const root = createRoot(document.getElementById('root'));

import { lazy } from 'react';

const Unauthorized = lazy(() => import('../unauthorized'));
let initialComponent: React.ReactNode = (
    <React.Suspense fallback={null}>
        <Unauthorized />
    </React.Suspense>
);

if (window.AppInitialState?.results?.isSuccessful) {
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
            fallbackLanguage: lang,
            defaultLanguage: lang,
            ns: ['DefaultAnnouncementTemplate'],
            defaultNs: 'DefaultAnnouncementTemplate',
            projectId: '8',
        });

    root.render(
        <TolgeeProvider tolgee={tolgee}>
            <BannerPromotion data={window.AppInitialState} />
        </TolgeeProvider>,
    );
}
else{
  root.render(initialComponent); 
}
