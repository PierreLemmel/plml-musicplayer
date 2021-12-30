export interface AudioPageProps {
    readonly values: AudioElementProps[]
}

export interface AudioElementProps {
    readonly index: number;
    readonly isOn: boolean;

    readonly audioClip?: AudioClip;
}

export const getDefaultAudioPage = (page: number): AudioPageProps => {

    const values: AudioElementProps[] = new Array(16)
        .fill(0)
        .map((_, i) => {
            return {
                index: (page - 1) * 16 + i + 1,
                isOn: false
            };
        })

    values[12] = {
        ...values[12],
        audioClip: {
            type: "YoutubeMusic",
            key: "9apSSkjgUOI",
            title: "La responsabilité des rêves"
        }
    }

    return {
        values: values
    }
}

interface AudioClipBase {
    readonly key: string;
    readonly title: string;
}

interface YoutubeMusicAudio extends AudioClipBase {
    readonly type: "YoutubeMusic";
}

type AudioClip = YoutubeMusicAudio;