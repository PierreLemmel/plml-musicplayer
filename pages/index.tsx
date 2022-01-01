import { Pagination } from '@mui/material';
import { useState } from 'react';
import { AudioPageProps } from '../services/audio/audio';
import AudioPageDisplay from '../components/audioPageDisplay';
import { useAppContext } from '../contexts/appContext'
import { useHotKeyContext } from '../contexts/hotkeysContext';

type AudioPageColorInfo = {
    readonly offColor: string;
    readonly offOutline: string;
    readonly onColor: string;
    readonly onOutline: string;
}


const ShowPage = () => {

    const [pageIndex, setPageIndex] = useState<number>(1);

    const {
        pages: { page1, page2, page3, page4 }
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
    
    return <div className="px-3" >
        <div className="w-full xl:w-2/3 2xl:w-1/2 flex flex-col justify-center items-center">
            <AudioPageDisplay
                page={page1} visible={pageIndex === 1}
                offColor="bg-gray-400"
                offOutline="outline-gray-500"
                onColor="bg-amber-500"
                onOutline="outline-amber-600"
            />
            <AudioPageDisplay
                page={page2} visible={pageIndex === 2}
                offColor="bg-violet-500"
                offOutline="outline-violet-600"
                onColor="bg-red-600"
                onOutline="outline-red-700"
            />
            <AudioPageDisplay
                page={page3} visible={pageIndex === 3}
                offColor="bg-teal-500"
                offOutline="outline-teal-600"
                onColor="bg-pink-500"
                onOutline="outline-pink-600"
            />
            <AudioPageDisplay
                page={page4} visible={pageIndex === 4}
                offColor="bg-rose-300"
                offOutline="outline-rose-400"
                onColor="bg-emerald-400"
                onOutline="outline-emerald-500"
            />
            <Pagination count={4} page={pageIndex} onChange={(e, val) => setPageIndex(val)} className="mt-2 mb-3" />
        </div>
    </div>
}

export default ShowPage