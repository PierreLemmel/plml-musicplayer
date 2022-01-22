import { Button, TextField, TextFieldProps } from "@mui/material";
import { useState } from "react";
import { isValidYoutubeIdOrUrl } from "../services/audio/youtube";
import Overlay from "./overlay";
import WaveformProgress, { WaveformProgressProps } from "./waveformProgress";

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
    readonly waveformProgressEdit?: WaveformProgressProps;

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
        waveformProgressEdit
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
            <div className="w-7/12 centered-col p-8 bg-slate-800 rounded-xl" onClick={e => { e.stopPropagation() }}>
                <div className="w-full mb-4">
                    <FormTextField label="Name" value={name} onChange={e => setName(e.target.value)}
                        required />
                    <FormTextField label="Clip Id (or Youtube video Id)" value={idOrUrl} onChange={e => setIdOrUrl(e.target.value)}
                        required error={idOrUrlError} helperText={idOrUrlError && "Enter a valid Youtube url or video Id"} />
                </div>
                {waveformProgressEdit && <WaveformProgress {...waveformProgressEdit} />}
                <Button
                    className="mt-6 bg-[#90caf9] px-9"
                    variant="contained" size="medium"
                    onClick={onCloseOverlay}
                >OK</Button>
            </div>  
        </div>
    </Overlay>
}