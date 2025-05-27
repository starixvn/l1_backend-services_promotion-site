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
    const tolgee = Tolgee()
        .use(FormatIcu())
        .use(BackendFetch())
        .init({
            availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw'],
            fallbackLanguage: 'en',
            defaultLanguage: 'en',
            ns: ['PromotionCampaign'],
            defaultNs: 'PromotionCampaign',
            projectId: '5',
        });

    root.render(
        <TolgeeProvider tolgee={tolgee}>
            <BannerPromotion />
        </TolgeeProvider>,
    );
}
else{
  root.render(initialComponent); 
}
