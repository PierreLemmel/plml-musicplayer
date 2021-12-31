export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function clamp(val: number, min:number, max: number) {
    return val > min ? (val < max ? val : max) : min;
}