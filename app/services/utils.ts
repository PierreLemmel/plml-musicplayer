export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}