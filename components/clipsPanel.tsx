import { CircularProgress, Grid } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import ReplayIcon from '@mui/icons-material/Replay';
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/appContext";
import { AudioElementProps, defaultPlayProperties } from "../services/audio/audio";
import { ComponentColorScheme, PlayProgressColorScheme } from "./themes/theme";
import { AudioPlayEditableProgressProps, ClipEditData, ClipEditFormProps, ClipEditOverlay, PlayProgressEditProps, WaveformProps } from "./clipEdit";
import { isValidYoutubeIdOrUrl } from "../services/audio/youtube";
import { ifTrue } from "../services/core/utils";
import { getMusicFile } from "../services/core/firebase";
import { useAudioContext } from "../contexts/audioContext";

interface ClipsPanelProps {
    readonly elements: AudioElementProps[];
    readonly visible: boolean;

    readonly showPadTexts: boolean;

    readonly colorScheme: ComponentColorScheme;
    readonly progressColorScheme: PlayProgressColorScheme;
}

const reorderedIndex = (idx: number) => {

    const row = Math.floor((idx - 1) / 4);
    const col = (idx - 1) % 4;

    return 4 * (4 - row) + col;
}

const ClipsPanel = (props: ClipsPanelProps) => {
    const { elements } = props;

    const {
        controls: { volume1, volume2, volume3, volume4 }
    } = useAppContext();

    const volumes = [volume1, volume2, volume3, volume4];

    return <>
        <Grid container className="w-full">
            {elements
                .sort((lhs, rhs) => reorderedIndex(lhs.index) - reorderedIndex(rhs.index))
                .map((audioElt) => <Grid item xs={3} key={`audio-cell-${audioElt.index}`}>
                    <AudioCellDisplay audioElt={audioElt} volume={volumes[(audioElt.index - 1) % 4]} {...props}/>
                </Grid>)
            }
        </Grid>
    </>
}

interface AudioCellDisplayProps {
    readonly audioElt: AudioElementProps;
    readonly visible: boolean;

    readonly showPadTexts: boolean;

    readonly colorScheme: ComponentColorScheme;
    readonly progressColorScheme: PlayProgressColorScheme;

    readonly volume: number;
}


const AudioCellDisplay = (props: AudioCellDisplayProps) => {

    const { 
        audioElt: { index, isOn, clip, playProperties, name: clipName },
        colorScheme: {
            offColor, offOutline,
            onColor, onOutline
        },
        showPadTexts,
        progressColorScheme,
        visible,
        volume
    } = props;

    const { appReady, updateAudioElement, loadClip, clearClip } = useAppContext();
    const audioCtx = useAudioContext();

    const audioRef = useRef<HTMLAudioElement>();
    const audio = audioRef.current;

    const { startTime: startTimeProp, endTime: endTimeProp } = {
        ...defaultPlayProperties,
        ...playProperties
    };

    const [startTimeDisplay, setStartTimeDisplay] = useState<number>(startTimeProp);
    const [endTimeDisplay, setEndTimeDisplay] = useState<number>(endTimeProp);
    const [currentTimeDisplay, setCurrentTimeDisplay] = useState<number>(startTimeProp);

    const [edit, setEdit] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);


    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    const editCurrentTimeRef = useRef<boolean>(false);
    const editStartTimeRef = useRef<boolean>(false);
    const editEndTimeRef = useRef<boolean>(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout|null>(null);

    const [canPlay, setCanPlay] = useState<boolean>(true);

    const [spectrum, setSpectrum] = useState<Float32Array|null>(null);

    useEffect(() => {

        const capturedId = clip?.id;

        if (!appReady || loaded || !capturedId) {
            return;
        }

        setLoaded(false);
        setLoading(true);
        
        const { getClipSrc, clearClip, getSpectrumData } = audioCtx;

        getClipSrc(capturedId)
            .then((src) => {
                setLoaded(true);
                setLoading(false);
                audioRef.current.src = src;

                getSpectrumData(capturedId)
                    .then(sd => {
                        setSpectrum(sd);
                    })
            })

        return () => {
            clearClip(capturedId);
        }

    }, [appReady, clip?.id]);

    let progressComponent = undefined;

    if (startTimeDisplay !== startTimeProp && !editStartTimeRef.current) {
        setStartTimeDisplay(startTimeProp);
    }

    if (endTimeDisplay !== endTimeProp && !editEndTimeRef.current) {
        setEndTimeDisplay(endTimeProp);
    }


    let audioPlayProps: AudioPlayProgressProps = undefined;
    let editProgressProps: PlayProgressEditProps = undefined;
    let waveformProps: WaveformProps = undefined;

    let resetClip: undefined|(() => void);
    let deleteClip: undefined|(() => void);
    let dragClip: undefined|(() => void);

    if (clip && audio) {

        audio.volume = volume;
        const { duration }  = clip;

        resetClip = () => {
            audio.currentTime = startTimeProp;
            setCurrentTimeDisplay(startTimeProp);
        };

        deleteClip = () => {
            clearClip(index);
            setLoaded(false);
        }

        // Rounding precision can cause some weird bug where audio.currentTime is rounded down and is still lower than startTimeProps
        if (audio.currentTime < (startTimeProp - 0.01)) {
            resetClip();
        }

        if (duration - audio.currentTime < endTimeProp) {
            audio.pause();

            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
            
            setCanPlay(false);
        }

        if (isOn) {   

            if (canPlay) {

                if (!refreshIntervalRef.current) {
                    refreshIntervalRef.current = setInterval(() => {

                        if (!editCurrentTimeRef.current) {
                            setCurrentTimeDisplay(audio.currentTime);
                        }

                    }, 100);
                }

                if(audio.paused) {
                    audio.play();
                }

            }
        }
        else {

            if (!canPlay) {
                setCanPlay(true);
                setCurrentTimeDisplay(startTimeProp);
                audio.currentTime = startTimeProp;
            }

            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }

            audio.pause();
        }


        const onStartTimeStartEditing = () => editStartTimeRef.current = true;
        const onStartTimeChanged = (st: number) => setStartTimeDisplay(st);
        const onStartTimeCommitted = () => {
            editStartTimeRef.current = false;
            updateAudioElement(index, {
                playProperties: {
                    startTime: startTimeDisplay
                }
            })
        };

        const onEndTimeStartEditing = () => editEndTimeRef.current = true;
        const onEndTimeChanged = (et: number) => setEndTimeDisplay(et);
        const onEndTimeCommitted = () => {
            editEndTimeRef.current = false;
            updateAudioElement(index, {
                playProperties: {
                    endTime: endTimeDisplay
                }
            });
        }

        const onCurrentTimeStartEditing = () => editCurrentTimeRef.current = true;
        const onCurrentTimeChanged = (ct: number) => setCurrentTimeDisplay(ct);
        const onCurrentTimeCommitted = (): void => {
            editCurrentTimeRef.current = false;
            audio.currentTime = currentTimeDisplay;
        };

        const setCurrentTime = (ct: number) => {
            setCurrentTimeDisplay(ct);
            audio.currentTime = ct;
        }

        audioPlayProps = { 
            progressColorScheme, duration,
            startTime: startTimeDisplay, endTime: endTimeDisplay, currentTime: currentTimeDisplay,  
        };

        editProgressProps = {
            onStartTimeStartEditing, onStartTimeChanged, onStartTimeCommitted,
            onEndTimeStartEditing, onEndTimeChanged, onEndTimeCommitted,
            onCurrentTimeStartEditing, onCurrentTimeChanged, onCurrentTimeCommitted, setCurrentTime
        };

        waveformProps = {
            spectrumData: spectrum,
        }

        progressComponent = <AudioPlayProgress {...audioPlayProps} />
    }

    const onClipEditFormSubmitted = async (data: ClipEditData) => {
        
        const { idOrUrl } = data;
        updateAudioElement(index, {
            name: data.name
        });

        if (isValidYoutubeIdOrUrl(idOrUrl) && idOrUrl !== clip?.id) {
            await loadClip(index, idOrUrl);
        }
    };

    const clipEditFormProps: ClipEditFormProps = {
        data: {
            name: clipName,
            idOrUrl: clip?.id ?? ""
        },
        onClipEditFormSubmitted
    }


    const progressEdit: AudioPlayEditableProgressProps|undefined = (editProgressProps && audioPlayProps) ? {
        playProgressEdit: editProgressProps,
        audioPlayProgress: audioPlayProps,
        waveform: waveformProps
    } : undefined;

    return <>
        {visible && <div className="m-2 flex flex-col pt-1 pl-1">
            <div className={`${isOn ? onColor : offColor} ${isOn ? onOutline : offOutline} 
                rounded-lg text-white text-center flex flex-col justify-center items-center
                outline outline-3 p-4 italic
                h-28 sm:h-32 md:h-40 lg:h-52 xl:h-48 2xl:h-44
                max-h-[25vh]
                transition-colors relative`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {
                    (!loading) ?
                        (clip ? 
                        <>
                            <div className="xl:text-xl">{clipName}</div>
                            {progressComponent}
                        </> :
                        <div>-</div>)
                    :
                    <div>
                        <CircularProgress />
                    </div>
                }
                <div className={`absolute w-full h-full rounded-lg
                    transition-opacity duration-500
                    bg-gray-500/60
                    grid grid-cols-2 grid-rows-2
                    ${hovered ? 'opacity-100' : 'opacity-0'}`}
                >
                    <AudioCellDisplayButton onClick={() => setEdit(true)}>
                        <EditIcon className="w-full h-full" />
                    </AudioCellDisplayButton>
                    <AudioCellDisplayButton onClick={deleteClip} disabled={isOn}>
                        <DeleteIcon className="w-full h-full" />
                    </AudioCellDisplayButton>
                    <AudioCellDisplayButton onClick={resetClip}>
                        <ReplayIcon className="w-full h-full" />
                    </AudioCellDisplayButton>
                    <AudioCellDisplayButton onClick={dragClip}>
                        <SettingsOverscanIcon className="w-full h-full" />
                    </AudioCellDisplayButton>
                </div>
            </div>
            {showPadTexts && <div className="mt-2 text-xs pl-2">PAD {(index - 1) % 16 + 1}</div>}
        </div>}
        {clip && <audio ref={audioRef} />}
        {edit && <ClipEditOverlay
            visible={edit} onExit={() => setEdit(false)}
            clipEdit={clipEditFormProps}
            progressEdit={progressEdit}
        />}
    </>
}


interface AudioCellDisplayButtonProps {
    readonly children: JSX.Element;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
}

const AudioCellDisplayButton = (props: AudioCellDisplayButtonProps) => {

    const { children, onClick, disabled } = props;

    const [hovered, setHovered] = useState<boolean>(false);

    const enabled = onClick !== undefined && !(disabled ?? false);

    return <div className={`center-child
        ${ifTrue(hovered && enabled, 'bg-white/20')}
        transition-color duration-300
        ${ifTrue(enabled, 'hover:cursor-pointer')}
        rounded-xl m-1
    `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
    >
        <div className={`w-2/3 h-2/3
            duration-300
            transition-opacity
            ${enabled ? (hovered ? 'opacity-100' : 'opacity-50') : 'opacity-10'}
        `}>
            {children}
        </div>
    </div>;
}

export interface AudioPlayProgressProps {
    readonly progressColorScheme: PlayProgressColorScheme;
    readonly startTime: number;
    readonly endTime: number;
    readonly currentTime: number;
    readonly duration: number;
}

const AudioPlayProgress = (props: AudioPlayProgressProps) => {

    const {
        progressColorScheme: { inactiveColor, playedColor, notPlayedColor },
        startTime, endTime, currentTime, duration
    } = props;

    const trackLeft = `${100.0 * startTime / duration}%`;
    const trackRight = `${100.0 * endTime / duration}%`;
    const playedLeft = trackLeft;
    const playedRight = `${100.0 * Math.max(duration - currentTime, endTime) / duration}%`;

    return <>
        <div className={`
            w-full h-[0.8em] absolute bottom-0
            rounded-t rounded-b-lg overflow-hidden
            ${inactiveColor}
            transition-transform duration-300`
        }>
            <div className={`h-full ${notPlayedColor} absolute`} style={{
                left: trackLeft,
                right: trackRight
            }}></div>
            <div className={`h-full ${playedColor} absolute transition duration-100`} style={{
                left: playedLeft,
                right: playedRight
            }}></div>
        </div>
    </>
}

export default ClipsPanel;