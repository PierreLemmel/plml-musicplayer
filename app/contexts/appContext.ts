import { createContext, useContext } from "react";
import { AudioPageProps, getDefaultAudioPage } from "../audio/audioManagement";
import { MidiProps } from "../audio/midi";

export interface AppContextProps {
    readonly midi: MidiProps |null;

    readonly pages: {
        readonly page1: AudioPageProps,
        readonly page2: AudioPageProps,
        readonly page3: AudioPageProps,
        readonly page4: AudioPageProps,
    }
}

export const getDefaultAppContext = (): AppContextProps => {
    return {
        midi: null,
        pages: {
            page1: getDefaultAudioPage(1),
            page2: getDefaultAudioPage(2),
            page3: getDefaultAudioPage(3),
            page4: getDefaultAudioPage(4),
        }
    }
}

export const AppContext = createContext<AppContextProps>(getDefaultAppContext());

export const useAppContext = () => {
    return useContext(AppContext);
}