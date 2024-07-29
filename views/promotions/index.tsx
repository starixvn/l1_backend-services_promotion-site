import '../../public/static/css/promotion.scss';
import '../helpers/string-helper';

import React from 'react';

import { PromotionViewModel } from '../../src/features/promotion-configs/models/promotion-configs-response';
import LoadingSpinner from '../components/loading-spinner';
import { convertToBrowserLocale, formatDate } from '../helpers';
import useFetchData from '../hooks/use-fetch-data';
import { useTranslator } from '../hooks/use-translator';

const PromotionContent = ({ promotion }) => {
    const { t } = useTranslator();

    if (promotion.isCompleted) {
        return <p className="text-red">{t('completed')}</p>;
    }

    const template = 'MM/dd/yyyy';
    const startdate = formatDate(convertToBrowserLocale(promotion.startDateTime), template);
    const enddate = formatDate(convertToBrowserLocale(promotion.endDateTime), template);
    return <p className="duration">{t('take_place_from', { startdate, enddate }).replaceTolgeeFormat()} </p>;
};

const Promotion = ({ promotion, handleMoreInfo }) => {
    const { t } = useTranslator();
    return (
        <div className="promotion-item">
            <div className="image-container">
                <img src={`static/images/promotion.png`} alt="promotion 1" className="img-fluid" />
            </div>
            <div className="item-container">
                <div className="item-title">{promotion.title}</div>
                <p className="item-content">{promotion.content}</p>
                <div className="item-more-info">
                    <PromotionContent promotion={promotion} />
                    <button className="button" onClick={() => handleMoreInfo(promotion.promotionId)}>
                        {t('more_info')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Promotions = ({ handleMoreInfo }) => {
    const { data, loading, error } = useFetchData('promotions');
    const { t } = useTranslator();

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="promotion-container">
            <div className="header">
                <div className="text">{t('promotions')}</div>
            </div>

            <div className="main-content promotion-list">
                {data &&
                    data.map((promotion: PromotionViewModel, index: number) => (
                        <Promotion key={index} promotion={promotion} handleMoreInfo={handleMoreInfo} />
                    ))}
            </div>
        </div>
    );
};

export default Promotions;
