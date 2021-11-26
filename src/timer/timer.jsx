import { useEffect, useState } from "react";
import { Observable, Subject } from 'rxjs';
import { buffer, map, filter, debounceTime } from 'rxjs/operators'
import styles from './timer.module.css'

const Timer = () => {
    const [time, setTime] = useState (0)
    const [status, setStatus] = useState('stop');

    const handleStart = () => {
        setStatus('start');
    }
    const handleReset = () => {
        if (status === 'start')
            setStatus('reset');
        setTime(0);
    }
    const handleStop = () => {
        setStatus('stop');
        setTime(0);
    }
    const handleWait = () => {
        onWait$.next();
    }

    const onWait$ = new Subject()

    onWait$.pipe(
        buffer(onWait$.pipe(debounceTime(300))),
        map(item => item.length),
        filter(item => item === 2),
    ).subscribe(() => {
        setStatus('wait');
    })

    useEffect(() => {
        if (status === 'start') {
            const timer$ = new Observable((observer) => {
                const startTimer = setInterval(() => {
                    observer.next();
                }, 1000);

                return () => {
                    clearInterval(startTimer);
                };
            });
            const observer = {
                next: () => {
                    setTime((time) => time + 1)
                },
                error: () => {
                    console.log('error')
                },
                complete: () => {
                    console.log('observer complete')
                }
            };
            const subscription = timer$.subscribe(observer);
            return (() => {
                subscription.unsubscribe();
            })
        }
        if (status === 'reset') {
            setStatus('start');
        }
    }, [status])

    const timeData = {
        seconds: (time%60),
        minutes: Math.floor(time/60),
        hours: Math.floor(time/3600),
    }

    return (
        <div className={styles.container}>
            <div className={styles.timerDisplay}>{String(timeData.hours).padStart(2, "0")} : {String(timeData.minutes).padStart(2, "0")} : {String(timeData.seconds).padStart(2, "0")}</div>
            <div className={styles.btnWrapper}>
                <button className={styles.startBtn} onClick={status==='start' ? handleStop : handleStart}>{status==='start' ? `stop` : `start`}</button>
                <button className={styles.resetBtn} onClick={handleReset}>reset</button>
                <button className={styles.waitBtn} onClick={handleWait}>wait</button>
            </div>
        </div>
    )
}

export default Timer