import { useEffect, useMemo, useRef } from "react";
import { WaveformProps } from "./clipEdit";

export interface VisualizerProps {
    readonly startTime: number;
    readonly endTime: number;
    readonly currentTime: number;
    readonly duration: number;

    readonly trackColor: string;
    readonly playableColor: string;
    readonly playedColor: string;
}

type WaveformVisualizerProps = VisualizerProps&WaveformProps;

const WaveformVisualizer = (props: WaveformVisualizerProps) => {

    const { 
        spectrumData,
        startTime, endTime, currentTime, duration,
        trackColor, playableColor, playedColor
     } = props;

    const containerRef = useRef<HTMLDivElement>();
    const trackCanvasRef = useRef<HTMLCanvasElement>();
    const playableCanvasRef = useRef<HTMLCanvasElement>();
    const playedCanvasRef = useRef<HTMLCanvasElement>();

    const pixelsPerBar = 2;
    const spacing = 3;

    const samples = containerRef.current ? Math.round(containerRef.current.clientWidth / (pixelsPerBar + spacing)) : null;

    const normalizedData: number[]|null = useMemo(() => {

        if (spectrumData && samples) {

            const blockSize = spectrumData.length / samples;
            const rawValues = new Array<number>(samples);

            let block=0, blockCount=0, blockSum=0;
            const addBlockToResult = () => {
                rawValues[block++] = blockSum / blockCount;

                blockSum = 0;
                blockCount = 0;
            }

            for (let i = 0; i < spectrumData.length; i++){

                blockSum += Math.abs(spectrumData[i]);
                blockCount++;

                if (i >= (block + 1) * blockSize) {
                    addBlockToResult();
                }
            }

            if (blockCount > 0) {
                addBlockToResult();
            }

            const max = Math.max(...rawValues);
            return rawValues.map(val => Math.max(Math.pow(val / max, 1.33), 0.008));
        }
        else {
            return null;
        }
        
    }, [spectrumData, samples]);

    const renderCanvas = (canvas: HTMLCanvasElement|undefined, color: string) => {

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
    }

    useEffect(() => {
        renderCanvas(trackCanvasRef.current, trackColor);
        renderCanvas(playableCanvasRef.current, playableColor);
        renderCanvas(playedCanvasRef.current, playedColor);
        
    }, [startTime, endTime, currentTime, duration, trackColor, playableColor, playedColor]);

    const canvasClass = "w-full h-full absolute left-0 top-0"
    return <div className="center-item my-4 w-full h-32 relative" ref={containerRef} >
        <canvas ref={trackCanvasRef} className={canvasClass} width={containerRef.current?.clientWidth ?? 0} />
        <canvas ref={playableCanvasRef} className={canvasClass} width={containerRef.current?.clientWidth ?? 0} />
        <canvas ref={playedCanvasRef} className={canvasClass} width={containerRef.current?.clientWidth ?? 0} />
    </div>
}

export default WaveformVisualizer;