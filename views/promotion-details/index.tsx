import React, { useEffect, useState } from 'react';
import '../helpers/string-helper';
import '../../public/static/css/style.scss';
import { PromotionDetailViewModelFake } from 'src/features/promotion-configs/models/promotion-configs-response-fake';
import { convertToGMT8, formatDate } from '../helpers/time-helper';
import { useTranslate } from "@tolgee/react";
import LoadingSpinner from '../components/loading-spinner';
import { GameUtils, ParamsHelper } from '../helpers';
import Prize from './prize';


const PromotionDetail = ({ handleLeaderBoard, promotionId }) => {
  const { sessionId, username } = ParamsHelper.getParams();
  const [promotionDetail, setPromotionDetail] = useState<PromotionDetailViewModelFake>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslate();

  useEffect(() => {
    // fetch(`promotion-config/${promotionId}`, {
    fetch(`promotions/getPromotionDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: GameUtils.base64Decode(sessionId),
        username,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(promotionDetail => {
        setPromotionDetail(promotionDetail.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;


  const template = "dd/MM/yyyy";
  const startdate = formatDate(convertToGMT8(new Date(promotionDetail.startDateTime)), template);
  const enddate = formatDate(convertToGMT8(new Date(promotionDetail.endDateTime)), template);

  const promotionInformation = [
    {
      header: t('duration'),
      description: t("take_place_from", { startdate, enddate }).replaceTolgeeFormat()
    },
    {
      header: t('eligible_games'),
      description: t('all_games')
    },
    {
      header: t('total_prize'),
      description: "USD $2000"
    }
  ]

  const participantSteps = [
    {
      header: t('step1'),
      description: t('step1_para_1', {
        minstakeforslotgame: promotionDetail.slotGameMinBet,
        minstakeforothers: promotionDetail.otherGameMinBet
      }).replaceTolgeeFormat()
    },
    {
      header: t('step2'),
      description: t('step2_para_1')
    },
    {
      header: t('step3'),
      description: t('step3_para_1', { counttotalprize: promotionDetail.countTotalPrize }).replaceTolgeeFormat()
    }
  ]

  return (
    <div>
      <div className="tournament-container">
        <h2 className="text-center">{promotionDetail.title}</h2>
        <p className="text-center">{t("promotion_header", { prizevalue1: promotionDetail.totalPrize }).replaceTolgeeFormat()}</p>

        <div className="info-container promotion">
          <h3 className="title">{t('title_promotion_info')}</h3>
          <div className="info-list">
            {
              promotionInformation.map((infomation, index) => {
                return <div className="info-item" key={index}>
                  <h3>{infomation.header}</h3>
                  <p>{infomation.description}</p>
                </div>
              })
            }
          </div>
        </div>

        <div className="info-container participation">
          <h3 className="title">{t('title_participant_steps')}</h3>
          <div className="info-list">
            {
              participantSteps.map((step, index) => {
                return <div className="info-item" key={index}>
                  <h3>{step.header}</h3>
                  <p>{step.description}</p>
                </div>
              })
            }
          </div>
        </div>

        <div className="info-container prize">
          <h3 className="title">{t('title_prize_categories')}</h3>
          <div className="prize-container ">
            {
              promotionDetail.winningPrizes.map((prize, index) => <Prize key={index} prize={prize} />)
            }
          </div>
        </div>

        <div className="terms-conditions">
          <h3 className="title">{t('title_terms_conditions')}</h3>
          <ul>
            {
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
                const key = `terms_conditions_para_${item}`
                return <li key={key}>{item === 6 ?
                  t(key, { counttotalprize: promotionDetail.countTotalPrize }).replaceTolgeeFormat() :
                  t(key)}
                </li>
              })
            }
          </ul>
        </div>
        <div className='leader-board '>
          <button className="btn btn-primary" onClick={handleLeaderBoard}>{t('leaderboard')}</button>
        </div>
      </div>
    </div>
  );
};


export default PromotionDetail;