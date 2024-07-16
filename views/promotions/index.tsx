import React, { useEffect, useState } from 'react';
import '../../public/static/css/style.scss';
import { useTranslator } from '../hooks/use-translator';
import { convertToGMT8, formatDate } from '../helpers/time-helper';
import { PromotionViewModel } from 'src/features/promotion-configs/models/promotion-configs-response';
import { LanguageLocaleMapper } from '../constants/index';

const Promotions = ({ handleMoreInfo }) => {
  const [promotions, setPromotions] = useState<PromotionViewModel[]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslator();

  useEffect(() => {
    fetch('promotion-config/getByUserSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: '4HXGdnCqjTtg6CDdmMad4huZypcozhKC_ONEworksVGCash_6275877',
        username: 'ONEworksVGCash_6275877',
        browserUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(promotions => {
        setPromotions(promotions.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const buildPromotionContent = (promotion) => {
    if (promotion.status === 'completed') {
      return <p className="text-red">{t('completed')}</p>;
    }

    const template = "dd/MM/yyyy";
    const startdate = formatDate(convertToGMT8(new Date(promotion.startDateTime)), template);
    const enddate = formatDate(convertToGMT8(new Date(promotion.endDateTime)), template);
    return <p>{t("take_place_from", { startdate, enddate }).replaceTolgeeFormat()} </p>;
  }

  const language = LanguageLocaleMapper[window.AppInitialState?.lang];

  return (
    <div>
      <div className="promotion-container">
        <h2>{t('promotions')}</h2>
        <ul className="promotion-list">
          {
            promotions && promotions.map((promotion, index) => (
              <li key={index} className="promotion-item">
                <img src={`static/images/promotion-${promotion.promotionId}.png`} alt="promotion 1" width={150} />
                <div className="promotion-description">
                  <h3>{promotion?.title[language]}</h3>
                  <p>{promotion?.content[language]}</p>
                  {buildPromotionContent(promotion)}
                  <button className="btn btn-primary" onClick={handleMoreInfo}>{t('more_info')}</button>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
};

export default Promotions;