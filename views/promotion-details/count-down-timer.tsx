import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { formatDateTimePadStart } from "../helpers/common-helper";

dayjs.extend(duration);
dayjs.extend(utc);

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState<object>({
        "DAYS": "",
        "HOURS": "",
        "MINS": "",
        "SECS": ""
    });

    const [isFinishedCountDown, setIsFinishedCountDown] = useState<boolean>(false);

    useEffect(() => {
        const target = dayjs.utc(targetDate);

        const updateTimer = () => {
            const now = dayjs.utc();
            const diff = target.diff(now);

            if (diff <= 0) {
                setIsFinishedCountDown(true);
                return;
            }

            const remainingTime = dayjs.duration(diff);
            setTimeLeft({
                "DAYS": formatDateTimePadStart(Math.floor(remainingTime.asDays())),
                "HOURS": formatDateTimePadStart(remainingTime.hours()),
                "MINS": formatDateTimePadStart(remainingTime.minutes()),
                "SECS": formatDateTimePadStart(remainingTime.seconds())
            });
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [targetDate]);

    if (isFinishedCountDown) {
        return <></>;
    }

    return (
        <div className="count-down">
            <div className="count-down-title"> ENDS IN </div>
            {
                Object.entries(timeLeft).map(([key, value], index) => {
                    return (<div key={index} className="time-container">
                        <div className="time-value">{value}</div>
                        <div className="time-text">{key}</div>
                    </div>)
                })
            }
        </div>
    )
};

export default CountdownTimer;
