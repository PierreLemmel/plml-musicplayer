import { AudioPageProps, AudioElementProps } from "../audio/audioManagement";

interface AudioPageDisplayProps {
    readonly page: AudioPageProps;
}

const AudioPageDisplay = (props: AudioPageDisplayProps) => {
    const { page } = props;

    return <div>
        AudioPageDisplay
        <div className="grid grid-cols-4 grid-rows-4">
            {page.values.map((audioElt, i) => <AudioCellDisplay key={`audio-cell-${i}`} audioElt={audioElt} />)}
        </div>
    </div>;
}

interface AudioCellDisplayProps {
    readonly audioElt: AudioElementProps;
}

const AudioCellDisplay = (props: AudioCellDisplayProps) => {
    const { index, isOn } = props.audioElt;

    return <div>
        {index}: {isOn ? "On" : "Off"}
    </div>;
}

export default AudioPageDisplay;