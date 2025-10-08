import React from 'react';
import { createRoot } from 'react-dom/client';
import BannerPromotion from './banner-promotion';
import { TolgeeProvider, Tolgee, BackendFetch } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { lazy } from 'react';
import '../../public/static/css/banner-promotion.scss';

const root = createRoot(document.getElementById('root'));

const Unauthorized = lazy(() => import('../unauthorized'));

let initialComponent: React.ReactNode = (
    <React.Suspense fallback={null}>
        <div className="banner-promotion-unauthorized-container">
            <div className="banner-promotion-unauthorized-content">
                <Unauthorized />
            </div>
        </div>
    </React.Suspense>
);

if (window.AppInitialState?.results?.isSuccessful) {
    const params = new URLSearchParams(window.location.search);
    let lang = params.get('language') || 'en';

    lang = lang.toLowerCase();
    if (lang !== 'zh-cn' && lang !== 'zh-tw') {
        lang = lang.split('-')[0];
    }

    // Check if lang file exists, fallback to 'en' if not
    const checkLangAndRender = async () => {
        const url = `/i18n/FreeSpinBonus/${lang}.json`;
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (!res.ok) lang = 'en';
        } catch {
            lang = 'en';
        }

        const tolgee = Tolgee()
            .use(FormatIcu())
            .use(BackendFetch())
            .init({
                availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw', 'ja', 'es'],
                fallbackLanguage: 'en',
                defaultLanguage: 'en',
                language: lang,
                ns: ['FreeSpinBonus'],
                defaultNs: 'FreeSpinBonus',
                projectId: '8',
            });

        root.render(
            <TolgeeProvider tolgee={tolgee}>
                <BannerPromotion data={window.AppInitialState} />
            </TolgeeProvider>,
        );
    };

    checkLangAndRender();
} else {
    root.render(initialComponent);
}
