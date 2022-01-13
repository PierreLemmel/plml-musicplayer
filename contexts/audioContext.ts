import { createContext, useContext } from "react";

export interface AppAudioContextProps {
    readonly decodeAudioData: (data: ArrayBuffer, callback: (audioBuffer: AudioBuffer) => void) => void;
}

export const AppAudioContext = createContext<AppAudioContextProps>({
    decodeAudioData: () => {}
});

export const useAudioContext = () => {
    return useContext(AppAudioContext);
}