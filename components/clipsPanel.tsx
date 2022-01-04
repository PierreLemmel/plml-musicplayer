import { Grid } from "@mui/material";
import { DragEvent, useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/appContext";
import { useHotKeyContext } from "../contexts/hotkeysContext";
import { AudioElementProps, defaultPlayProperties } from "../services/audio/audio";
import { clamp, clamp01, formatMinuteSeconds } from "../services/core/utils";
import Overlay from "./overlay";
import { ComponentColorScheme, PlayProgressColorScheme } from "./themes/theme";

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

    const audioRef = useRef<HTMLAudioElement>();
    const audio = audioRef.current;

    const [currentTime, setCurrentTime] = useState<number>(playProperties.startTime ?? 0);
    const refreshIntervalRef = useRef<NodeJS.Timeout|null>(null);

    const [canPlay, setCanPlay] = useState<boolean>(true);

    let progressComponent = undefined;

    if (clip && audio) {

        const { startTime, endTime } = {
            ...defaultPlayProperties,
            ...playProperties
        };

        audio.volume = volume;

        if (currentTime < startTime) {
            audio.currentTime = startTime;
            setCurrentTime(startTime);
        }


        if (isOn) {
                        
            if (canPlay) {

                if (!refreshIntervalRef.current) {
                    refreshIntervalRef.current = setInterval(() => {
                        setCurrentTime(audio.currentTime);
                        if (duration - audio.currentTime < endTime) {
                            audio.pause();
                            clearInterval(refreshIntervalRef.current);
                            refreshIntervalRef.current = null;
                            setCanPlay(false);
                        }
                    }, 100);
                }

                if(audio.paused)
                {
                    audio.play();
                }

            }
        }
        else {

            if (!canPlay) {
                setCanPlay(true);
                setCurrentTime(startTime);
                audio.currentTime = startTime;
            }

            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }

            audio.pause();
        }

        const { duration }  = clip;
        const onStartTimeChanged = (st: number): void => console.log(st);
        const onEndTimeChanged = (et: number): void => console.log(et);

        const onCurrentTimeChanged = (ct: number): void => {
            audio.currentTime = ct;
            setCurrentTime(ct);
        };

        progressComponent = <AudioPlayProgress
            {...{ progressColorScheme, startTime, endTime, currentTime, duration}}
            {...{onStartTimeChanged, onEndTimeChanged, onCurrentTimeChanged}}
        />
    }

    return <>
        {visible && <div className="m-2 flex flex-col pt-1 pl-1">
            <div className={`${isOn ? onColor : offColor} ${isOn ? onOutline : offOutline} 
                rounded-lg text-white text-center flex flex-col justify-center items-center
                outline outline-3 p-4 italic
                h-28 sm:h-32 md:h-40 lg:h-52 xl:h-48 2xl:h-44
                transition-colors relative`}
            >
                {
                    clip ? 
                    <>
                        <div className="xl:text-xl">{clipName}</div>
                        {progressComponent}
                    </> :
                    <div>-</div>
                }
            </div>
            {showPadTexts && <div className="mt-2 text-xs pl-2">PAD {(index - 1) % 16 + 1}</div>}
        </div>}
        {clip && <audio ref={audioRef} src={clip.url} />}
        
    </>
}


interface AudioPlayProgressProps {
    readonly progressColorScheme: PlayProgressColorScheme;

    readonly startTime: number;
    readonly onStartTimeChanged: (startTime: number) => void;
    readonly endTime: number;
    readonly onEndTimeChanged: (endTime: number) => void;
    readonly currentTime: number;
    readonly onCurrentTimeChanged: (currentTime: number) => void;

    readonly duration: number;
}

const AudioPlayProgress = (props: AudioPlayProgressProps) => {

    const {
        progressColorScheme: { inactiveColor, playedColor, notPlayedColor },
        startTime, endTime, currentTime, duration
    } = props;

    const [overlay, setOverlay] = useState<boolean>(false);

    const trackLeft = `${100.0 * startTime / duration}%`;
    const trackRight = `${100.0 * endTime / duration}%`;
    const playedLeft = trackLeft;
    const playedRight = `${100.0 * (duration - currentTime) / duration}%`;

    return <>
        <div className={`
            w-full h-[0.8em] absolute bottom-0
            rounded-t rounded-b-lg overflow-hidden
            ${inactiveColor}
            transition-transform duration-300
            hover:scale-110 hover:cursor-pointer`
        } onClick={() => setOverlay(true)}>
            <div className={`h-full ${notPlayedColor} absolute`} style={{
                left: trackLeft,
                right: trackRight
            }}></div>
            <div className={`h-full ${playedColor} absolute transition duration-100`} style={{
                left: playedLeft,
                right: playedRight
            }}></div>
        </div>
        <PlayProgressOverlay visible={overlay} onExit={() => setOverlay(false)} {...props}/>
    </>
}


interface PlayProgressOverlayProps extends AudioPlayProgressProps {

    readonly visible: boolean;
    readonly onExit: () => void;
}

const PlayProgressOverlay = (props: PlayProgressOverlayProps) => {
    
    const {
        visible, onExit,
        progressColorScheme: { inactiveColor, playedColor, notPlayedColor, borderColor },
        startTime, endTime, currentTime, duration,
        onStartTimeChanged, onEndTimeChanged, onCurrentTimeChanged
    } = props;

    const { setHotkey, unsetHotkey } = useHotKeyContext();

    const trackLeft = `${100.0 * startTime / duration}%`;
    const trackRight = `${100.0 * endTime / duration}%`;
    const playedLeft = trackLeft;
    const playedRight = `${100.0 * (duration - currentTime) / duration}%`;

    const railRef = useRef<HTMLDivElement>();
    const trackRef = useRef<HTMLDivElement>();
    const playedRef = useRef<HTMLDivElement>();
    const startTimeHandleRef = useRef<HTMLDivElement>();
    const endTimeHandleRef = useRef<HTMLDivElement>();
    const currentTimeHandleRef = useRef<HTMLDivElement>();

    const arrowOffsetSmall = 2;
    const arrowOffsetBig = 10;

    setHotkey("ArrowLeft", () => onCurrentTimeChanged(clampTime(currentTime - arrowOffsetSmall)));
    setHotkey("ArrowRight", () => onCurrentTimeChanged(clampTime(currentTime + arrowOffsetSmall)));
    setHotkey("ArrowDown", () => onCurrentTimeChanged(clampTime(currentTime - arrowOffsetBig)));
    setHotkey("ArrowUp", () => onCurrentTimeChanged(clampTime(currentTime + arrowOffsetBig)));

    const [currentTimeDragging, setCurrentTimeDragging] = useState<boolean>(false);

    const handlesClasses = `absolute w-[0.6rem]
        transition transition-color duration-200 rounded-full
        active:cursor-grabbing active:bg-none
        hover:cursor-pointer
    `;

    const clampTime = (time: number) => {
        return clamp(time, startTime, duration - endTime);
    }

    const onCurrentTimeDragged = (e: DragEvent<HTMLDivElement>) => {

        const { offsetX, offsetY } = e.nativeEvent;

        if (offsetX < 0 && offsetY < 0) {
            return;
        }

        const newTime = clampTime(duration * ((trackRef.current.offsetLeft + playedRef.current.clientWidth + offsetX) / railRef.current.clientWidth));
        onCurrentTimeChanged(newTime);
    };

    return <Overlay visible={visible}>
        <div
            className="w-full h-full center-child bg-stone-700/80"
            onClick={() => onExit()}
        >
            <div className="w-1/2 centered-col" ref={railRef} onClick={e => { e.stopPropagation() }} >
                <div className="w-full -top-6 relative">
                    <div className={`absolute -translate-x-1/2`} style={{left: trackLeft}}>
                        {formatMinuteSeconds(startTime)}
                    </div>
                    <div className={`absolute translate-x-1/2`} style={{right: trackRight}}>
                        {formatMinuteSeconds(duration - endTime)}
                    </div>
                </div>

                {/* Rail */}
                <div className={`
                    w-full h-10 relative 
                    rounded-xl overflow-hidden
                    border-2 ${borderColor}
                    ${inactiveColor}
                `} ref={railRef}>
                    {/* Track */}
                    <div className={`h-full ${notPlayedColor} absolute rounded-md`} style={{
                        left: trackLeft,
                        right: trackRight
                    }} ref={trackRef}></div>

                    {/* Played */}
                    <div className={`h-full ${playedColor} absolute rounded transition duration-100`} style={{
                        left: playedLeft,
                        right: playedRight
                    }} ref={playedRef}>
                        <div ref={currentTimeHandleRef} className={`
                            ${handlesClasses}
                            right-0 h-full translate-x-1/2
                            hover:bg-red-900/80
                            z-10
                        `}
                            onDragStart={e => setCurrentTimeDragging(true)}
                            onDragEnd={e => setCurrentTimeDragging(false)}
                            onDragCapture={onCurrentTimeDragged}
                            draggable={true}
                        ></div>
                        <div className={`
                            ${handlesClasses}
                            right-0 h-full translate-x-1/2
                            ${currentTimeDragging ? 'bg-red-900/80' : ''}
                        `}></div>
                    </div>
                </div>
                <div className="mt-2">{formatMinuteSeconds(currentTime)} / {formatMinuteSeconds(duration)}</div>
            </div>
        </div>
    </Overlay>
}

export default ClipsPanel;