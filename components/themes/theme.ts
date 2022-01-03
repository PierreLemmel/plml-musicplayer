export interface ComponentColorScheme {
    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}

export const grayAmberScheme: ComponentColorScheme = {
    offColor: "bg-gray-400",
    offOutline: "outline-gray-500",
    onColor: "bg-amber-500",
    onOutline: "outline-amber-600"
}

export const violetRedScheme: ComponentColorScheme = {
    offColor: "bg-violet-500",
    offOutline: "outline-violet-600",
    onColor: "bg-red-600",
    onOutline: "outline-red-700"
}

export const tealPinkScheme: ComponentColorScheme = {
    offColor: "bg-teal-500",
    offOutline: "outline-teal-600",
    onColor: "bg-pink-500",
    onOutline: "outline-pink-600"
}

export const roseEmeraldScheme: ComponentColorScheme = {
    offColor: "bg-rose-300",
    offOutline: "outline-rose-400",
    onColor: "bg-emerald-400",
    onOutline: "outline-emerald-500"
}


export interface PlayProgressColorScheme {
    readonly inactiveColor: string;
    readonly notPlayedColor: string;
    readonly playedColor: string;

    readonly borderColor: string;
}

export const defaultPlayProgressColorScheme: PlayProgressColorScheme = {
    inactiveColor: "bg-stone-900",
    notPlayedColor: "bg-stone-600",
    playedColor: "bg-stone-300",

    borderColor: "border-stone-500"
}