import React, { useEffect, useState } from 'react';
import '../../public/static/css/style.scss';
import { useTranslate } from '@tolgee/react';

const Promotions = ({ handleMoreInfo }) => {
  const [promotions, setPromotions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslate();

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

    return <p>Take place from {promotion.startDateTime} to {promotion.endDateTime}</p>;
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
          {/* <li className="promotion-item">
            <img src="static/images/promotion-1.png" alt="promotion 1" width={150} />
            <div className="promotion-description">
              <h3>Promotion 1</h3>
              <p>Description of promotion 1</p>
              <p>Take place from 10/17/2024 to 10/23/2024</p>
              <button className="btn btn-primary" onClick={handleMoreInfo}>More Info</button>
            </div>
          </li>

          <li className="promotion-item">
            <img src="static/images/promotion-2.png" alt="promotion 2" width={150} />
            <div className="promotion-description">
              <h3>Promotion 2</h3>
              <p>Description of promotion 2</p>
              <p className="text-red">Completed</p>
              <button className="btn btn-primary" onClick={handleMoreInfo}>More Info</button>
            </div>
          </li> */}
        </ul>
      </div>
    </div>

  );
};

export default Promotions;