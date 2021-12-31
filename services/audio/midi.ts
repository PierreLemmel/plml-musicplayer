export interface MidiProps {
    readonly inputName: string;
    readonly manufacturer: string;
}

interface NoteOn {
    readonly type: "NoteOn";
    readonly key: number;
    readonly velocity: number;
}

interface NoteOff {
    readonly type: "NoteOff";
    readonly key: number;
    readonly velocity: number;
}

interface PolyPhonicKeyPressure {
    readonly type: "PolyphonicKeyPressure";
    readonly key: number;
    readonly amount: number;
}

interface ControlChange {
    readonly type: "ControlChange";
    readonly controllerNumber: number;
    readonly controllerValue: number;
}

interface ProgramChange {
    readonly type: "ProgramChange";
    readonly programNumber: number;
}

interface ChannelPressure {
    readonly type: "ChannelPressure";
    readonly amount: number;
}

interface NoMessage {
    readonly type: "NoMessage";
}

export type MidiMessage = NoteOn
    | NoteOff
    | PolyPhonicKeyPressure
    | ControlChange
    | ProgramChange
    | ChannelPressure
    | NoMessage;

export const getMidiMessage = (data: Uint8Array): MidiMessage => {

    const status = data[0];
    const data1 = data[1];
    const data2 = data.length > 2 ? data[2] : 0;

    if (status < 0x80) {

    }
    else if (status < 0x90) {
        return {
            type: "NoteOff",
            key: data1,
            velocity: data2
        }
    }
    else if (status < 0xA0) {
        return {
            type: "NoteOn",
            key: data1,
            velocity: data2
        }
    }
    else if (status < 0xB0) {
        return {
            type: "PolyphonicKeyPressure",
            key: data1,
            amount: data2
        }
    }
    else if (status < 0xC0) {
        return {
            type: "ControlChange",
            controllerNumber: data1,
            controllerValue: data2
        }
    }
    else if (status < 0xD0) {
        return {
            type: "ProgramChange",
            programNumber: data1
        }
    }
    else if (status < 0xE0) {
        return {
            type: "ChannelPressure",
            amount: data1
        }
    }

    return {
        type: "NoMessage"
    }
}