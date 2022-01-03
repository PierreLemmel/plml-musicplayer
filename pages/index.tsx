import { Pagination } from '@mui/material';
import { useState } from 'react';
import ClipsPanel from '../components/clipsPanel';
import { useAppContext } from '../contexts/appContext'
import { useHotKeyContext } from '../contexts/hotkeysContext';
import ControlPanel from '../components/controlPanel';
import Overlay from '../components/overlay';

import {
    grayAmberScheme, roseEmeraldScheme, tealPinkScheme, violetRedScheme,
    defaultPlayProgressColorScheme,
    ComponentColorScheme,
    PlayProgressColorScheme
} from '../components/themes/theme';


const ShowPage = () => {

    const [pageIndex, setPageIndex] = useState<number>(1);

    const {
        pages: { page1, page2, page3, page4 },
        appReady
    } = useAppContext();

    const hkContext = useHotKeyContext();
    hkContext.setHotkey("PageUp", () => {
        if (pageIndex < 4) {
            setPageIndex(pageIndex + 1)
        }
    });

    hkContext.setHotkey("PageDown", () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    });

    hkContext.setHotkey("&", () => setPageIndex(1));
    hkContext.setHotkey("é", () => setPageIndex(2));
    hkContext.setHotkey("\"", () => setPageIndex(3));
    hkContext.setHotkey("'", () => setPageIndex(4));
    
    type ClipPanelColorScheme = {
        readonly colorScheme: ComponentColorScheme,
        readonly progressColorScheme: PlayProgressColorScheme
    }
    const colorSchemes: ClipPanelColorScheme[] = [
        {
            colorScheme: grayAmberScheme,
            progressColorScheme: defaultPlayProgressColorScheme
        },
        {
            colorScheme: violetRedScheme,
            progressColorScheme: defaultPlayProgressColorScheme
        },
        {
            colorScheme: tealPinkScheme,
            progressColorScheme: defaultPlayProgressColorScheme
        },
        {
            colorScheme: roseEmeraldScheme,
            progressColorScheme: defaultPlayProgressColorScheme
        }
    ]

    const showPadTexts = false;
    return <div className="px-3 centered-row">
        <div className="w-full lg:w-1/2 centered-col">
            <div>
                <ClipsPanel
                    page={page1} visible={pageIndex === 1}
                    {...colorSchemes[0]} showPadTexts={showPadTexts}
                />
                <ClipsPanel
                    page={page2} visible={pageIndex === 2}
                    {...colorSchemes[1]} showPadTexts={showPadTexts}
                />
                <ClipsPanel
                    page={page3} visible={pageIndex === 3}
                    {...colorSchemes[2]} showPadTexts={showPadTexts}
                />
                <ClipsPanel
                    page={page4} visible={pageIndex === 4}
                    {...colorSchemes[3]} showPadTexts={showPadTexts}
                />
            </div>
            <Pagination count={4} page={pageIndex} onChange={(e, val) => setPageIndex(val)} className="mt-2 mb-3" />
        </div>
        <div className={`
            w-full min-h-[50vh] h-full lg:w-1/2 ml-6
            center-child
        `}>
            <ControlPanel {...colorSchemes[pageIndex - 1]}/>
        </div>
        <AppReadyWarning visible={!appReady} />
    </div>
}

const AppReadyWarning = (props: { visible: boolean}) => <Overlay visible={props.visible}>
    <div className="w-full h-full centered-col bg-stone-700/90">
        <div className="text-8xl">Click on screen to enable app.</div>
        <div className="text-2xl mt-6">Websites don't allow us to play audio if user didn't interract first with the page.</div>
    </div>
</Overlay>


export default ShowPage