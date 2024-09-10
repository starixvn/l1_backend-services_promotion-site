import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { formatDateTimePadStart } from "../helpers/common-helper";
import { useTranslate } from "@tolgee/react";

dayjs.extend(duration);
dayjs.extend(utc);

interface CounterType {
    displayValue: string;
    text: string;
}

interface CountdownTimerProps {
    targetDate: Dayjs;
    countDownText?: string;
}

const Counter = ({ displayValue, text: timePart }: CounterType) => (
    <div className='counter' >
        <div className='displayValue'>{displayValue}</div>
        <div className='timePart'>{timePart}</div>
    </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, countDownText = "COUNTDOWN" }) => {
    const { t } = useTranslate();
    const [timeLeft, setTimeLeft] = useState([{
        text: t('days'),
        value: "00",
    }, {
        text: t('hours'),
        value: "00",
    },
    {
        text: t('mins'),
        value: "00",
    },
    {
        text: t('secs'),
        value: "00",
    }]);

    useEffect(() => {
        const updateTimer = () => {
            const now = dayjs.utc();

            if (targetDate.diff(now, "s") <= 0) {
                clearInterval(intervalId);
                return;
            }

            const remainingTime = dayjs.duration(targetDate.diff(now));
            setTimeLeft(
                [{
                    text: t('days'),
                    value: formatDateTimePadStart(Math.floor(remainingTime.asDays())),
                }, {
                    text: t('hours'),
                    value: formatDateTimePadStart(remainingTime.hours()),
                },
                {
                    text: t('mins'),
                    value: formatDateTimePadStart(remainingTime.minutes()),
                },
                {
                    text: t('secs'),
                    value: formatDateTimePadStart(remainingTime.seconds()),
                }]
            );
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return (
        <div className="count-down-timer">
            <div className="container">
                <div className='count-down-text'>{countDownText}</div>
                <div className="counter-wrapper">
                    {timeLeft.map(({ text, value }, index) => (
                        <Counter key={index} displayValue={value} text={text} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
