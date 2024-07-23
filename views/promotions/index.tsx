import React from 'react';
import '../../public/static/css/style.scss';
import LoadingSpinner from '../components/loading-spinner';
import { convertToBrowserLocale, formatDate } from '../helpers';
import '../helpers/string-helper';
import { useTranslator } from '../hooks/use-translator';
import useFetchData from '../hooks/use-fetch-data';
import { PromotionViewModel } from "../../src/features/promotion-configs/models/promotion-configs-response";

const PromotionContent = ({ promotion }) => {
    const { t } = useTranslator();

    if (promotion.isCompleted) {
        return <p className="text-red">{t('completed')}</p>;
    }

    const template = 'MM/dd/yyyy';
    const startdate = formatDate(convertToBrowserLocale(promotion.startDateTime), template);
    const enddate = formatDate(convertToBrowserLocale(promotion.endDateTime), template);
    return <p>{t('take_place_from', { startdate, enddate }).replaceTolgeeFormat()} </p>;
};

const Promotion = ({ promotion, handleMoreInfo }) => {
    const { t } = useTranslator();
    return (
        <div className="promotion-item">
            <img src={`static/images/promotion.png`} alt="promotion 1" width={150} />
            <div className="promotion-description">
                <h3>{promotion.title}</h3>
                <p>{promotion.content}</p>
                <PromotionContent promotion={promotion} />
            </div>
            <div className='more-info'>
                <button className="btn btn-primary" onClick={() => handleMoreInfo(promotion.promotionId)}>
                    {t('more_info')}
                </button>
            </div>
        </div>
    )
}

const Promotions = ({ handleMoreInfo }) => {
    const { data, loading, error } = useFetchData('promotions/getPromotionsFake');

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="promotion-container">
            <div className="promotion-list">
                {
                    data && data.map((promotion: PromotionViewModel, index: number) => (
                        <Promotion key={index} promotion={promotion} handleMoreInfo={handleMoreInfo} />
                    ))
                }
            </div>
        </div>
    );
};

export default Promotions;
