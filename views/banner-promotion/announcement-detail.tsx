import React from 'react';
import { useTranslate } from '@tolgee/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import '../../public/static/css/_fonts.scss';
import '../../public/static/css/_custom-scrollbar.css';
import '../../public/static/css/announcement-detail.scss';

dayjs.extend(utc);
interface AnnouncementDetailProps {
    data: {
        announcementTittle: string;
        terms: string;
        eligibleGames: string;
        freeSpinReward: string | number;
        totalBetPerSpin: string | number;
        game: any;
        promotionFreeSpins: any;
        showBackButton?: boolean;
    };
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ data }) => {
    const { terms, eligibleGames, freeSpinReward, totalBetPerSpin, game, promotionFreeSpins, showBackButton = false } = data;
    const template = 'HH:mm MM/DD/YYYY';
    const startdate = dayjs.utc(promotionFreeSpins?.startDate).local().format(template);
    const enddate = dayjs.utc(promotionFreeSpins?.endDate).local().format(template);
    const { t } = useTranslate();

    // Parse eligibleGames to array of numbers
    const eligibleGameIds = eligibleGames
        ? eligibleGames
              .split(',')
              .map((id: string) => Number(id.trim()))
              .filter((id: number) => !isNaN(id))
        : [];

    // Get eligible game objects from game prop
    let eligibleGameNames: string[] = [];
    if (Array.isArray(game)) {
        eligibleGameNames = game
            .filter((g: any) => eligibleGameIds.includes(Number(g.gameId)))
            .map((g: any) => {
                return t('game_name', { ns: g.name });
            });
    }

    // Fallback: if no eligibleGameNames, show eligibleGames as string
    const eligibleGamesDisplay = eligibleGameNames.length > 0 ? eligibleGameNames.join(', ') : eligibleGames;

    // Helper function to build back URL
    const buildBackUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return '/banner-promotions?' + params.toString();
    };

    // Helper function to render a term item
    const renderTermItem = (text: string, idx: number) => (
        <li key={idx} className='announcement-detail-term-item'>
            <span>{text}</span>
        </li>
    );

    return (
        <div className='announcement-detail-container'>
            {/* Back button - chỉ hiển thị khi showBackButton = true */}
            {showBackButton && (
                <button
                    className='announcement-detail-back-button'
                    aria-label="Back"
                    onClick={() => window.location.href = buildBackUrl()}
                />
            )}

            {/* Title */}
            <div className='announcement-detail-title'>
                <div className='announcement-detail-title-text'>
                    {t('promotion_details')}
                </div>
            </div>

            <div className='announcement-detail-content custom-scroll'>
                {/* Promotion Info */}
                <div className='announcement-detail-section-title'>
                    {t('FSB_viewdetails_promotion_info')}
                </div>
                <div className='announcement-detail-table-container'>
                    <table className='announcement-detail-table'>
                        <colgroup>
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className='announcement-detail-table-header'>{t('FSB_viewdetails_duration')}</th>
                                <th className='announcement-detail-table-header'>{t('FSB_viewdetails_eligible_games')}</th>
                                <th className='announcement-detail-table-header'>{t('FSB_viewdetails_freespin_reward')}</th>
                                <th className='announcement-detail-table-header'>{t('FSB_viewdetails_total_bet_per_spin')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='announcement-detail-table-cell'>{t('from_to',{ startdate, enddate })}</td>
                                <td className='announcement-detail-table-cell'>{eligibleGamesDisplay}</td>
                                <td className='announcement-detail-table-cell'>{freeSpinReward}</td>
                                <td className='announcement-detail-table-cell'>{totalBetPerSpin}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Rollover Requirement */}
                <div className='announcement-detail-section-title'>
                    {t('FSB_viewdetails_rollover_requirement')}
                </div>
                <div className='announcement-detail-table-container'>
                    <table className='announcement-detail-table'>
                        <colgroup>
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className='announcement-detail-table-header'>
                                    {t('FSB_viewdetails_rollover')}
                                </th>
                                <th className='announcement-detail-table-header'>
                                    {t('FSB_viewdetails_expiration')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='announcement-detail-table-cell'>
                                    {promotionFreeSpins.minTurnoverMultiplier}x
                                </td>
                                <td className='announcement-detail-table-cell'>
                                    {dayjs.utc(promotionFreeSpins.claimExpirationDate).local().format(template)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Terms & Conditions */}
                <div className='announcement-detail-section-title'>
                    {t('FSB_viewdetails_term&conditions')}
                </div>
                <div className='announcement-detail-terms-container'>
                    {terms.length > 0 && (
                        <ul className='announcement-detail-terms-list'>
                            {terms.split('\n').map((term, idx) => (
                                <li key={idx} className='announcement-detail-term-item'>
                                    {term}
                                </li>
                            ))}
                        </ul>
                    )}
                    {terms.length === 0 && (
                        <ul className='announcement-detail-terms-list'>
                            {Array.from({ length: 12 })
                                .map((_, idx) => ({ idx, text: t(`FSB_template_rules_para_${idx + 1}`) }))
                                .map(({ text, idx }) => renderTermItem(text, idx))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;
