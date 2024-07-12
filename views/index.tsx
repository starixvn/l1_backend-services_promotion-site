import { BackendFetch, Tolgee, TolgeeProvider } from "@tolgee/react";
import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FormatIcu } from "@tolgee/format-icu";
import { InContextTools } from "@tolgee/web/tools";
import Promotions from './promotions/index';
import PromotionDetail from './promotion-details/index';
import LeaderBoard from "./leader-board/index";

const tolgee = Tolgee()
  .use(FormatIcu())
  .use(BackendFetch())
  .init({
    availableLanguages: ["en", "vi", "th", "id", "zh-cn", "zh-tw"],
    fallbackLanguage: "en",
    defaultLanguage: "en",
    ns: ["FootballSlot", "Common"],
    defaultNs: "FootballSlot",
  });

// if (!appSettings.useTolgeeStatic) {
tolgee.addPlugin(
  InContextTools({
    credentials: {
      apiUrl: "https://tolgee.sabagame.com/",
      apiKey: "tgpak_gjpxe3jsoe2xgy3lgezgiolwoy4gy5twgrtwqz3pgrtwq",
      projectId: "2",
    },
  })
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Promotions />} />
        <Route path="/promotion-details" element={<PromotionDetail />} />
        <Route path="/leader-board" element={<LeaderBoard />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TolgeeProvider
  tolgee={tolgee}
  fallback="Loading..." // loading fallback
><App /></TolgeeProvider >);
