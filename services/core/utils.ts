export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))


export const waitWhile = async (predicate: () => boolean, maxTimeMs?: number, timeoutMsg?: string): Promise<void> => {

    let time = 0;
    const timeout = maxTimeMs ?? 10_000;

    while (predicate()) {
        await delay(100);

        if (time > timeout) {
            throw new Error(timeoutMsg ?? "Task timedout");
        }
    }
}

export const waitUntil = async (predicate: () => boolean, maxTimeMs?: number, timeoutMsg?: string): Promise<void> => {
    await waitWhile(() => !predicate(), maxTimeMs, timeoutMsg);
}

export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function clamp(val: number, min:number, max: number) {
    return val > min ? (val < max ? val : max) : min;
}

export function clamp01(val: number) {
    return clamp(val, 0.0, 1.0);
}

export function formatMinuteSeconds(inputSeconds: number) {

    const minutes = Math.floor(inputSeconds / 60.0);
    const seconds = Math.floor(inputSeconds % 60.0);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function range(length: number) {
    return new Array(length).fill(0).map((val, i) => i);
}

export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
}

export function ifTrue(value: boolean, str: string): string {
    return value ? str : "";
}