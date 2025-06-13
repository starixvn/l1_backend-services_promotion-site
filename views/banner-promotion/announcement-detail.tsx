import React from 'react';
import { useTranslate } from '@tolgee/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
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
    const duration = startdate && enddate
            ? `From ${startdate} to ${enddate}`
            : '';
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

    return (
        <div
            style={{
                width: 902,
                height: 425,
                background: 'rgba(0,0,0,0.95)',
                overflowY: 'auto',
                color: '#fff',
                borderRadius: 12,
                padding: 32,
                margin: '40px auto',
                position: 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            <style>
                {`
                div[style*="overflow-y: auto"], div[style*="overflowY: 'auto'"] {
                    scrollbar-width: thin;
                    scrollbar-color: #666 #222;
                }
                div[style*="overflow-y: auto"]::-webkit-scrollbar,
                div[style*="overflowY: 'auto'"]::-webkit-scrollbar {
                    width: 10px;
                    background: #222;
                    border-radius: 8px;
                }
                div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb,
                div[style*="overflowY: 'auto'"]::-webkit-scrollbar-thumb {
                    background: #666;
                    border-radius: 8px;
                    border: 2px solid #222;
                }
                div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover,
                div[style*="overflowY: 'auto'"]::-webkit-scrollbar-thumb:hover {
                    background: #888;
                }
                `}
            </style>
            {/* Back button */}
            <button
                style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: '#e0e0e0',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    color: '#222',
                    fontSize: 22,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    zIndex: 2,
                    transition: 'background 0.2s',
                }}
                aria-label="Back"
                onClick={() => window.history.back()}
                onMouseOver={(e) => (e.currentTarget.style.background = '#bdbdbd')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#e0e0e0')}
            >
                {'<'}
            </button>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                    style={{
                        display: 'inline-block',
                        background: '#ffe600',
                        color: '#222',
                        fontWeight: 700,
                        fontSize: 32,
                        padding: '8px 32px',
                        borderRadius: 6,
                        margin: '0 auto',
                    }}
                >
                    {announcementTittle || t('FSB_template_announcement_title')}
                </div>
            </div>

            {/* Promotion Info */}
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{t('FSB_viewdetails_promotion_info')}</div>
            <div
                style={{
                    background: 'rgba(100,100,0,0.2)',
                    borderRadius: 8,
                    padding: 20,
                    marginBottom: 32,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 18,
                    fontWeight: 500,
                    border: '1px solid #888',
                }}
            >
                <div style={{ flex: 1, display: 'flex', maxWidth: 225, flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{t('FSB_viewdetails_duration')}</div>
                    <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{duration}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                        {t('FSB_viewdetails_eligible_games')}
                    </div>
                    <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{eligibleGamesDisplay}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                        {t('FSB_viewdetails_freespin_reward')}
                    </div>
                    <div style={{ textAlign: 'center' }}>{freeSpinReward}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                        {t('FSB_viewdetails_total_bet_per_spin')}
                    </div>
                    <div style={{ textAlign: 'center' }}>{totalBetPerSpin}</div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{t('FSB_viewdetails_term&conditions')}</div>
            <div
                style={{
                    background: 'rgba(100,100,0,0.2)',
                    borderRadius: 8,
                    padding: 20,
                    border: '1px solid #888',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                }}
            >
                {terms.length > 0 && terms}
                {terms.length === 0 && (
                    <>
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <React.Fragment key={idx}>
                                {`${idx + 1}. ${' '}${t(`FSB_template_rules_para_${idx + 1}`)}`}
                                <br />
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnnouncementDetail;
