import { Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { AudioPageProps } from '../audio/audioManagement';
import { MidiProps } from '../audio/midi';
import AudioPageDisplay from '../components/audioPageDisplay';
import { useAppContext } from '../contexts/appContext'
import { useHotKeyContext } from '../contexts/hotkeysContext';

type AudioPageColorInfo = {
    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}

const pagesColor: AudioPageColorInfo[] = [
    {
        offColor: "bg-gray-400",
        offOutline: "outline-gray-500",
        onColor: "bg-amber-500",
        onOutline: "outline-amber-600"
    },
    {
        offColor: "bg-violet-500",
        offOutline: "outline-violet-600",
        onColor: "bg-red-600",
        onOutline: "outline-red-700"
    },
    {
        offColor: "bg-teal-500",
        offOutline: "outline-teal-600",
        onColor: "bg-pink-500",
        onOutline: "outline-pink-600"
    },
    {
        offColor: "bg-rose-300",
        offOutline: "outline-rose-400",
        onColor: "bg-emerald-400",
        onOutline: "outline-emerald-500"
    },
]

const IndexPage = () => {

    const [pageIndex, setPageIndex] = useState<number>(1);

    const {
        midi,
        pages: { page1, page2, page3, page4 }
    } = useAppContext();

    const getPage = (): AudioPageProps => {
        switch(pageIndex) {
            case 1: return page1;
            case 2: return page2;
            case 3: return page3;
            case 4: return page4;
        }
    }

    const pageColor = pagesColor[pageIndex - 1];

    const hkContext = useHotKeyContext();
    hkContext.setHotkey("PageUp", () => {
        if (pageIndex < 4) {
            setPageIndex(pageIndex + 1)
        }
    });

    hkContext.setHotkey("PageDown", () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    });

    hkContext.setHotkey("&", () => setPageIndex(1));
    hkContext.setHotkey("é", () => setPageIndex(2));
    hkContext.setHotkey("\"", () => setPageIndex(3));
    hkContext.setHotkey("'", () => setPageIndex(4));
    

    return <div className="p-3" >
        <div className="w-full xl:w-2/3 2xl:w-1/2 flex flex-col justify-center items-center">
            <Pagination count={4} page={pageIndex} onChange={(e, val) => setPageIndex(val)} className="my-3" />
            <AudioPageDisplay page={getPage()} {...pageColor} />
        </div>
        { midi ? <MidiDevice midi={midi} /> : <NoMidiDevice /> }
    </div>
}

const NoMidiDevice = () => <div>No Midi Device</div>

interface MidiDeviceProps {
    readonly midi: MidiProps;
}

const MidiDevice = (props: MidiDeviceProps) => {

    const { inputName, manufacturer } = props.midi;

    return <div className="mt-4 mx-2">
        <div>Midi device: {inputName}</div>
        <div>Manufacturer: {manufacturer}</div>
    </div>;
}

export default IndexPage