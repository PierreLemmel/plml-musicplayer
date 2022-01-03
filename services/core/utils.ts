export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function clamp(val: number, min:number, max: number) {
    return val > min ? (val < max ? val : max) : min;
}

export function formatMinuteSeconds(inputSeconds: number) {

    const minutes = Math.floor(inputSeconds / 60.0);
    const seconds = Math.floor(inputSeconds % 60.0);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}