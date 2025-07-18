import React, { useEffect, useState, useRef } from 'react';
import { useTranslate } from '@tolgee/react';
import '../../public/static/css/_fonts.scss';
import './banner-promotion.scss';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const ID_LANGUAGE = 'id-ID';

interface BannerPromotionProps {
    data: {
        promotionFreeSpins: any;
        announcementFreeSpins: any;
        language: string;
        configs: { apiConfigurationUrl: string };
        spins: number;
        serverTime: string;
    };
}

function getTimeLeft(endDate: string, serverTime: string, elapsedTime: number = 0) {
    if (!endDate) return { days: 0, hours: 0, mins: 0, secs: 0 };
    
    try {
        const [timeStr, dateStr] = endDate.split(' ');
        const [hoursStr, minutesStr, monthStr, dayStr, yearStr] = [...timeStr.split(':'), ...dateStr.split('/')];
        
        const end = new Date(
            parseInt(yearStr),
            parseInt(monthStr) - 1, 
            parseInt(dayStr),
            parseInt(hoursStr),
            parseInt(minutesStr)
        );

        if (isNaN(end.getTime())) return { days: 0, hours: 0, mins: 0, secs: 0 };

        const serverDate = new Date(serverTime);
        const currentUTC = serverDate.getTime() + elapsedTime;
        const diff = Math.max(0, end.getTime() - currentUTC);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, mins, secs };
    } catch (error) {
        console.error('Error calculating time left:', error, { endDate });
        return { days: 0, hours: 0, mins: 0, secs: 0 };
    }
}

const BannerPromotion: React.FC<BannerPromotionProps> = ({ data }) => {
    const { promotionFreeSpins, announcementFreeSpins, language, configs, spins, serverTime } = data;
    const announcementTitle = announcementFreeSpins?.promotionTitle?.[language] || announcementFreeSpins?.promotionTitle?.['en-US'] || '';

    const templateDate = 'HH:mm MM/DD/YYYY';
    const template = announcementFreeSpins?.template;
    const endDate = dayjs.utc(promotionFreeSpins?.endDate).local().format(templateDate);
    const templateImg = `${configs.apiConfigurationUrl}/template-${template}/banner-1.png`;
    const templateImgDefault = `${configs.apiConfigurationUrl}/template-default/banner.png`;
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate, serverTime));
    const { t } = useTranslate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const scaleValue = containerRef.current.offsetWidth / 901;
                setScale(scaleValue < 1 ? scaleValue : 1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!endDate) return;
        
        const startTime = Date.now();
        const timer = setInterval(() => {
            const currentElapsedTime = Date.now() - startTime;
            setTimeLeft(getTimeLeft(endDate, serverTime, currentElapsedTime));
        }, 1000);
        
        return () => clearInterval(timer);
    }, [endDate, serverTime]);

    return (
        <div
            ref={containerRef}
            className='banner-promotion-container'
            style={{
                background: template
                    ? `url(${templateImg}) center/contain no-repeat`
                    : `url(${templateImgDefault}) center/contain no-repeat`,
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: 901,
                    height: 426,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                }}
            >
                {/* Left: Content */}
                <div
                    style={{
                        height: '100%',
                        flexDirection: 'column',
                        width: 600,
                        marginLeft: 15,
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
                            fontWeight: 500,
                            color: 'fff179',
                            marginBottom: language === ID_LANGUAGE ? 15 : 12,
                            textAlign: 'center',
                            lineHeight: 1.35,
                        }}
                    >
                        <div style={{fontSize: 50, textTransform: 'uppercase', marginTop: 15, textShadow: '0 4px 4px #822b00' , marginBottom: -5, fontFamily: "'UTM-Swiss-721-Black-Condensed'"}}> {t('FSB_notification_para1a')} </div>
                        <div style={{fontSize: language === ID_LANGUAGE ? 18 : 23, textTransform: 'uppercase', fontFamily: "'UTM-Swiss-721-Black-Condensed'", padding: '0 20px'}}> {t('FSB_notification_para1', { value: spins })} </div>
                        <div style={{fontSize: 20, color: '#fff', fontFamily: "'UTM-BryantLG'", padding: '0 20px'}}> {t('FSB_notification_para2')} </div>
                    </div>
                    {/* Countdown */}
                    <div style={{ alignItems: 'center', marginBottom: 11, gap: 0, width: '100%' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <span
                                style={{
                                    fontFamily: "'UTM-BryantLG'",
                                    fontWeight: 500,
                                    fontSize: 20,
                                    marginLeft: -70,
                                    color: 'f3daac',
                                    textAlign: 'center',
                                    marginBottom: 7,
                                }}
                            >
                                {t('FSB_ends_in')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            {[
                                { value: String(timeLeft.days).padStart(2, '0'), label: t('FSB_days'), style: { marginLeft: 65 } },
                                { value: String(timeLeft.hours).padStart(2, '0'), label: t('FSB_hours'), style: { marginLeft: 15 } },
                                { value: String(timeLeft.mins).padStart(2, '0'), label: t('FSB_mins'), style: { marginLeft: 17 } },
                                { value: String(timeLeft.secs).padStart(2, '0'), label: t('FSB_secs'), style: { marginLeft: 16 } },
                            ].map((item, idx, arr) => (
                                <React.Fragment key={idx}>
                                    <div
                                        style={{
                                            color: '#fff',
                                            fontWeight: 500,
                                            fontSize: 36,
                                            borderRadius: 12,
                                            minWidth: 80,
                                            minHeight: 64,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            margin: '0 6px',
                                            fontFamily: "'UTM-Swiss-721-Black-Condensed'",
                                            position: 'relative',
                                            ...item.style,
                                        }}
                                    >
                                        <span style={{ fontSize: 40, fontWeight: 500, lineHeight: 1, fontFamily: "'UTM-Swiss-721-Black-Condensed'" }}>{item.value}</span>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                marginTop: 2,
                                                color: '#fff',
                                                textTransform: 'uppercase',
                                                opacity: 0.95,
                                                fontFamily: "'UTM-BryantLG'",
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    {/* Ribbon */}
                    <div
                        style={{
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: 27,
                            lineHeight: 1.2,
                            height: 80,
                            width: 450,
                            alignItems: 'center',
                            display: 'flex',
                            marginLeft: 20,
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontWeight: 500, fontSize: 26, lineHeight: 1.2, fontFamily: "'NotoSerifBold'" }}>
                            {announcementTitle || t('FSB_template_announcement_title')}
                        </span>
                    </div>
                    {/* View More button */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button
                            style={{
                                background: 'url(/static/images/free-spin-promotion/view-more.png) center center / 100% 100% no-repeat',
                                color: '#f3daac',
                                fontWeight: 800,
                                fontSize: 16,
                                border: 'none',
                                borderRadius: 8,
                                marginLeft: 165,
                                margin: '19px 0 0 -60',
                                cursor: 'pointer',
                                display: 'block',
                                minHeight: 40,
                                padding: '0 10px',
                                textAlign: 'center',
                                fontFamily: "'UTM-Swiss-721-Black-Condensed'",
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                textTransform: 'uppercase',
                            }}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (!params.has('showBackButton')) {
                                    params.append('showBackButton', 'true');
                                }
                                window.location.href = '/announcement-detail?' + params.toString();
                            }}
                        >
                            <span style={{fontSize: language === ID_LANGUAGE ? 14 : 20, fontWeight: 800, textTransform: 'uppercase', fontFamily: "'UTM-Swiss-721-Black-Condensed'"}}>{t('FSB_view_more')}</span>
                        </button>
                    </div>
                </div>
                {/* Right: Image */}
                <div style={{ flex: 5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 }}></div>
            </div>
        </div>
    );
};

export default BannerPromotion;
