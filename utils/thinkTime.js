import { sleep } from 'k6';

export function thinkTime(minSeconds = 1, maxSeconds = 3) {
    const delay = minSeconds + Math.random() * (maxSeconds - minSeconds);
    sleep(delay);
}
