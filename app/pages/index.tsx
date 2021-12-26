import Link from 'next/link'
import { useState } from 'react';
import { AudioPageProps } from '../audio/audioManagement';
import { MidiProps } from '../audio/midi';
import AudioPageDisplay from '../components/audioPageDisplay';
import { useAppContext } from '../contexts/appContext'

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

    return <div className="">
        { midi ? <MidiDevice midi={midi} /> : <NoMidiDevice /> }
        <AudioPageDisplay page={getPage()} />
    </div>
}

const NoMidiDevice = () => <div>No Midi Device</div>

interface MidiDeviceProps {
    readonly midi: MidiProps;
}

const MidiDevice = (props: MidiDeviceProps) => {

    const { inputName, manufacturer } = props.midi;

    return <div>
        <div>{inputName}</div>
        <div>{manufacturer}</div>
    </div>;
}

export default IndexPage