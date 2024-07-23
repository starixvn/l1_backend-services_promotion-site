import { useTranslate } from '@tolgee/react';
import React from 'react';
import '../../public/static/css/style.scss';
import LoadingSpinner from '../components/loading-spinner';
import '../helpers/string-helper';
import { convertToBrowserLocale, formatDate, formatNumberWithComma } from '../helpers/common-helper';
import Prize from './prize';
import useFetchData from '../hooks/use-fetch-data';

const PromotionDetail = ({ handleLeaderBoard, promotionId, handleBackToHome }) => {
  const { t } = useTranslate();
  const { data, loading, error } = useFetchData(`promotions/getPromotionDetailsFake`);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const template = 'hh:mm MM/dd/yyyy';
  const startdate = formatDate(convertToBrowserLocale(data.startDateTime), template);
  const enddate = formatDate(convertToBrowserLocale(data.endDateTime), template);

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
      description: t('step3_para_1', { counttotalprize: data.numerousPrize }).replaceTolgeeFormat(),
    },
  ];

  return (
    <div className="tournament-container">

      <div className='header  text-center'>
        <div className='back-button-wrapper'> <button className="back-button" onClick={handleBackToHome}></button></div>
      </div>
      <div className="info-container promotion">
        <div className="title">{t('title_promotion_info')}</div>
        <div className="info-list">
          {promotionInformation.map(({ header, description }, index) => {
            return (
              <div className="info-item" key={index}>
                <div className='item-description-header'>{header}</div>
                <p>{description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-container participation">
        <div className="title">{t('title_participant_steps')}</div>
        <div className="info-list">
          {participantSteps.map(({ header, description }, index) => {
            return (
              <div className="info-item" key={index}>
                <div className='item-description-header'>{header}</div>
                <p>{description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-container prize">
        <div className="title">{t('title_prize_categories')}</div>
        <div className="info-list  ">
          {data.winningPrizes.map((prize, index) => (
            <Prize key={index} prize={prize} />
          ))}
        </div>
      </div>

      <div className="info-container">
        <div className="title">{t('title_terms_conditions')}</div>
        <ul>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
            const key = `terms_conditions_para_${item}`;
            return (
              <li className='term' key={key}>
                {item === 6
                  ? t(key, { counttotalprize: data.numerousPrize }).replaceTolgeeFormat()
                  : t(key)}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="leader-board ">
        <div>
          <button className="btn btn-primary" onClick={handleLeaderBoard}>
            {t('leaderboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetail;
