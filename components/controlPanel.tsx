import { useAppContext } from "../contexts/appContext";
import { ComponentColorScheme } from "./themes/theme";

interface ControlPanelDisplayProps {
    readonly colorScheme: ComponentColorScheme;
}

const ControlPanelDisplay = (props: ControlPanelDisplayProps) => {
    const {
        controls: { volume1, volume2, volume3, volume4 }
    } = useAppContext();

    return <div className="centered-row">
        <VolumeSlider label="Volume 1" value={volume1} {...props} />
        <VolumeSlider label="Volume 2" value={volume2} {...props} />
        <VolumeSlider label="Volume 3" value={volume3} {...props} />
        <VolumeSlider label="Volume 4" value={volume4} {...props} />
    </div>
}


interface VolumeSliderProps {
    readonly label: string;
    readonly value: number;
    readonly hasThumb?: boolean;
    readonly colorScheme: ComponentColorScheme;
}

const VolumeSlider = (props: VolumeSliderProps) => {

    const {
        label, value,
        colorScheme: {
            offColor, offOutline, onColor, onOutline
        }
    } = props;

    return <div>
        <div className="text-center mb-4 italic">
            {label}<br/>
            {Math.round(value * 100)}%
        </div>
        <div className={`
            h-[28rem] lg:h-[32rem] 2xl:h-[36rem] w-[2.9em] mx-6
            ${offColor} rounded-md
            outline outline-2 ${offOutline} relative`
        }>
            <div className={`
                w-[90%] h-[37%] ml-[5%]
                ${value !== 0 ? 'outline' : ''} outline-2 rounded-md
                transition-all transition-300
                ${onOutline} ${onColor}
                absolute bottom-[0.4%]`
            } style={{
                height: `${99.2 * value}%`
            }}>

            </div>
        </div>
    </div>
}

export default ControlPanelDisplay;