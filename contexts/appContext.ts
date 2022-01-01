import { User } from "firebase/auth";
import { createContext, useContext } from "react";
import { AudioPageProps, getDefaultAudioPage } from "../services/audio/audio";
import { MidiProps } from "../services/audio/midi";

export interface AppContextProps {
    readonly midi: MidiProps|null;
    readonly user: User|null;
    readonly showName: string;
    readonly pages: {
        readonly page1: AudioPageProps,
        readonly page2: AudioPageProps,
        readonly page3: AudioPageProps,
        readonly page4: AudioPageProps,
    }
    readonly controls: {
        readonly volume1: number;
        readonly volume2: number;
        readonly volume3: number;
        readonly volume4: number;
    },
    readonly appReady: boolean;
}


export const AppContext = createContext<AppContextProps>({
    midi: null,
    user: null,
    showName: "Default",
    pages: {
        page1: getDefaultAudioPage(1),
        page2: getDefaultAudioPage(2),
        page3: getDefaultAudioPage(3),
        page4: getDefaultAudioPage(4),
    },
    controls: {
        volume1: 100.0,
        volume2: 100.0,
        volume3: 100.0,
        volume4: 100.0
    },
    appReady: false
});

export const useAppContext = () => {
    return useContext(AppContext);
}