import { Timestamp } from "firebase/firestore";
import { AudioClip, PlayProperties } from "../audio/audio";

export interface ShowPageDataModel {
    readonly [index: string]: {
        readonly clip: AudioClip;
        readonly playProperties: Partial<PlayProperties>;
    }
}

export interface ShowDataModel {
    readonly name: string;
    readonly creationTime: Timestamp;
    readonly modificationTime: Timestamp;
    readonly pages: {
        readonly page1: ShowPageDataModel,
        readonly page2: ShowPageDataModel,
        readonly page3: ShowPageDataModel,
        readonly page4: ShowPageDataModel
    }
}