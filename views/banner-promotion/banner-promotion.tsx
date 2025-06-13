import React, { useEffect, useState } from 'react';
import { useTranslate } from '@tolgee/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
interface BannerPromotionProps {
    data: {
        promotionFreeSpins: any;
        announcementFreeSpins: any;
        language: string;
        configs: { apiConfigurationUrl: string };
        spins: number;
    };
}

function getTimeLeft(endDate: string) {
    if (!endDate) return { days: 0, hours: 0, mins: 0, secs: 0 };
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return { days: 0, hours: 0, mins: 0, secs: 0 };
    const endMs = end.getTime();
    const now = Date.now();
    let diff = Math.max(0, endMs - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);
    return { days, hours, mins, secs };
}

const BannerPromotion: React.FC<BannerPromotionProps> = ({ data }) => {
    const { promotionFreeSpins, announcementFreeSpins, language, configs, spins } = data;

    const announcementTitle = announcementFreeSpins?.promotionTitle?.[language] || announcementFreeSpins?.promotionTitle?.['en-US'] || '';

    const templateDate = 'HH:mm MM/DD/YYYY';
    const template = announcementFreeSpins?.template;
    const endDate = dayjs.utc(promotionFreeSpins?.endDate).local().format(templateDate);
    const templateImg = `${configs.apiConfigurationUrl}/template-${template}/banner-1.png`;
    const templateImgDefault = `${configs.apiConfigurationUrl}/template-default/banner.png`;
    console.log('endDateFormatted', endDate);
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));
    const { t } = useTranslate();

    useEffect(() => {
        if (!endDate) return;
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(endDate));
        }, 1000);
        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div
            style={{
                width: 902,
                height: 425,
                position: 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                background: template
                    ? `url(${templateImg}) center/contain no-repeat`
                    : `url(${templateImgDefault}) center/contain no-repeat`,
                overflow: 'hidden',
                padding: 0,
            }}
        >
            {/* Left: Content */}
            <div
                style={{
                    height: '100%',
                    flexDirection: 'column',
                    width: 600,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    position: 'relative',
                }}
            >
                {/* Title */}
                <div
                    style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#ffe600',
                        marginBottom: 30,
                        textAlign: 'center',
                        lineHeight: 1.18,
                        textShadow: '0 2px 8px #000',
                        letterSpacing: 0.5,
                        marginLeft: 30,
                    }}
                >
                    <div style={{fontSize: 65}}> {t('FSB_notification_para1a')} </div>
                    <div style={{fontSize: 30, marginBottom: 10}}> {t('FSB_notification_para1', { value: spins })} </div>
                    <div style={{fontSize: 15, color: '#fff'}}> {t('FSB_notification_para2')} </div>
                </div>
                {/* Countdown */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 0, width: '100%', marginLeft: 20 }}>
                    <span
                        style={{
                            fontWeight: 500,
                            fontSize: 20,
                            color: '#fff',
                            marginRight: 18,
                            minWidth: 70,
                            textAlign: 'right',
                            textShadow: '0 1px 4px #000',
                        }}
                    >
                        {t('FSB_ends_in')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {[
                            { value: String(timeLeft.days).padStart(2, '0'), label: t('FSB_days'), style: { marginLeft: -9 } },
                            { value: String(timeLeft.hours).padStart(2, '0'), label: t('FSB_hours'), style: { marginLeft: 15 } },
                            { value: String(timeLeft.mins).padStart(2, '0'), label: t('FSB_mins'), style: { marginLeft: 17 } },
                            { value: String(timeLeft.secs).padStart(2, '0'), label: t('FSB_secs'), style: { marginLeft: 16 } },
                        ].map((item, idx, arr) => (
                            <React.Fragment key={idx}>
                                <div
                                    style={{
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: 36,
                                        borderRadius: 12,
                                        minWidth: 80,
                                        minHeight: 64,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        margin: '0 6px',
                                        position: 'relative',
                                        ...item.style,
                                    }}
                                >
                                    <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{item.value}</span>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            marginTop: 2,
                                            letterSpacing: 1,
                                            color: '#fff',
                                            textShadow: '0 1px 2px #000',
                                            opacity: 0.95,
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                {/* Ribbon xanh */}
                <div
                    style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        fontSize: 24,
                        lineHeight: 1.2,
                        height: 80,
                        width: 450,
                        alignItems: 'center',
                        display: 'flex',
                        marginLeft: 35,
                    }}
                >
                    <span style={{ fontWeight: 700, fontStyle: 'italic', fontSize: 24, lineHeight: 1.2 }}>
                        {announcementTitle || t('FSB_template_announcement_title')}
                    </span>
                </div>
                {/* View More button */}
                <button
                    style={{
                        background: 'url(/static/images/view-more.png) center/cover no-repeat',
                        color: '#222',
                        fontWeight: 900,
                        fontSize: 21,
                        border: 'none',
                        borderRadius: 8,
                        padding: '9px 10px',
                        margin: '15px auto 0 auto',
                        cursor: 'pointer',
                        display: 'block',
                        letterSpacing: 1,
                        boxShadow: 'none',
                        textShadow: 'none',
                        minWidth: 180,
                        minHeight: 48,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                    }}
                    onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        window.location.href = '/announcement-detail?' + params.toString();
                    }}
                >
                    {t('FSB_view_more')}
                </button>
            </div>
            {/* Right: Image */}
            <div style={{ flex: 5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 }}></div>
        </div>
    );
};

export default BannerPromotion;
