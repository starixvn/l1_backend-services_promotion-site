import React, { useEffect, useState } from 'react';
import '../../public/static/css/style.scss';
import { usePromotionCampaignTranslate } from '../hooks/use-translator';
import { convertToGMT8, formatDate } from '../helpers/time-helper';

const Promotions = ({ handleMoreInfo }) => {
  const [promotions, setPromotions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = usePromotionCampaignTranslate();

  useEffect(() => {
    fetch('promotion-config')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPromotions(data);
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
    const startDate = formatDate(convertToGMT8(new Date(promotion.startDateTime)), template);
    const endDate = formatDate(convertToGMT8(new Date(promotion.endDateTime)), template);
    return <p>Take place from {startDate} to {endDate}</p>;
  }

  return (
    <div>
      <div className="promotion-container">
        <h2>{t('promotions')}</h2>
        <ul className="promotion-list">
          {
            promotions && promotions.data.map((promotion, index) => (
              <li key={index} className="promotion-item">
                <img src={`static/images/promotion-${promotion.promotionId}.png`} alt="promotion 1" width={150} />
                <div className="promotion-description">
                  <h3>{promotion.name}</h3>
                  <p>{promotion.description || 'No description available'}</p>
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