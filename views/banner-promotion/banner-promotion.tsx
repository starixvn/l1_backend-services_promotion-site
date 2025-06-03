import React, { useEffect, useState } from 'react';
import { useTranslate } from '@tolgee/react';

interface BannerPromotionProps {
    data: {
        promotionFreeSpins: any;
        announcementFreeSpins: any;
        language: string;
        configs: { apiConfigurationUrl: string };
        spins: number;
    };
}

function getQueryParam(name: string) {
    const url = new URL(window.location.href);
    let value = url.searchParams.get(name);
    if (!value) return '';
    try {
        value = JSON.parse(value);
    } catch {}
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
    }
    return value;
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

    const template = announcementFreeSpins?.template;
    const endDate = promotionFreeSpins?.endDate;
    const templateImg = `${configs.apiConfigurationUrl}/template-${template}/banner-1.png`;
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
                background: template ? `url(${templateImg}) center/cover no-repeat` : 'linear-gradient(120deg, #222 60%, #6a1b9a 100%)',
                color: '#fff',
                borderRadius: 12,
                padding: 32,
                maxWidth: 800,
                margin: '40px auto',
                position: 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {/* Main content */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 32, justifyContent: 'center' }}>
                {/* Left: Text and countdown */}
                <div
                    style={{
                        flex: 4,
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#ffe600', marginBottom: 12 }}>
                        {t('FSB_notification_para1', { value: spins })}
                    </div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 400,
                            marginBottom: 24,
                            textAlign: 'center',
                            whiteSpace: 'normal',
                            maxWidth: 350,
                        }}
                    >
                        {t('FSB_notification_para2')}
                    </div>
                    {/* Countdown */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, justifyContent: 'center' }}>
                        <span style={{ fontWeight: 600, marginRight: 12 }}>{t('FSB_ends_in')}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[
                                { value: String(timeLeft.days).padStart(2, '0'), label: t('FSB_days') },
                                { value: String(timeLeft.hours).padStart(2, '0'), label: t('FSB_hours') },
                                { value: String(timeLeft.mins).padStart(2, '0'), label: t('FSB_mins') },
                                { value: String(timeLeft.secs).padStart(2, '0'), label: t('FSB_secs') },
                            ].map((item, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            background: '#ffe600',
                                            color: '#222',
                                            fontWeight: 700,
                                            fontSize: 28,
                                            borderRadius: 6,
                                            padding: '6px 14px',
                                            minWidth: 48,
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                    <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Red ribbon */}
                    <div
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(90deg, #e53935 80%, #b71c1c 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 22,
                            padding: '8px 32px',
                            borderRadius: 4,
                            margin: '18px 0 18px 0',
                            boxShadow: '2px 4px 12px rgba(0,0,0,0.2)',
                            position: 'relative',
                        }}
                    >
                        {announcementTitle || t('FSB_template_announcement_title')}
                    </div>
                    {/* View More button */}
                    <div>
                        <button
                            style={{
                                background: 'linear-gradient(90deg, #ffe600 60%, #ffb300 100%)',
                                color: '#222',
                                fontWeight: 700,
                                fontSize: 20,
                                border: 'none',
                                borderRadius: 6,
                                padding: '10px 36px',
                                marginTop: 18,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                window.location.href = '/announcement-detail?' + params.toString();
                            }}
                        >
                            {t('FSB_view_more')}
                        </button>
                    </div>
                </div>
                {/* Right: Image */}
                <div style={{ flex: 2, maxWidth: '40%', textAlign: 'center' }}></div>
            </div>
        </div>
    );
};

export default BannerPromotion;
