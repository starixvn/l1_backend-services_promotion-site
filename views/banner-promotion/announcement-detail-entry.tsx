import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import AnnouncementDetail from './announcement-detail';
import { Tolgee, BackendFetch, TolgeeProvider } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

const root = createRoot(document.getElementById('root'));

const Unauthorized = lazy(() => import('../unauthorized'));
let initialComponent: React.ReactNode = (
    <React.Suspense fallback={null}>
        <div
            style={{
                minHeight: '98vh',
                background: 'linear-gradient(120deg, #222 60%, #6a1b9a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    color: '#fff',
                    borderRadius: 12,
                    padding: 32,
                    maxWidth: 800,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Unauthorized />
            </div>
        </div>
    </React.Suspense>
);

if (window.AppInitialState?.results?.isSuccessful) {
    const gameList = window.AppInitialState?.game || [];
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
                availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw'],
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
