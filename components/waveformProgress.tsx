import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { resample } from "../services/core/maths";
import { clamp, formatMinuteSeconds } from "../services/core/utils";
import { PlayProgressEditProps } from "./clipEdit";
import { AudioPlayProgressProps } from "./clipsPanel";

export interface WaveformProps {
    readonly spectrumData: number[]|null;
}

export interface WaveformProgressProps {
    readonly waveform: WaveformProps;
    readonly audioPlayProgress: AudioPlayProgressProps;
    readonly playProgressEdit: PlayProgressEditProps;
}

const WaveformProgress = (props: WaveformProgressProps) => {

    const {
        audioPlayProgress : {
            progressColorScheme: {
                waveformColorScheme: {
                    inactiveColor, playedColor, notPlayedColor, borderColor, backgroundColor
                },
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
        },
        playProgressEdit: {
            onStartTimeStartEditing, onStartTimeChanged, onStartTimeCommitted,
            onEndTimeStartEditing, onEndTimeChanged, onEndTimeCommitted,
            onCurrentTimeStartEditing, onCurrentTimeChanged, onCurrentTimeCommitted, setCurrentTime
        },
        waveform: {
            spectrumData
        }
    } = props;

    const railRef = useRef<HTMLDivElement>();
    const trackRef = useRef<HTMLDivElement>();
    const playedRef = useRef<HTMLDivElement>();

    const startTimeHandleRef = useRef<HTMLDivElement>();
    const endTimeHandleRef = useRef<HTMLDivElement>();
    const currentTimeHandleRef = useRef<HTMLDivElement>();

    const trackCanvasRef = useRef<HTMLCanvasElement>();
    const playableCanvasRef = useRef<HTMLCanvasElement>();
    const playedCanvasRef = useRef<HTMLCanvasElement>();

    const [currentTimeDragging, setCurrentTimeDragging] = useState<boolean>(false);
    const [startTimeDragging, setStartTimeDragging] = useState<boolean>(false);
    const [endTimeDragging, setEndTimeDragging] = useState<boolean>(false);

    const closeThreshold = 3.0;
    const timeCloseToStart = currentTime - startTime < closeThreshold;
    const timeCloseToEnd = duration- endTime - currentTime < closeThreshold;

    const trackLeft = `${100.0 * startTime / duration}%`;
    const trackRight = `${100.0 * endTime / duration}%`;
    const playedLeft = trackLeft;
    const playedRight = `${100.0 * Math.max(duration - currentTime, endTime) / duration}%`;

    const translateStartHandleClass = timeCloseToStart ? "-translate-x-3/4" : "-translate-x-1/2";
    const translateEndHandleClass = timeCloseToEnd ? "translate-x-3/4" : "translate-x-1/2";
    const translateCurrentHandleClass = timeCloseToStart ?
        "translate-x-3/4" :
        timeCloseToEnd ? 
            "translate-x-1/4" :
            "translate-x-1/2";

    const handlesClasses = `absolute w-[0.5rem]
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

    const pixelsPerBar = 2;
    const spacing = 2;

    const [ready, setReady] = useState<boolean>(false);

    const samples = railRef.current ? Math.round(railRef.current.clientWidth / (pixelsPerBar + spacing)) : null;

    useEffect(() => {
        setReady(true);
    }, [])
    
    const normalizedData: number[]|null = useMemo(() => {
        if (spectrumData && samples) {
            const values = resample(spectrumData, samples);
            const max = Math.max(...values);
            return values.map(val => Math.max(Math.pow(val / max, 1.33), 0.008));
        }
        else {
            return null;
        }
        
    }, [spectrumData, samples]);

    const renderCanvas = (canvas: HTMLCanvasElement|undefined, color: string, left?: number|undefined, right?: number|undefined) => {

        const ctx = canvas.getContext("2d");

        const { width: w, height: h } = canvas;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;

        let x = 0;
        const rectWidth = pixelsPerBar;
        normalizedData?.forEach(val => {

            const rectHeight = val * h;
            const y = (h - rectHeight) / 2.0;
            ctx.fillRect(x, y, rectWidth, rectHeight);

            x += rectWidth + spacing;
        })

        if (left) {
            ctx.clearRect(0, 0, left * w, h);
        }

        if (right) {
            ctx.clearRect(w * (1 - right), 0, right * w, h);
        }
    }

    useEffect(() => {

        const playableStart = startTime / duration;
        const playableEnd = endTime / duration;
        const playedStart = playableStart;
        const playedEnd = (duration - currentTime) / duration;

        renderCanvas(trackCanvasRef.current, inactiveColor, 0, 0);
        renderCanvas(playableCanvasRef.current, notPlayedColor, playableStart, playableEnd);
        renderCanvas(playedCanvasRef.current, playedColor, playedStart, playedEnd);
    }, [startTime, endTime, currentTime, duration, inactiveColor, notPlayedColor, playedColor, ready]);

    const canvasClass = "w-full h-full absolute left-0 top-0";
    const canvasWidth = railRef.current?.clientWidth ?? 0;

    return <div className="w-full centered-col mt-6" ref={railRef}>
        <div className="w-full -top-6 relative">
            <div className={`absolute -translate-x-1/2`} style={{left: trackLeft}}>
                {formatMinuteSeconds(startTime)}
            </div>
            <div className={`absolute translate-x-1/2`} style={{right: trackRight}}>
                {formatMinuteSeconds(duration - endTime)}
            </div>
        </div>

        <div className={`w-full h-36 rounded-lg border-[1px] py-2 ${borderColor} ${backgroundColor}`}>
            {/* Rail */}
            <div className={`
                w-full h-full relative
            `} ref={railRef}>
                {/* Track */}
                <div className="h-full absolute rounded-md" style={{
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
                <div className="h-full absolute rounded transition duration-100" style={{
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

                <canvas ref={trackCanvasRef} className={canvasClass} width={canvasWidth} />
                <canvas ref={playableCanvasRef} className={canvasClass} width={canvasWidth} />
                <canvas ref={playedCanvasRef} className={canvasClass} width={canvasWidth} />
            </div>
        </div>

        <div className="mt-2">{formatMinuteSeconds(currentTime)} / {formatMinuteSeconds(duration)}</div>
    </div>
}

export default WaveformProgress;