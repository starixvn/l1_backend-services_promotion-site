import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import CountdownTimer from './count-down-timer';

dayjs.extend(duration);
dayjs.extend(utc);

interface CountdownTimerByRangeProps {
    startDate: Dayjs;
    endDate: Dayjs;
}

export const CountdownTimerByRange: React.FC<CountdownTimerByRangeProps> = ({ startDate, endDate }) => {
    const [targetDate, setTargetDate] = useState<Dayjs>(startDate);
    const [countDownText, setCountDownText] = useState<string>("STARTS IN");
    const [isFinishedCountDown, setIsFinishedCountDown] = useState<boolean>(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = dayjs.utc();

            if (now.diff(startDate, "s") < 0) {
                return;
            }

            if (now.diff(endDate, "s") < 0) {
                !targetDate.isSame(endDate) && setTargetDate(endDate);
                setCountDownText("ENDS IN");
                return;
            }

            setIsFinishedCountDown(true);
            clearInterval(intervalId);
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [startDate, endDate]);

    if (isFinishedCountDown) return null;

    return <CountdownTimer targetDate={targetDate} countDownText={countDownText} />;
};

export default CountdownTimerByRange;
