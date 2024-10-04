import '../public/static/css/style.scss';

import { FormatIcu } from '@tolgee/format-icu';
import { BackendFetch, Tolgee, TolgeeProvider } from '@tolgee/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import CloseButton from './components/close-button';
import { AppTypes, LanguageMapper } from './constants';
import { isAppType, ParamsHelper } from './helpers';

const Promotions = React.lazy(() => import('./promotions'));
const PromotionDetail = React.lazy(() => import('./promotion-details'));
const LeaderBoard = React.lazy(() => import('./leader-board'));
const Unauthorized = React.lazy(() => import('./unauthorized'));

const root = ReactDOM.createRoot(document.getElementById('root'));
let initialComponent = <Unauthorized />;
const tolgee = Tolgee()
    .use(FormatIcu())
    .use(BackendFetch())
    .init({
        availableLanguages: ['en', 'vi', 'th', 'id', 'zh-cn', 'zh-tw'],
        fallbackLanguage: 'en',
        defaultLanguage: LanguageMapper[ParamsHelper.getParams().language] || 'en' || ParamsHelper.getParams().language || 'en',
        ns: ['PromotionCampaign'],
        defaultNs: 'PromotionCampaign',
        projectId: '5',
    });
if (window.AppInitialState?.results.isSuccessful) {

    const App = () => {
        const [activedPromotionId, setActivedPromotionId] = React.useState(window.AppInitialState?.promotionDetailEntryId ?? 0);
        const isRediectToPromotionDetailPage = activedPromotionId > 0;
        const [appState, setAppState] = React.useState({
            isShowPromotions: !isRediectToPromotionDetailPage,
            isShowPromotionDetail: isRediectToPromotionDetailPage,
            isShowLeaderBoard: false,
        });

        const handleBackButton = () => {
            if (appState.isShowLeaderBoard) {
                setAppState({
                    isShowPromotions: false,
                    isShowPromotionDetail: true,
                    isShowLeaderBoard: false,
                });
            } else {
                setAppState({
                    isShowPromotions: true,
                    isShowPromotionDetail: false,
                    isShowLeaderBoard: false,
                });
            }
        };

        const handleMoreInfo = (promotionId: number) => {
            setActivedPromotionId(promotionId);
            setAppState({
                isShowPromotions: false,
                isShowPromotionDetail: true,
                isShowLeaderBoard: false,
            });
        };

        const handleLeaderBoard = () => {
            setAppState({
                isShowPromotions: false,
                isShowPromotionDetail: false,
                isShowLeaderBoard: true,
            });
        };

        let result = <Promotions handleMoreInfo={handleMoreInfo} />;

        if (appState.isShowPromotionDetail) {
            result = <PromotionDetail handleLeaderBoard={handleLeaderBoard} promotionId={activedPromotionId} />;
        }

        if (appState.isShowLeaderBoard) {
            result = <LeaderBoard promotionId={activedPromotionId} />;
        }

        const loadBackIcon = () => {
            return <div onClick={handleBackButton} className="back-icon"></div>;
        };

        const showHeader = () => {
            if (isAppType(AppTypes.MiniSabaClub)) {
                return (
                    <div className="header">
                        {!appState.isShowPromotions && loadBackIcon()}
                        <img src={`static/images/logo.webp`} width="221" height="58" alt="Logo" className="logo" />
                    </div>
                );
            } else {
                if (!appState.isShowPromotions) {
                    return (
                        <div className="header">
                            <CloseButton />
                            {loadBackIcon()}
                        </div>
                    );
                }
            }
        };

        return (
            <>
                {showHeader()}
                {result}
            </>
        );
    };

    initialComponent = (
        <TolgeeProvider tolgee={tolgee}>
            <App />
        </TolgeeProvider>
    );
}

root.render(initialComponent);
