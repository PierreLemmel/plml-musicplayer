export interface AudioPageProps {
    readonly values: AudioElementProps[]
}

export interface AudioElementProps {
    readonly index: number;
    readonly isOn: boolean;
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

    return {
        values: values
    }
}