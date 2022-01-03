import { Timestamp } from "firebase/firestore";
import { AudioClip, PlayProperties } from "../audio/audio";

export interface AudioElementsMap {
    readonly [index: number]: AudioElementDataModel
}

export interface AudioElementDataModel {
    readonly name: string;
    readonly clip: AudioClip;
    readonly playProperties: Partial<PlayProperties>;
}

export interface ShowDataModel {
    readonly name: string;
    readonly creationTime: Timestamp;
    readonly modificationTime: Timestamp;
    readonly elements: AudioElementsMap;
}