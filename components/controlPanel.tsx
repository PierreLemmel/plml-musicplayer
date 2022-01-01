import { Slider } from "@mui/material";
import { useAppContext } from "../contexts/appContext";

interface ControlPanelDisplayProps {

}

const ControlPanelDisplay = (props: ControlPanelDisplayProps) => {
    const {
        controls: { volume1, volume2, volume3, volume4 }
    } = useAppContext();

    return <div>
        <VolumeSlider label="Volume 1" value={volume1} />
        <VolumeSlider label="Volume 2" value={volume2} />
        <VolumeSlider label="Volume 3" value={volume3} />
        <VolumeSlider label="Volume 4" value={volume4} />
    </div>
}


interface VolumeSliderProps {
    readonly label: string;
    readonly value: number;
    readonly hasThumb?: boolean;
}

const defaultVolumeSliderProps: Partial<VolumeSliderProps> = {
    hasThumb: false
}

const VolumeSlider = (props: VolumeSliderProps) => {

    
    const { label, value, hasThumb } = {
        ...defaultVolumeSliderProps,
        ...props
    };

    const trackBorderRadius = '0.54em';

    const outlineDefault = 'solid 2px';
    const outlineActiveColor = 'rgb(142, 142, 142)';
    const outlineInactiveColor = 'rgb(92, 92, 92)';

    return <Slider
        className="h-[28rem] lg:h-[32rem] 2xl:h-[36rem] w-[1.85em] ml-6"
        orientation="vertical"
        aria-label={label}
        min={0}
        max={1.0}
        value={value}
        size="medium"
        sx={{
            '&:hover': {
                cursor: 'default'
            },
            '& .MuiSlider-thumb': {
                visibility: hasThumb ? 'visible' : 'hidden',
                width: '2.65em',
                height: '1.2em',
                borderRadius: '0.42em',
                outline: outlineDefault,
                outlineColor: outlineActiveColor,
                boxShadow: '0px 4px 4px 2px rgb(0 0 0 / 15%), 0px 1px 5px 0px rgb(0 0 0 / 35%)',
                transition: '200ms',
            },
            '& .MuiSlider-thumb:before': {
                boxShadow: 'none'
            },
            '& .MuiSlider-track': {
                outline: outlineDefault,
                outlineColor: outlineActiveColor,
                borderRadius: trackBorderRadius,
                transition: '200ms'
            },
            '& .MuiSlider-rail': {
                borderRadius: trackBorderRadius,
                outline: outlineDefault,
                outlineColor: outlineInactiveColor
            }
        }} />;
};

export default ControlPanelDisplay;