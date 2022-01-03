import { useRef, useState } from "react";

interface OverlayProps {
    readonly children: JSX.Element;

    readonly visible: boolean;
}

const Overlay = (props: OverlayProps) => {

    const [exists, setExists] = useState<boolean>(true);
    const timeoutRef = useRef<NodeJS.Timeout|null>(null);

    const { visible, children } = props;

    if (visible) {

        if (!exists) {
            setExists(true);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            
            timeoutRef.current = null;
        }
    }
    else {

        if (!timeoutRef.current) {

            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                setExists(false);
            }, 500)
        }
    }

    return exists ?
        <div className={`
            flex flex-col
            items-center justify-center
            w-screen h-screen
            fixed top-0 left-0
            transition-opacity duration-300
            z-10
            ${visible ? 'opacity-100' : 'opacity-0'}
        `}>
            {children}
        </div> :
        <div className="opacity-0"></div>;
}

export default Overlay;