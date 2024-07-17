import { useTranslate } from "@tolgee/react";
import React, { useEffect, useState } from 'react';
import { PromotionDetailViewModelFake } from 'src/features/promotion-configs/models/promotion-configs-response-fake';
import '../../public/static/css/style.scss';
import LoadingSpinner from '../components/loading-spinner';
import { GameUtils, ParamsHelper } from '../helpers';
import '../helpers/string-helper';
import { convertToGMT8, formatDate } from '../helpers/time-helper';

const PromotionDetail = ({ handleLeaderBoard, promotionId }) => {
  const { sessionId, username } = ParamsHelper.getParams();
  const [promotionDetail, setPromotionDetail] = useState<PromotionDetailViewModelFake>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslate();

  useEffect(() => {
    fetch(`promotions/${promotionId}`, {
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

  return (
    <div>
      <div className="tournament-container">
        <h2 className="text-center">{promotionDetail.title}</h2>
        <p className="text-center">{t("promotion_header", { prizevalue1: promotionDetail.totalPrize }).replaceTolgeeFormat()}</p>

        <div className="info-container promotion">
          <h3 className="title">{t('title_promotion_info')}</h3>
          <div className="info-list">
            <div className="info-item">
              <h3>{t('duration')}</h3>
              <p>{t("take_place_from", { startdate, enddate }).replaceTolgeeFormat()}</p>
            </div>
            <div className="info-item">
              <h3>{t('eligible_games')}</h3>
              <p>{t('all_games')}</p>
            </div>
            <div className="info-item">
              <h3>{t('total_prize')}</h3>
              <p>USD $2000</p>
            </div>
          </div>
        </div>

        <div className="info-container participation">
          <h3 className="title">{t('title_participant_steps')}</h3>
          <div className="info-list">
            <div className="info-item">
              <h3>{t('step1')}</h3>
              <p>{t("step1_para_1", { minstakeforslotgame: promotionDetail.slotGameMinBet, minstakeforothers: promotionDetail.otherGameMinBet }).replaceTolgeeFormat()}</p>
            </div>
            <div className="info-item">
              <h3>{t('step2')}</h3>
              <p>{t('step2_para_1')}</p>
            </div>
            <div className="info-item">
              <h3>{t('step3')}</h3>
              <p>{t("step3_para_1", { counttotalprize: promotionDetail.countTotalPrize }).replaceTolgeeFormat()}</p>
            </div>
          </div>
        </div>

        <div className="info-container prize">
          <h3 className="title">{t('title_prize_categories')}</h3>
          <div className="info-list">
            <div className="info-item">
              <img src="static/images/first-prize.png" alt="Prize 1" />
              <div>
                <h3>{t('first_place')}</h3>
                <p>$1000</p>
              </div>
            </div>
            <div className="info-item">
              <img src="static/images/second-prize.png" alt="Prize 2" />
              <div>
                <h3>{t('second_place')}</h3>
                <p>$600</p>
              </div>
            </div>
            <div className="info-item">
              <img src="static/images/third-prize.png" alt="Prize 3" />
              <div>
                <h3>{t('third_place')}</h3>
                <p>$400</p>
              </div>
            </div>
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