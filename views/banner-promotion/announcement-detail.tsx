import React from 'react';
import { useTranslate } from '@tolgee/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import '../../public/static/css/_fonts.scss';
import '../../public/static/css/_custom-scrollbar.css';

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
    };
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ data }) => {
    const { announcementTittle, terms, eligibleGames, freeSpinReward, totalBetPerSpin, game, promotionFreeSpins } = data;
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

    // Helper function to render a term item
    const renderTermItem = (text: string, idx: number) => (
        <li
            key={idx}
            style={{
                marginBottom: 8,
                listStyle: 'none',
                position: 'relative',
                paddingLeft: 18,
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    left: 0,
                    color: '#fff',
                    fontWeight: 700,
                }}
            >
                +
            </span>
            <span style={{ marginLeft: 25 }}>{text}</span>
        </li>
    );

    return (
        <div
            style={{
                background: 'url(/static/images/free-spin-promotion/detail-board.png) center center / contain no-repeat',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                width: 888,
                height: 427,
                color: '#fff',
                borderRadius: 12,
                position: 'relative',
            }}
        >
            {/* Back button */}
            <button
                style={{
                    position: 'absolute',
                    top: 16,
                    left: 20,
                    border: 'none',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    cursor: 'pointer',
                    zIndex: 2,
                    padding: 0,
                    backgroundColor: 'transparent',
                    backgroundImage: 'url(/static/images/free-spin-promotion/back-button.png)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
                aria-label="Back"
                onClick={() => window.history.back()}
            />

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                    style={{
                        display: 'inline-block',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 30,
                        padding: '7px 19px',
                        borderRadius: 16,
                        margin: '0 0 0 0',
                        fontFamily: "'UTM-Swiss-721-Black-Condensed'",
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                    }}
                >
                    {t('promotion_details')}
                </div>
            </div>

            <div style={{overflowY: 'auto', height: 335, marginRight: 10, marginLeft: 5, borderRadius: 10 }} className="custom-scroll">
                {/* Promotion Info */}
                <div style={{ fontSize: 20, marginLeft: 30, fontFamily: "'UTM-Swiss-721-Black-Condensed'", fontWeight: 700, marginBottom: 8, color: '#fff697', letterSpacing: 0.5 }}>
                    {t('FSB_viewdetails_promotion_info')}
                </div>
                <div
                    style={{
                        background: '#2b2b2b',
                        padding: '11px 10px 16px 10px',
                        marginBottom: 32,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 18,
                        color: '#fff',
                        fontFamily: "'UTM-Swiss-721-Black-Condensed'"
                    }}
                >
                    <div
                        style={{ flex: 1, display: 'flex', maxWidth: 225, flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {t('FSB_viewdetails_duration')}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'UTM-BryantLG'", whiteSpace: 'pre-line' }}>
                            {t('from_to',{ startdate, enddate })}
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {t('FSB_viewdetails_eligible_games')}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'UTM-BryantLG'" , whiteSpace: 'pre-line' }}>
                            {eligibleGamesDisplay}
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            {t('FSB_viewdetails_freespin_reward')}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'UTM-BryantLG'" }}>{freeSpinReward}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
                        <div style={{  fontWeight: 700, marginBottom: 4 }}>
                            {t('FSB_viewdetails_total_bet_per_spin')}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'UTM-BryantLG'" }}>{totalBetPerSpin}</div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div style={{ fontSize: 20,  marginLeft: 30, fontFamily: "'UTM-Swiss-721-Black-Condensed'", fontWeight: 700, marginBottom: 8, color: '#fff697', letterSpacing: 0.5 }}>
                    {t('FSB_viewdetails_term&conditions')}
                </div>
                <div
                    style={{
                        background: '#2b2b2b',
                        padding: '11px 35px 11px 10px',
                        whiteSpace: 'pre-line',
                        lineHeight: 1.5,
                        color: '#fff',
                        fontSize: 17,
                        fontFamily: "'UTM-BryantLG'"
                    }}
                >
                    {terms.length > 0 && (
                        <ul style={{ paddingLeft: 24, margin: 0 }}>
                            {terms.split('\n').map((term, idx) => (
                                <li key={idx} style={{ marginBottom: 8, listStyle: 'none', position: 'relative', paddingLeft: 18 }}>
                                    <span style={{ position: 'absolute', left: 0, color: '#fff', fontWeight: 700 }}>
                                        +
                                    </span>{' '}
                                    {term}
                                </li>
                            ))}
                        </ul>
                    )}
                    {terms.length === 0 && (
                        <ul style={{ paddingLeft: 24, margin: 0 }}>
                            {Array.from({ length: 8 })
                                .map((_, idx) => ({ idx, text: t(`FSB_template_rules_para_${idx + 1}`) }))
                                .filter(({ idx }) => idx !== 2 && idx !== 4)
                                .map(({ text, idx }) => renderTermItem(text, idx))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetail;
