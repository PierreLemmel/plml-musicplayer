export interface AudioElementProps {
    readonly index: number;
    readonly isOn: boolean;

    readonly name?: string;
    readonly clip?: AudioClip;
    readonly playProperties: Partial<PlayProperties>;
}

export const getDefaultElements = (): AudioElementProps[] => {
    return new Array(64)
        .fill(0)
        .map((_, i) => {
            return {
                index: i + 1,
                isOn: false,
                playProperties: { }
            }
        });
}

interface AudioClipBase {
    readonly title: string;
    readonly author: string;
    readonly url: string;
    readonly id: string;
    readonly duration: number;
}

export interface YoutubeAudioClip extends AudioClipBase {
    readonly source: "Youtube";
}

export type AudioClip = YoutubeAudioClip;


type PlayMode = "Normal"|"Loop";
export interface PlayProperties {

    /**
     * Time in seconds from start.
     * Default is 0.
     */
    readonly startTime: number;

    /**
     * Time in seconds to end.
     * Default is 0.
     */
    readonly endTime: number;

    /**
     * Clip volume, between 0 and 1
     * Default is 1
     */
    readonly volume: number;

    /**
     * Clip speed, between -2.5 and 2.5
     * Default is 1
     */
    readonly speed: number;

    /**
     * Play mode.
     * Default is Normal.
     */
    readonly mode: PlayMode;
}

export const defaultPlayProperties: PlayProperties = {
    startTime: 0.0,
    endTime: 0.0,
    volume: 1.0,
    speed: 1.0,
    mode: "Normal"
}