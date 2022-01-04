import { createContext, useContext } from "react";

export interface HotkeysContextProps {
    readonly setHotkey: (key: string, handler: () => void) => void;
    readonly unsetHotkey: (key: string) => void;
}

export const HotKeyContext = createContext<HotkeysContextProps>({
    setHotkey: () => {},
    unsetHotkey: () => {},
});

export const useHotKeyContext = () => {
    return useContext(HotKeyContext);
}