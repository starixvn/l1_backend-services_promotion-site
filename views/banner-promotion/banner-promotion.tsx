import React, { useEffect, useState, useRef } from 'react';
import { useTranslate } from '@tolgee/react';
import '../../public/static/css/_fonts.scss';
import '../../public/static/css/banner-promotion.scss';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const ID_LANGUAGE = 'id-ID';

// Time constants
const TIME_CONSTANTS = {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    MONTH_OFFSET: 1, // JavaScript months are 0-indexed
} as const;

// Calculate derived constants
const MILLISECONDS_PER_MINUTE = TIME_CONSTANTS.MILLISECONDS_PER_SECOND * TIME_CONSTANTS.SECONDS_PER_MINUTE;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * TIME_CONSTANTS.HOURS_PER_DAY;

interface BannerPromotionProps {
    data: {
        promotionFreeSpins: any;
        announcementFreeSpins: any;
        language: string;
        configs: { apiConfigurationUrl: string };
        spins: number;
        serverTime: string;
        isPortrait?: boolean;
    };
}

interface TimeLeft {
    days: number;
    hours: number;
    mins: number;
    secs: number;
}

/**
 * Parse date string in format "HH:mm MM/DD/YYYY" to Date object
 */
function parseDateString(dateString: string): Date | null {
    try {
        const [timeStr, dateStr] = dateString.split(' ');
        const [hoursStr, minutesStr, monthStr, dayStr, yearStr] = [...timeStr.split(':'), ...dateStr.split('/')];

        const year = parseInt(yearStr);
        const month = parseInt(monthStr) - TIME_CONSTANTS.MONTH_OFFSET;
        const day = parseInt(dayStr);
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        const date = new Date(year, month, day, hours, minutes);

        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Error parsing date string:', error, { dateString });
        return null;
    }
}

/**
 * Calculate time difference in milliseconds
 */
function calculateTimeDifference(endDate: Date, serverTime: string, elapsedTime: number): number {
    const serverDate = new Date(serverTime);
    const currentUTC = serverDate.getTime() + elapsedTime;
    return Math.max(0, endDate.getTime() - currentUTC);
}

/**
 * Convert milliseconds to time units
 */
function millisecondsToTimeUnits(milliseconds: number): TimeLeft {
    const days = Math.floor(milliseconds / MILLISECONDS_PER_DAY);
    const remainingAfterDays = milliseconds % MILLISECONDS_PER_DAY;

    const hours = Math.floor(remainingAfterDays / MILLISECONDS_PER_HOUR);
    const remainingAfterHours = remainingAfterDays % MILLISECONDS_PER_HOUR;

    const mins = Math.floor(remainingAfterHours / MILLISECONDS_PER_MINUTE);
    const remainingAfterMinutes = remainingAfterHours % MILLISECONDS_PER_MINUTE;

    const secs = Math.floor(remainingAfterMinutes / TIME_CONSTANTS.MILLISECONDS_PER_SECOND);

    return { days, hours, mins, secs };
}

function getTimeLeft(endDate: string, serverTime: string, elapsedTime: number = 0): TimeLeft {
    if (!endDate) {
        return { days: 0, hours: 0, mins: 0, secs: 0 };
    }

    const end = parseDateString(endDate);
    if (!end) {
        console.error('Invalid end date format:', endDate);
        return { days: 0, hours: 0, mins: 0, secs: 0 };
    }

    const timeDifference = calculateTimeDifference(end, serverTime, elapsedTime);
    return millisecondsToTimeUnits(timeDifference);
}

const BannerPromotion: React.FC<BannerPromotionProps> = ({ data }) => {
    const { promotionFreeSpins, announcementFreeSpins, language, configs, spins, serverTime, isPortrait } = data;
    const announcementTitle = announcementFreeSpins?.promotionTitle?.[language] || announcementFreeSpins?.promotionTitle?.['en-US'] || '';
    const getPrefixImage = (name: string) => {
        return isPortrait ? `portrait-${name}` : name;
    };
    const templateDate = 'HH:mm MM/DD/YYYY';
    const template = announcementFreeSpins?.template;
    const endDate = dayjs.utc(promotionFreeSpins?.endDate).local().format(templateDate);
    const templateImg = `${configs.apiConfigurationUrl}/template-${template}/${getPrefixImage('banner-1.png')}`;
    const templateImgDefault = `${configs.apiConfigurationUrl}/template-default/${getPrefixImage('banner.png')}`;
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

    const isIndonesian = language === ID_LANGUAGE;
    const getClassName = (baseClass: string) => {
        return isPortrait ? `${baseClass}-portrait` : baseClass;
    };
    return (
        <div
            ref={containerRef}
            className={getClassName('banner-promotion-container')}
            style={{
                background: template
                    ? `url(${templateImg}) center/contain no-repeat`
                    : `url(${templateImgDefault}) center/contain no-repeat`,
            }}
        >
            <div
                className={getClassName('banner-promotion-scaled')}
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                {/* Left: Content */}
                <div className={getClassName('banner-promotion-content')}>
                    {/* Title */}
                    <div
                        className={`${getClassName('banner-promotion-title')} ${isIndonesian ? `${getClassName('banner-promotion-title')}--indonesian` : ''}`}
                    >
                        <div className={getClassName('banner-promotion-title-main')}>{t('FSB_notification_para1a')}</div>
                        <div
                            className={`${getClassName('banner-promotion-title-sub')} ${isIndonesian ? `${getClassName('banner-promotion-title-sub')}--indonesian` : ''}`}
                        >
                            {t('FSB_notification_para1', { value: spins })}
                        </div>
                        <div className={getClassName('banner-promotion-title-desc')}>{t('FSB_notification_para2')}</div>
                    </div>

                    {/* Countdown */}
                    <div className={getClassName('banner-promotion-countdown')}>
                        <div className={getClassName('banner-promotion-countdown-label')}>
                            <span className={getClassName('banner-promotion-countdown-text')}>{t('FSB_ends_in')}</span>
                        </div>
                        <div className={getClassName('banner-promotion-countdown-container')}>
                            {[
                                { value: String(timeLeft.days).padStart(2, '0'), label: t('FSB_days'), modifier: 'days' },
                                { value: String(timeLeft.hours).padStart(2, '0'), label: t('FSB_hours'), modifier: 'hours' },
                                { value: String(timeLeft.mins).padStart(2, '0'), label: t('FSB_mins'), modifier: 'mins' },
                                { value: String(timeLeft.secs).padStart(2, '0'), label: t('FSB_secs'), modifier: 'secs' },
                            ].map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div
                                        className={`${getClassName('banner-promotion-countdown-item')} ${getClassName('banner-promotion-countdown-item')}--${item.modifier}`}
                                    >
                                        <span className={getClassName('banner-promotion-countdown-value')}>{item.value}</span>
                                        <span className={getClassName('banner-promotion-countdown-label-text')}>{item.label}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Ribbon */}
                    <div className={getClassName('banner-promotion-ribbon')}>
                        <span className={getClassName('banner-promotion-ribbon-text')}>
                            {announcementTitle || t('FSB_template_announcement_title')}
                        </span>
                    </div>

                    {/* View More button */}
                    <div className={getClassName('banner-promotion-button-container')}>
                        <button
                            className={getClassName('banner-promotion-view-more-button')}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                if (!params.has('showBackButton')) {
                                    params.append('showBackButton', 'true');
                                }
                                window.location.href = '/announcement-detail?' + params.toString();
                            }}
                        >
                            <span
                                className={`${getClassName('banner-promotion-view-more-text')} ${isIndonesian ? `${getClassName('banner-promotion-view-more-text')}--indonesian` : ''}`}
                            >
                                {t('FSB_view_more')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Right: Image */}
                <div className={getClassName('banner-promotion-image-container')}></div>
            </div>
        </div>
    );
};

export default BannerPromotion;

