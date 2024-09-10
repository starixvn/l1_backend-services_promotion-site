import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import CountdownTimer from './count-down-timer';
import { useTranslate } from "@tolgee/react";

dayjs.extend(duration);
dayjs.extend(utc);

interface CountdownTimerByRangeProps {
    startDate: Dayjs;
    endDate: Dayjs;
    wrapperStyle?: string;
}

export const CountdownTimerByRange: React.FC<CountdownTimerByRangeProps> = ({ startDate, endDate, wrapperStyle }) => {
    const { t } = useTranslate();
    const [targetDate, setTargetDate] = useState<Dayjs>(startDate);
    const [countDownText, setCountDownText] = useState<string>(t('starts_in'));
    const [isHideCountDownTimer, setIsHideCountDownTimer] = useState<boolean>(true);

    useEffect(() => {
        const updateTimer = () => {
            const now = dayjs.utc();

            if (now.diff(startDate, "s") < 0) {
                setIsHideCountDownTimer(false);
                return;
            }

            if (now.diff(endDate, "s") < 0) {
                setIsHideCountDownTimer(false);
                setTargetDate(endDate);
                setCountDownText(t('ends_in'))
                return;
            }

            setIsHideCountDownTimer(true);
            clearInterval(intervalId);
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [startDate, endDate]);

    if (isHideCountDownTimer) return null;

    return <div className={wrapperStyle}><CountdownTimer targetDate={targetDate} countDownText={countDownText} /></div>;
};

export default CountdownTimerByRange;
