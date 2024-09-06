import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { formatDateTimePadStart } from "../helpers/common-helper";

dayjs.extend(duration);
dayjs.extend(utc);

interface CounterType {
    displayValue?: string;
    label: string;
}

interface CountdownTimerProps {
    targetDate: Dayjs;
    countDownText?: string;
}

const Counter = ({ displayValue, label }: CounterType) => (
    <div className="counter">
        <h2>{label}</h2>
        <div>{displayValue}</div>
    </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, countDownText = "COUNTDOWN" }) => {
    const [timeLeft, setTimeLeft] = useState({
        DAYS: "00",
        HOURS: "00",
        MINS: "00",
        SECS: "00",
    });

    useEffect(() => {
        const updateTimer = () => {
            const now = dayjs.utc();

            if (targetDate.diff(now, "s") <= 0) {
                clearInterval(intervalId);
                return;
            }

            const remainingTime = dayjs.duration(targetDate.diff(now));
            setTimeLeft({
                DAYS: formatDateTimePadStart(Math.floor(remainingTime.asDays())),
                HOURS: formatDateTimePadStart(remainingTime.hours()),
                MINS: formatDateTimePadStart(remainingTime.minutes()),
                SECS: formatDateTimePadStart(remainingTime.seconds()),
            });
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return (
        <div className="count-down-timer">
            <div className="container">
                <div className="counter-wrapper">
                    <Counter label={countDownText} />
                    {Object.entries(timeLeft).map(([unit, value], index) => (
                        <Counter key={index} displayValue={value} label={unit} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
