import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import AnnouncementDetail from './announcement-detail';
import { Tolgee, BackendFetch, TolgeeProvider } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import '../../public/static/css/announcement-detail.scss';

const root = createRoot(document.getElementById('root'));

const Unauthorized = lazy(() => import('../unauthorized'));

let initialComponent: React.ReactNode = (
    <React.Suspense fallback={null}>
        <div className="announcement-detail-unauthorized-container">
            <div className="announcement-detail-unauthorized-content">
                <Unauthorized />
            </div>
        </div>
    </React.Suspense>
);

if (window.AppInitialState?.results?.isSuccessful) {
    const gameList = window.AppInitialState?.games || [];
    const nsList = Array.isArray(gameList) ? gameList.map((g) => g.name) : [];

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
                ns: ['FreeSpinBonus', ...nsList],
                defaultNs: 'FreeSpinBonus',
                projectId: '8',
            });

        root.render(
            <TolgeeProvider tolgee={tolgee}>
                <AnnouncementDetail data={window.AppInitialState} />
            </TolgeeProvider>,
        );
    };

    checkLangAndRender();
} else {
    root.render(initialComponent);
}
