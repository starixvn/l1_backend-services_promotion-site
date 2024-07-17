import { BackendFetch, Tolgee, TolgeeProvider } from "@tolgee/react";
import ReactDOM from 'react-dom/client';
import React from 'react';
import { FormatIcu } from "@tolgee/format-icu";
import { InContextTools } from "@tolgee/web/tools";
import Promotions from './promotions/index';
import PromotionDetail from './promotion-details/index';
import LeaderBoard from "./leader-board/index";
import Unauthorized from "./unauthorized";
import LoadingSpinner from "./components/loading-spinner";

const root = ReactDOM.createRoot(document.getElementById('root'));
let initialComponent = <Unauthorized />;

if (window.AppInitialState?.results.isSuccessful) {
  const tolgee = Tolgee()
    .use(FormatIcu())
    .use(BackendFetch())
    .init({
      availableLanguages: ["en", "vi", "th", "id", "zh-cn", "zh-tw"],
      fallbackLanguage: "en",
      defaultLanguage: window.AppInitialState?.lang || "en",
      ns: ["PromotionCampaign"],
      defaultNs: "PromotionCampaign",
      projectId: "5",
    });

  tolgee.addPlugin(
    InContextTools({
      credentials: window.AppInitialState?.tolgeeInContextTools
    })
  );
  const App = () => {
    const [appState, setAppState] = React.useState({
      isShowPromotions: true,
      isShowPromotionDetail: false,
      isShowLeaderBoard: false,
    })

    const handleBackToHome = () => {
      setAppState({
        isShowPromotions: true,
        isShowPromotionDetail: false,
        isShowLeaderBoard: false,
      });
    }

    const handleMoreInfo = () => {
      setAppState({
        isShowPromotions: false,
        isShowPromotionDetail: true,
        isShowLeaderBoard: false,
      });
    }

    const handleLeaderBoard = () => {
      setAppState({
        isShowPromotions: false,
        isShowPromotionDetail: false,
        isShowLeaderBoard: true,
      });
    }

    if (appState.isShowPromotionDetail) {
      return <PromotionDetail handleLeaderBoard={handleLeaderBoard} />;
    }

    if (appState.isShowLeaderBoard) {
      return <LeaderBoard handleBackToHome={handleBackToHome} />;
    }

    return <Promotions handleMoreInfo={handleMoreInfo} />;
  };

  initialComponent = <TolgeeProvider
    tolgee={tolgee}
    fallback={<LoadingSpinner />} // loading fallback
  ><App /></TolgeeProvider >
}


root.render(initialComponent);