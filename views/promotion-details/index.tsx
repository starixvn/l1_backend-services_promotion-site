import React from 'react';
import { useTranslator } from '../hooks/use-translator';
import '../helpers/string-helper';
import '../../public/static/css/style.scss';

const PromotionDetail = ({ handleLeaderBoard }) => {
  const { t } = useTranslator();

  return (
    <div>
      <div className="tournament-container">
        <h2 className="text-center">Weekly Tournament</h2>
        <p className="text-center">{t("promotion_header", { prizevalue1: 404 }).replaceTolgeeFormat()}</p>

        <div className="info-container promotion">
          <h3 className="title">{t('title_promotion_info')}</h3>
          <div className="info-list">
            <div className="info-item">
              <h3>{t('duration')}</h3>
              <p>{t("take_place_from", { startdate: 404, enddate: 404 }).replaceTolgeeFormat()}</p>
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
              <p>{t("step1_para_1", { minstakeforslotgame: 404, minstakeforothers: 404 }).replaceTolgeeFormat()}</p>
            </div>
            <div className="info-item">
              <h3>{t('step2')}</h3>
              <p>{t('step2_para_1')}</p>
            </div>
            <div className="info-item">
              <h3>{t('step3')}</h3>
              <p>{t("step3_para_1", { counttotalprize: 404 }).replaceTolgeeFormat()}</p>
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
            <li>{t('terms_conditions_para_1')}</li>
            <li>{t('terms_conditions_para_2')}</li>
            <li>{t('terms_conditions_para_3')}</li>
            <li>{t('terms_conditions_para_4')}</li>
            <li>{t('terms_conditions_para_5')}</li>
            <li>{t("terms_conditions_para_6", { counttotalprize: 404 }).replaceTolgeeFormat()}</li>
            <li>{t('terms_conditions_para_7')}</li>
            <li>{t('terms_conditions_para_8')}</li>
            <li>{t('terms_conditions_para_9')}</li>
            <li>{t('terms_conditions_para_10')}</li>
            <li>{t('terms_conditions_para_11')}</li>
          </ul>
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={handleLeaderBoard}>{t('leaderboard')}</button>
      </div>
    </div>
  );
};


export default PromotionDetail;