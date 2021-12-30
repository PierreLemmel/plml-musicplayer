import { createContext, useContext } from "react";

export interface HotkeysContextProps {
    readonly setHotkey: (key: string, handler: () => void) => void;
}

export const HotKeyContext = createContext<HotkeysContextProps>({
    setHotkey: () => {}
});

export const useHotKeyContext = () => {
    return useContext(HotKeyContext);
}