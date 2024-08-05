import '../../public/static/css/promotion-details.scss';
import '../helpers/string-helper';

import { useTranslate } from '@tolgee/react';
import { Markup } from 'interweave';
import moment from 'moment';
import React from 'react';

import LoadingSpinner from '../components/loading-spinner';
import { formatNumberWithComma } from '../helpers/common-helper';
import useFetchData from '../hooks/use-fetch-data';
import Prize from './prize';

const PromotionDetail = ({ handleLeaderBoard, promotionId }) => {
    const { t } = useTranslate();
    const { data, loading, error } = useFetchData(`promotions/${promotionId}`);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error.message}</div>;

    const template = 'HH:mm MM/DD/yyyy';
    const startdate = moment.utc(data?.startDateTime).local().format(template);
    const enddate = moment.utc(data?.endDateTime).local().format(template);

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
            description: formatNumberWithComma(data?.totalPrize),
        },
    ];

    const participantSteps = [
        {
            header: t('step1'),
            description: t('step1_para_1', {
                minstakeforslotgame: formatNumberWithComma(data?.slotGameMinBet),
                minstakeforothers: formatNumberWithComma(data?.otherGameMinBet),
            }).replaceTolgeeFormat(),
        },
        {
            header: t('step2'),
            description: t('step2_para_1'),
        },
        {
            header: t('step3'),
            description: t('step3_para_1', { counttotalprize: data?.numerousPrize }).replaceTolgeeFormat(),
        },
    ];

    return (
        <div className="promotion-container tournament-container">
            <div className="main-content content">
                <div className="banner">
                    <div className="center">
                        <div className="dealer"></div>
                        <div className="text-event">
                            <picture>
                                <source media="(min-width: 577px)" srcSet="static/images/banner/text-event.png"></source>
                                <img src="static/images/banner/mobile/text-event.png" />
                            </picture>
                        </div>
                        <div className="text-slogan">
                            <picture>
                                <source media="(min-width: 577px)" srcSet="static/images/banner/text-slogan.png"></source>
                                <img src="static/images/banner/mobile/text-slogan.png" />
                            </picture>
                        </div>
                        <div className="winning-prize">
                            <div className="left"></div>
                            <div className="middle">{formatNumberWithComma(data?.winningPrizes[0]?.value)}</div>
                            <div className="right"></div>
                        </div>
                    </div>
                </div>

                <div className="weekly-tournament">Weekly Tournament</div>

                <div className="table">
                    <div className="table-header-container header-bg">
                        <div className="bg">
                            <div className="left"></div>
                            <div className="middle"></div>
                            <div className="right"></div>
                        </div>
                        <div className="header-content">{t('title_promotion_info')}</div>
                    </div>

                    <div className="table-body-container main-bg">
                        <div className="table-body">
                            <div className="bg">
                                <div className="left"></div>
                                <div className="middle"></div>
                                <div className="right"></div>
                            </div>
                            <div className="info-list">
                                {promotionInformation.map(({ header, description }, index) => {
                                    return (
                                        <div className="info-item" key={index}>
                                            <div className="item-description-header">{header}</div>
                                            <p className="item-description-content">{description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="footer-bg">
                        <div className="left"></div>
                        <div className="middle"></div>
                        <div className="right"></div>
                    </div>
                </div>

                <div className="table">
                    <div className="table-header-container header-bg">
                        <div className="bg">
                            <div className="left"></div>
                            <div className="middle"></div>
                            <div className="right"></div>
                        </div>
                        <div className="header-content">{t('title_participant_steps')}</div>
                    </div>

                    <div className="table-body-container main-bg">
                        <div className="table-body">
                            <div className="bg">
                                <div className="left"></div>
                                <div className="middle"></div>
                                <div className="right"></div>
                            </div>
                            <div className="info-list">
                                {participantSteps.map(({ header, description }, index) => {
                                    return (
                                        <div className="info-item" key={index}>
                                            <div className="item-description-header">{header}</div>
                                            <p className="item-description-content">{description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="footer-bg">
                        <div className="left"></div>
                        <div className="middle"></div>
                        <div className="right"></div>
                    </div>
                </div>

                <div className="table">
                    <div className="table-header-container header-bg">
                        <div className="bg">
                            <div className="left"></div>
                            <div className="middle"></div>
                            <div className="right"></div>
                        </div>
                        <div className="header-content">{t('title_prize_categories')}</div>
                    </div>

                    <div className="table-body-container main-bg">
                        <div className="table-body">
                            <div className="bg">
                                <div className="left"></div>
                                <div className="middle"></div>
                                <div className="right"></div>
                            </div>
                            <div className="info-list prizes">
                                {data?.winningPrizes.map((prize, index) => <Prize key={index} prize={prize} />)}
                            </div>
                        </div>
                    </div>
                    <div className="footer-bg">
                        <div className="left"></div>
                        <div className="middle"></div>
                        <div className="right"></div>
                    </div>
                </div>

                <div className="table">
                    <div className="table-header-container header-bg">
                        <div className="bg">
                            <div className="left"></div>
                            <div className="middle"></div>
                            <div className="right"></div>
                        </div>
                        <div className="header-content">{t('title_terms_conditions')}</div>
                    </div>

                    <div className="table-body-container main-bg">
                        <div className="table-body">
                            <div className="bg">
                                <div className="left"></div>
                                <div className="middle"></div>
                                <div className="right"></div>
                            </div>
                            <ul className="term-list">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((item) => {
                                    const key = `terms_conditions_para_${item}`;
                                    return (
                                        <li className={`term term-${item}`} key={key}>
                                            <Markup
                                                content={
                                                    item === 6
                                                        ? t(key, { counttotalprize: data?.numerousPrize }).replaceTolgeeFormat()
                                                        : t(key)
                                                }
                                            ></Markup>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bg">
                        <div className="left"></div>
                        <div className="middle"></div>
                        <div className="right"></div>
                    </div>
                </div>
            </div>
            <div className="promotion-detail-footer">
                <button className="btn btn-leader-board" onClick={handleLeaderBoard}>
                    {t('leaderboard')}
                </button>
            </div>
        </div>
    );
};

export default PromotionDetail;
