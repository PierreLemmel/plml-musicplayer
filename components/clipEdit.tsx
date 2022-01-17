import { Button, TextField, TextFieldProps } from "@mui/material";
import { DragEvent, useRef, useState } from "react";
import { isValidYoutubeIdOrUrl } from "../services/audio/youtube";
import { clamp, formatMinuteSeconds } from "../services/core/utils";
import { AudioPlayProgressProps } from "./clipsPanel";
import Overlay from "./overlay";
import WaveformVisualizer from "./waveformVisualizer";

export interface PlayProgressEditProps {
    readonly onStartTimeStartEditing: () => void;
    readonly onStartTimeChanged: (startTime: number) => void;
    readonly onStartTimeCommitted: () => void;

    readonly onEndTimeStartEditing: () => void;
    readonly onEndTimeChanged: (endTime: number) => void;
    readonly onEndTimeCommitted: () => void;

    readonly onCurrentTimeStartEditing: () => void;
    readonly onCurrentTimeChanged: (currentTime: number) => void;
    readonly onCurrentTimeCommitted: () => void;
    readonly setCurrentTime: (currentTime: number) => void;
}

export interface WaveformProps {
    readonly spectrumData: Float32Array|null;
}

export type AudioPlayEditableProgressProps = WaveformProps&AudioPlayProgressProps&PlayProgressEditProps;

const AudioPlayEditableProgress = (props: AudioPlayEditableProgressProps) => {

    const {
        progressColorScheme: {
            inactiveColor, playedColor, notPlayedColor, borderColor,
            currentTimeHandleColor: {
                normal: currentTimeHandleColor,
                hover:  currentTimeHandleHoverColor
            },
            playableTimeHandleColor: {
                normal: playableTimeHandleColor,
                hover:  playableTimeHandleHoverColor
            }
        },
        startTime, endTime, currentTime, duration,
        onStartTimeStartEditing, onStartTimeChanged, onStartTimeCommitted,
        onEndTimeStartEditing, onEndTimeChanged, onEndTimeCommitted,
        onCurrentTimeStartEditing, onCurrentTimeChanged, onCurrentTimeCommitted, setCurrentTime
    } = props;

    const trackLeft = `${100.0 * startTime / duration}%`;
    const trackRight = `${100.0 * endTime / duration}%`;
    const playedLeft = trackLeft;
    const playedRight = `${100.0 * Math.max(duration - currentTime, endTime) / duration}%`;

    const railRef = useRef<HTMLDivElement>();
    const trackRef = useRef<HTMLDivElement>();
    const playedRef = useRef<HTMLDivElement>();
    const startTimeHandleRef = useRef<HTMLDivElement>();
    const endTimeHandleRef = useRef<HTMLDivElement>();
    const currentTimeHandleRef = useRef<HTMLDivElement>();

    const [currentTimeDragging, setCurrentTimeDragging] = useState<boolean>(false);
    const [startTimeDragging, setStartTimeDragging] = useState<boolean>(false);
    const [endTimeDragging, setEndTimeDragging] = useState<boolean>(false);

    const closeThreshold = 3.0;
    const timeCloseToStart = currentTime - startTime < closeThreshold;
    const timeCloseToEnd = duration- endTime - currentTime < closeThreshold;

    const translateStartHandleClass = timeCloseToStart ? "-translate-x-3/4" : "-translate-x-1/2";
    const translateEndHandleClass = timeCloseToEnd ? "translate-x-3/4" : "translate-x-1/2";
    const translateCurrentHandleClass = timeCloseToStart ?
        "translate-x-3/4" :
        timeCloseToEnd ? 
            "translate-x-1/4" :
            "translate-x-1/2";

    const handlesClasses = `absolute w-[0.6rem]
        h-full
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
    
    const minDuration = 0.05 * duration;

    const onStartTimeDragged = (e: DragEvent<HTMLDivElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (offsetX < 0 && offsetY < 0) {
            return;
        }

        const newTime = clamp(
            duration * (trackRef.current.offsetLeft + offsetX) / railRef.current.clientWidth,
            0.0,
            duration - endTime - minDuration
        );
        onStartTimeChanged(newTime);
    };

    const onEndTimeDragged = (e: DragEvent<HTMLDivElement>) => {

        const { offsetX, offsetY } = e.nativeEvent;

        if (offsetX < 0 && offsetY < 0) {
            return;
        }

        const newTime = clamp(
            duration * (railRef.current.clientWidth - (trackRef.current.offsetLeft + trackRef.current.clientWidth + offsetX)) / railRef.current.clientWidth,
            0,
            duration - startTime - minDuration
        );
        onEndTimeChanged(newTime);
    };

    const onClickOnTrack = (e: React.PointerEvent<HTMLDivElement>) => {
        
        const { offsetX } = e.nativeEvent;

        const newTime = clampTime(duration * ((trackRef.current.offsetLeft + offsetX) / railRef.current.clientWidth));
        setCurrentTime(newTime);
    }

    return <div className="w-full centered-col mt-6" ref={railRef}>
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
            rounded-lg
            border-2 ${borderColor}
            ${inactiveColor}
        `} ref={railRef}>
            {/* Track */}
            <div className={`h-full ${notPlayedColor} absolute rounded-md`} style={{
                left: trackLeft,
                right: trackRight
            }} ref={trackRef}>

                {/* Start time */}
                <div ref={startTimeHandleRef} className={`
                    ${handlesClasses}
                    left-0 ${translateStartHandleClass}
                    ${playableTimeHandleHoverColor}
                    z-30
                `}
                    onDragStart={e => {
                        onStartTimeStartEditing();
                        setStartTimeDragging(true);
                    }}
                    onDragEnd={e => {
                        setStartTimeDragging(false);
                        onStartTimeCommitted();
                    }}
                    onDragCapture={onStartTimeDragged}
                    draggable={true}
                ></div>
                <div className={`
                    ${handlesClasses}
                    left-0 ${translateStartHandleClass}
                    ${startTimeDragging ? playableTimeHandleColor : ''}
                `}></div>

                {/* End time */}
                <div ref={endTimeHandleRef} className={`
                    ${handlesClasses}
                    right-0 ${translateEndHandleClass}
                    ${playableTimeHandleHoverColor}
                    z-40
                `}
                    onDragStart={e => {
                        onEndTimeStartEditing();
                        setEndTimeDragging(true);
                    }}
                    onDragEnd={e => {
                        setEndTimeDragging(false);
                        onEndTimeCommitted();
                    }}
                    onDragCapture={onEndTimeDragged}
                    draggable={true}
                ></div>
                <div className={`
                    ${handlesClasses}
                    right-0 ${translateEndHandleClass}
                    ${endTimeDragging ? playableTimeHandleColor : ''}
                `}></div>

                {/* Clickable track */}
                <div className="hover:cursor-pointer z-50 h-full w-full absolute bg-none" onClick={onClickOnTrack}></div>
            </div>

            {/* Played */}
            <div className={`h-full ${playedColor} absolute rounded transition duration-100`} style={{
                left: playedLeft,
                right: playedRight
            }} ref={playedRef}>
                <div ref={currentTimeHandleRef} className={`
                    ${handlesClasses}
                    right-0 ${translateCurrentHandleClass}
                    ${currentTimeHandleHoverColor}
                    z-50
                `}
                    onDragStart={e => {
                        onCurrentTimeStartEditing();
                        setCurrentTimeDragging(true);
                    }}
                    onDragEnd={e => {
                        setCurrentTimeDragging(false);
                        onCurrentTimeCommitted();
                    }}
                    onDragCapture={onCurrentTimeDragged}
                    draggable={true}
                ></div>
                <div className={`
                    ${handlesClasses}
                    right-0 ${translateCurrentHandleClass}
                    ${currentTimeDragging ? currentTimeHandleColor : ''}
                `}></div>
            </div>
        </div>
        <WaveformVisualizer spectrumData={props.spectrumData} />
        <div className="mt-2">{formatMinuteSeconds(currentTime)} / {formatMinuteSeconds(duration)}</div>
    </div>
}

export interface ClipEditData {
    readonly name: string;
    readonly idOrUrl: string;
}

export interface ClipEditFormProps {
    readonly data: ClipEditData;
    readonly onClipEditFormSubmitted: (data: ClipEditData) => void;
}

const FormTextField = (props: TextFieldProps) => {
    const [alreadyEdited, setAlreadyEdited] = useState<boolean>(false);

    return <TextField variant="filled" fullWidth {...props} error={props.error && alreadyEdited}
        className={`mt-4 ${props.className}`} onBlur={() => setAlreadyEdited(true)} />;
}

interface ClipEditOverlayProps {

    readonly clipEdit: ClipEditFormProps;
    readonly progressEdit?: AudioPlayEditableProgressProps;

    readonly visible: boolean;
    readonly onExit: () => void;
}

export const ClipEditOverlay = (props: ClipEditOverlayProps) => {

    const { 
        visible, onExit,
        clipEdit: {
            data,
            onClipEditFormSubmitted
        },
        progressEdit
    } = props;

    const [name, setName] = useState<string>(data.name);
    const [idOrUrl, setIdOrUrl] = useState<string>(data.idOrUrl);

    const onCloseOverlay = () => {
        onExit();
        onClipEditFormSubmitted({
            name,
            idOrUrl
        });
    }

    const idOrUrlError = !isValidYoutubeIdOrUrl(idOrUrl);
    
    return <Overlay visible={visible}>
        <div
            className="w-full h-full center-child bg-slate-700/90"
            onClick={onCloseOverlay}
        >
            <div className="w-7/12 centered-col p-6" onClick={e => { e.stopPropagation() }}>
                <div className="w-full mb-4">
                    <FormTextField label="Name" value={name} onChange={e => setName(e.target.value)}
                        required />
                    <FormTextField label="Clip Id (or Youtube video Id)" value={idOrUrl} onChange={e => setIdOrUrl(e.target.value)}
                        required error={idOrUrlError} helperText={idOrUrlError && "Enter a valid Youtube url or video Id"} />
                </div>
                {progressEdit && <AudioPlayEditableProgress {...progressEdit} />}
                <Button
                    className="mt-6 bg-[#90caf9] px-9"
                    variant="contained" size="medium"
                    onClick={onCloseOverlay}
                >OK</Button>
            </div>  
        </div>
    </Overlay>
}