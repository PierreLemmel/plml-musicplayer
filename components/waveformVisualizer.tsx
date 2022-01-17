import { WaveformProps } from "./clipEdit";

interface VisualizerProps {

}

type WaveformVisualizerProps = VisualizerProps&WaveformProps;

const WaveformVisualizer = (props: WaveformVisualizerProps) => {

    return <div>
        {JSON.stringify(props)}
    </div>
}

export default WaveformVisualizer;