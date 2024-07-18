import { useTranslate } from '@tolgee/react';
import React from 'react';
import '../../public/static/css/style.scss';
import LoadingSpinner from '../components/loading-spinner';
import '../helpers/string-helper';
import { convertToGMT8, formatDate, formatNumberWithComma } from '../helpers/common-helper';
import Prize from './prize';
import useFetchData from '../hooks/use-fetch-data';

const PromotionDetail = ({ handleLeaderBoard, promotionId }) => {
  const { t } = useTranslate();
  const { data, loading, error } = useFetchData(`promotions/${promotionId}`);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const template = 'hh:mm dd/MM/yyyy';
  const startdate = formatDate(convertToGMT8(new Date(data.startDateTime)), template);
  const enddate = formatDate(convertToGMT8(new Date(data.endDateTime)), template);

  const promotionInformation = [
    {
      header: t('duration'),
      description: t('take_place_from', { startdate, enddate }).replaceTolgeeFormat(),
    },
    {
      header: t('eligible_games'),
      description: t('all_games'),
    },
    {
      header: t('total_prize'),
      description: formatNumberWithComma(data.totalPrize),
    },
  ];

  const participantSteps = [
    {
      header: t('step1'),
      description: t('step1_para_1', {
        minstakeforslotgame: formatNumberWithComma(data.slotGameMinBet),
        minstakeforothers: formatNumberWithComma(data.otherGameMinBet),
      }).replaceTolgeeFormat(),
    },
    {
      header: t('step2'),
      description: t('step2_para_1'),
    },
    {
      header: t('step3'),
      description: t('step3_para_1', { counttotalprize: data.countTotalPrize }).replaceTolgeeFormat(),
    },
  ];

  return (
    <div>
      <div className="tournament-container">
        <h2 className="text-center">{data.title}</h2>
        <p className="text-center">{t('promotion_header', { prizevalue1: formatNumberWithComma(data.winningPrizes[0]?.value) }).replaceTolgeeFormat()}</p>

        <div className="info-container promotion">
          <h3 className="title">{t('title_promotion_info')}</h3>
          <div className="info-list">
            {promotionInformation.map(({ header, description }, index) => {
              return (
                <div className="info-item" key={index}>
                  <h3>{header}</h3>
                  <p>{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="info-container participation">
          <h3 className="title">{t('title_participant_steps')}</h3>
          <div className="info-list">
            {participantSteps.map(({ header, description }, index) => {
              return (
                <div className="info-item" key={index}>
                  <h3>{header}</h3>
                  <p>{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="info-container prize">
          <h3 className="title">{t('title_prize_categories')}</h3>
          <div className="prize-container ">
            {data.winningPrizes.map((prize, index) => (
              <Prize key={index} prize={prize} />
            ))}
          </div>
        </div>

        <div className="terms-conditions">
          <h3 className="title">{t('title_terms_conditions')}</h3>
          <ul>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
              const key = `terms_conditions_para_${item}`;
              return (
                <li key={key}>
                  {item === 6
                    ? t(key, { counttotalprize: data.countTotalPrize }).replaceTolgeeFormat()
                    : t(key)}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="leader-board ">
          <button className="btn btn-primary" onClick={handleLeaderBoard}>
            {t('leaderboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetail;
