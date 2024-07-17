import React, { useEffect, useState } from 'react';
import { PromotionViewModel } from 'src/features/promotion-configs/models/promotion-configs-response';
import '../../public/static/css/style.scss';
import { GameUtils, ParamsHelper, convertToGMT8, formatDate } from '../helpers';
import { useTranslator } from '../hooks/use-translator';
import LoadingSpinner from '../components/loading-spinner';

const PromotionContent = ({ promotion }) => {
    const { t } = useTranslator();

    if (promotion.status === 'completed') {
        return <p className="text-red">{t('completed')}</p>;
    }

    const template = 'dd/MM/yyyy';
    const startdate = formatDate(convertToGMT8(new Date(promotion.startDateTime)), template);
    const enddate = formatDate(convertToGMT8(new Date(promotion.endDateTime)), template);
    return <p>{t('take_place_from', { startdate, enddate }).replaceTolgeeFormat()} </p>;
};

const Promotions = ({ handleMoreInfo }) => {
    const { sessionId, username } = ParamsHelper.getParams();
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
            .then((promotions) => {
                setPromotions(promotions.data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <div className="promotion-container">
                <h2>{t('promotions')}</h2>
                <ul className="promotion-list">
                    {promotions &&
                        promotions.map((promotion, index) => (
                            <li key={index} className="promotion-item">
                                <img src={`static/images/promotion-${promotion.promotionId}.png`} alt="promotion 1" width={150} />
                                <div className="promotion-description">
                                    <h3>{promotion.title}</h3>
                                    <p>{promotion.content}</p>
                                    <PromotionContent promotion={promotion} />
                                    <button className="btn btn-primary" onClick={() => handleMoreInfo(promotion.promotionId)}>
                                        {t('more_info')}
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default Promotions;
