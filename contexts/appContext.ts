import { User } from "firebase/auth";
import { createContext, useContext } from "react";
import { AudioElementProps, getDefaultElements, PlayProperties } from "../services/audio/audio";
import { MidiProps } from "../services/audio/midi";

export interface AudioElementUpdateProps {
    readonly name?: string;
    readonly playProperties?: Partial<PlayProperties>;
}

export interface AppContextProps {
    readonly midi: MidiProps|null;
    readonly user: User|null;
    readonly showName: string;
    readonly audioElements: AudioElementProps[],
    readonly controls: {
        readonly volume1: number;
        readonly volume2: number;
        readonly volume3: number;
        readonly volume4: number;
    },
    readonly appReady: boolean;

    readonly updateAudioElement: (index: number, data: Partial<AudioElementUpdateProps>) => void;
}


export const AppContext = createContext<AppContextProps>({
    midi: null,
    user: null,
    showName: "Default",
    audioElements: getDefaultElements(),
    controls: {
        volume1: 100.0,
        volume2: 100.0,
        volume3: 100.0,
        volume4: 100.0
    },
    appReady: false,
    updateAudioElement: (index: number, data: Partial<AudioElementUpdateProps>) => {}
});

export const useAppContext = () => {
    return useContext(AppContext);
}