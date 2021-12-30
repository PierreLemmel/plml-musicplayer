import { Grid } from "@mui/material";
import { useRef } from "react";
import { AudioPageProps, AudioElementProps } from "../audio/audioManagement";
import YouTube from 'react-youtube';

interface AudioPageDisplayProps {
    readonly page: AudioPageProps;

    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}

const reorderedIndex = (idx: number) => {

    const row = Math.floor((idx - 1) / 4);
    const col = (idx - 1) % 4;

    return 4 * (4 - row) + col;
}

const AudioPageDisplay = (props: AudioPageDisplayProps) => {
    const { page } = props;

    return <Grid container className="w-full">
        {[...page.values]
            .sort((lhs, rhs) => reorderedIndex(lhs.index) - reorderedIndex(rhs.index))
            .map((audioElt, i) => <Grid item xs={3} key={`audio-cell-${i}`}>
                <AudioCellDisplay audioElt={audioElt} {...props}/>
            </Grid>)
        }
    </Grid>
}

interface AudioCellDisplayProps {
    readonly audioElt: AudioElementProps;

    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}

interface AudioState {
    audio?: HTMLAudioElement
}

const AudioCellDisplay = (props: AudioCellDisplayProps) => {
    const { 
        audioElt: { index, isOn, audioClip },
        offColor, offOutline,
        onColor, onOutline
    } = props;

    const audioRef = useRef<AudioState>({

    });

    const audioState = audioRef.current;
    if (audioClip) {

        if (!audioState.audio) {
            
        }
    }
    else {
        
    }

    return <div className="m-2 flex flex-col pt-1 pl-1">
        <div className={`${isOn ? onColor : offColor} ${isOn ? onOutline : offOutline} rounded-lg text-white text-center flex flex-row justify-center items-center h-28 sm:h-32 md:h-40 lg:h-52 xl:h-48 2xl:h-44 outline outline-3`}>
            <div className="text-lg p-4">{audioClip?.title ?? "-"}</div>
        </div>
        <div className="mt-2 text-xs pl-2">PAD {index % 16}</div>
        {(audioClip?.type === "YoutubeMusic") && <div>{audioClip.title}</div>}
    </div>
}

export default AudioPageDisplay;