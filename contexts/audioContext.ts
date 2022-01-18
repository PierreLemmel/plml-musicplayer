import { createContext, useContext } from "react";
import { getMusicFile } from "../services/core/firebase";
import { delay, waitWhile } from "../services/core/utils";

export interface AppAudioContextProps {
    readonly getClipSrc: (id: string) => Promise<string>;
    readonly clearClip: (id: string) => Promise<void>;
    readonly getSpectrumData: (id: string) => Promise<Float32Array>;
}

export const AppAudioContext = createContext<AppAudioContextProps|null>(null);

export const useAudioContext = () => {
    return useContext(AppAudioContext);
}


interface AppAudioMapData {
    spectrumData: Float32Array|null;
    src: string;
}

export class AppAudioManager implements AppAudioContextProps {
    
    private readonly ctx: AudioContext;
    private readonly clipMap: Map<string, AppAudioMapData> = new Map();

    constructor(context: AudioContext) {
        this.ctx = context;
    }

    decodeAudioData = (data: ArrayBuffer, callback: (audioBuffer: AudioBuffer) => void) => {

        this.ctx.decodeAudioData(data,
            result => callback(result),
            err => console.error(err)
        );
    }

    getClipSrc = async (id: string) => {

        console.info(`Setting up clip '${id}'`);

        if (!this.clipMap.has(id)) {
            const rawData = await getMusicFile(id);
            
            const blob = new Blob([rawData], { type: "audio/mpeg3" });
            const src = window.URL.createObjectURL(blob);

            const mapData = {
                spectrumData: null,
                src
            };
            this.clipMap.set(id, mapData);

            this.ctx.decodeAudioData(rawData, audioData => {
                mapData.spectrumData = audioData.getChannelData(0);
                console.info(`Setup done for clip '${id}'`);
            }, err => console.error(err));
        }

        return this.clipMap.get(id).src;
    }

    clearClip = async (id: string) => {
        console.info(`Cleaning up resources for clip '${id}'`);

        if (this.clipMap.has(id)) {
            const mapData = this.clipMap.get(id);

            window.URL.revokeObjectURL(mapData.src);

            this.clipMap.delete(id);
        }
    };

    getSpectrumData = async (id: string) => {
        if (this.clipMap.has(id)) {

            const mapData = this.clipMap.get(id);

            await waitWhile(() => mapData.spectrumData === null);

            return mapData.spectrumData;
        }
    }
}