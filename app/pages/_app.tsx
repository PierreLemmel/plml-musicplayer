import React, { useEffect, useRef, useState } from 'react'
import { AppProps } from 'next/app'

import '../styles/index.css'
import { AppContext, AppContextProps } from '../contexts/appContext'
import { getMidiMessage, MidiMessage, MidiProps } from '../audio/midi'
import { AudioPageProps, getDefaultAudioPage } from '../audio/audioManagement'
import Head from 'next/head'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/system'
import { HotKeyContext, HotkeysContextProps } from '../contexts/hotkeysContext'

const App = ({ Component, pageProps }: AppProps) => {

    const [midi, setMidi] = useState<MidiProps>();

    const page1Ref = useRef<AudioPageProps>(getDefaultAudioPage(1));
    const [page1, setPage1] = useState<AudioPageProps>(page1Ref.current);

    const page2Ref = useRef<AudioPageProps>(getDefaultAudioPage(2));
    const [page2, setPage2] = useState<AudioPageProps>(page2Ref.current);

    const page3Ref = useRef<AudioPageProps>(getDefaultAudioPage(3));
    const [page3, setPage3] = useState<AudioPageProps>(page3Ref.current);

    const page4Ref = useRef<AudioPageProps>(getDefaultAudioPage(4));
    const [page4, setPage4] = useState<AudioPageProps>(page4Ref.current);

    useEffect(() => {
        navigator.requestMIDIAccess()
            .then(access => {
                
                const { inputs } = access;

                const mpd226 = inputs.get("input-0");

                setMidi({
                    inputName: mpd226.name!,
                    manufacturer: mpd226.manufacturer!
                });

                mpd226.onmidimessage = msgEvent => {
                    const { data, timeStamp } = msgEvent;

                    const msg = getMidiMessage(data);
                    handleMidiMessage(msg, timeStamp);
                }
            })
    }, []);

    const handleMidiMessage = (msg: MidiMessage, timeStamp: number) => {

        const isOn = msg.type === "NoteOn";
        const isOff = msg.type === "NoteOff";

        if (!(isOn || isOff)) {
            return;
        }

        const key = msg.key;

        if (key >= 4 * 16) {
            return;
        }

        const [page, pageSetter] = getPageAndSetter(Math.floor(key / 16) + 1);

        const idx = key % 16;

        const newValue = {
            ...page.values[idx],
            isOn
        };
        page.values.splice(idx, 1, newValue);

        pageSetter({...page});
    }

    const appContext: AppContextProps = {
        midi,
        pages: {
            page1: page1,
            page2: page2,
            page3: page3,
            page4: page4
        }
    }

    const getPageAndSetter = (index: number): [AudioPageProps, React.Dispatch<React.SetStateAction<AudioPageProps>>] => {
        switch(index) {
            case 1: return [page1Ref.current, setPage1];
            case 2: return [page2Ref.current, setPage2];
            case 3: return [page3Ref.current, setPage3];
            case 4: return [page4Ref.current, setPage4];
        }
    };
    const muiTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const hkMapRef = useRef<Map<string, () => void>>(new Map());

    const hkContext: HotkeysContextProps = {
        setHotkey: (key, handler) => hkMapRef.current.set(key, handler)
    }

    useEffect(() => {

        const globalKeyDownHandler = e => {
            const key: string = e.key;

            if (hkMapRef.current.has(key)) {
                const handler = hkMapRef.current.get(key);
                handler();
            }
        };

        document.addEventListener("keydown", globalKeyDownHandler);
        return () => document.removeEventListener("keydown", globalKeyDownHandler);
    }, [])

    return <ThemeProvider theme={muiTheme}>
        <AppContext.Provider value={appContext}>
        <HotKeyContext.Provider value={hkContext}>
            <Head>
                <title>Plml MusicPlayer</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="shortcut icon" href="favicon.ico" />
            </Head>
            <div className="m-0 w-screen h-screen overflow-hidden bg-slate-900 text-gray-300">
                <Component {...pageProps} />
            </div>
        </HotKeyContext.Provider>
        </AppContext.Provider>
    </ThemeProvider>;
}

export default App