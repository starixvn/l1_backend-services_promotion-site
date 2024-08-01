import '../public/static/css/style.scss';

import { FormatIcu } from '@tolgee/format-icu';
import { BackendFetch, Tolgee, TolgeeProvider } from '@tolgee/react';
import { InContextTools } from '@tolgee/web/tools';
import React from 'react';
import ReactDOM from 'react-dom/client';

import LoadingSpinner from './components/loading-spinner';
import { LanguageMapper } from './constants';
import { ParamsHelper } from './helpers';
import LeaderBoard from './leader-board';
import PromotionDetail from './promotion-details';
import Promotions from './promotions';
import Unauthorized from './unauthorized';

const root = ReactDOM.createRoot(document.getElementById('root'));
let initialComponent = <Unauthorized />;
export const isIframe = window.top != window.self;

if (window.AppInitialState?.results.isSuccessful) {
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

    tolgee.addPlugin(
        InContextTools({
            credentials: window.AppInitialState?.tolgeeInContextTools,
        }),
    );
    const App = () => {
        const [activedPromotionId, setActivedPromotionId] = React.useState(0);
        const [appState, setAppState] = React.useState({
            isShowPromotions: true,
            isShowPromotionDetail: false,
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

        return (
            <>
                {!appState.isShowPromotions && (
                    <div className="top-menu">
                        <div onClick={handleBackButton} className="back-icon"></div>
                    </div>
                )}
                {result}
            </>
        );
    };

    initialComponent = (
        <TolgeeProvider tolgee={tolgee} fallback={<LoadingSpinner />}>
            <App />
        </TolgeeProvider>
    );
}

root.render(initialComponent);
