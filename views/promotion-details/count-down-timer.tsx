import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const [daysLeft, setDaysLeft] = useState<string>("");
    const [oursLeft, setOursLeft] = useState<string>("");
    const [minutesLeft, setMinutesLeft] = useState<string>("");
    const [secondsLeft, setSecondsLeft] = useState<string>("");

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
            setDaysLeft(Math.floor(remainingTime.asDays()).toString());
            setOursLeft(remainingTime.hours().toString());
            setMinutesLeft(remainingTime.minutes().toString());
            setSecondsLeft(remainingTime.seconds().toString());
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
            <div className="time-container">
                <div className="time-value">{daysLeft}</div>
                <div className="time-text">DAYS</div>
            </div>
            <div className="time-container">
                <div className="time-value">{oursLeft}</div>
                <div className="time-text">HOURS</div>
            </div>
            <div className="time-container">
                <div className="time-value">{minutesLeft}</div>
                <div className="time-text">MINS</div>
            </div>
            <div className="time-container">
                <div className="time-value">{secondsLeft}</div>
                <div className="time-text">SECS</div>
            </div>
        </div>
    )
};

export default CountdownTimer;
