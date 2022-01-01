import { Grid } from "@mui/material";
import { MutableRefObject, useRef } from "react";
import { AudioPageProps, AudioElementProps, defaultPlayProperties } from "../services/audio/audio";

interface AudioPageDisplayProps {
    readonly page: AudioPageProps;
    readonly visible: boolean;

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
    return <>
        <Grid container className="w-full max-w-[115vh]">
            {[...page.values]
                .sort((lhs, rhs) => reorderedIndex(lhs.index) - reorderedIndex(rhs.index))
                .map((audioElt) => <Grid item xs={3} key={`audio-cell-${audioElt.index}`}>
                    <AudioCellDisplay audioElt={audioElt} {...props}/>
                </Grid>)
            }
        </Grid>
    </>
}

interface AudioCellDisplayProps {
    readonly audioElt: AudioElementProps;
    readonly visible: boolean;

    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}


const AudioCellDisplay = (props: AudioCellDisplayProps) => {

    const { 
        audioElt: { index, isOn, clip, playProperties },
        offColor, offOutline,
        onColor, onOutline,
        visible
    } = props;

    const audioRef = useRef<HTMLAudioElement>();
    const audio = audioRef.current;

    const { startTime } = {
        ...defaultPlayProperties,
        ...playProperties
    };

    if (audio) {

        if (isOn) {
            
            if(audio.paused)
            {
                audio.currentTime = Math.max(audio.currentTime, startTime);
                audio.play();
            }
        }
        else {
            audio.pause();
        }
    }

    return <>
        {visible && <div className="m-2 flex flex-col pt-1 pl-1">
            <div className={`${isOn ? onColor : offColor} ${isOn ? onOutline : offOutline} 
                rounded-lg text-white text-center flex flex-col justify-center items-center
                outline outline-3 p-4 italic
                h-28 sm:h-32 md:h-40 lg:h-52 xl:h-48 2xl:h-44
                max-h-[16vh]
                transition-colors`}
            >
                {
                    clip ? 
                    <>
                        <div className="xl:text-xl">{clip.title}</div>
                        <div className="">{clip.author}</div>
                    </> :
                    <div>-</div>
                }
            </div>
            <div className="mt-2 text-xs pl-2">PAD {(index - 1) % 16 + 1}</div>
        </div>}
        {clip && <audio ref={audioRef} src={clip.url} />}
        </>
}

export default AudioPageDisplay;