export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

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