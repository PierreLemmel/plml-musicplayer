import React, { useEffect, useRef, useState } from 'react'
import { AppProps } from 'next/app'

import '../styles/index.css'
import { AppContext, AppContextProps, AudioElementUpdateProps } from '../contexts/appContext'
import { getMidiMessage, MidiMessage, MidiProps } from '../services/audio/midi'
import { AudioElementProps, getDefaultElements } from '../services/audio/audio'
import Head from 'next/head'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/system'
import { HotKeyContext, HotkeysContextProps } from '../contexts/hotkeysContext'
import Header from '../components/header'
import { onAuthChanged, updateUserData, useUserData } from '../services/core/firebase'
import { User } from 'firebase/auth'
import { AudioElementDataModel, AudioElementsMap, AudioElementsMap as AudioElementsMapDataModel, ShowDataModel } from '../services/datastore/shows'
import { Timestamp } from 'firebase/firestore'
import { Mutable } from '../services/core/utils'
import { extractYoutubeId } from '../services/audio/youtube'
import { PostMusicResponse } from './api/music/apimodels'
import { AppAudioContext, AppAudioContextProps, AppAudioManager } from '../contexts/audioContext'

const App = ({ Component, pageProps }: AppProps) => {

    const [midi, setMidi] = useState<MidiProps>();
    const [user, setUser] = useState<User>();

    const audioElementsRef = useRef<AudioElementProps[]>(getDefaultElements());
    const [audioElements, setAudioElements] = useState<AudioElementProps[]>(audioElementsRef.current);

    const [userInterractedWithPage, setUserInterractedWithPage] = useState<boolean>();

    const volumesRef = useRef<{
        values: number[],
        updating: boolean
    }>({
        values: new Array(4).fill(1.0),
        updating: false
    })
    const [volumes, setVolumes] = useState<number[]>(volumesRef.current.values);

    // Midi
    useEffect(() => {
        navigator.requestMIDIAccess()
            .then(access => {
                
                const { inputs } = access;

                const mpd226 = inputs.get("input-0");

                const inputName = mpd226.name!;
                const manufacturer = mpd226.manufacturer!;

                console.info(`Midi device detected: ${inputName} / ${manufacturer}`);
                setMidi({
                    inputName,
                    manufacturer
                });

                mpd226.onmidimessage = msgEvent => {
                    const { data, timeStamp } = msgEvent;
                    const msg = getMidiMessage(data);
                    handleMidiMessage(msg, timeStamp);
                }
            })
    }, []);

    const handleMidiMessage = (msg: MidiMessage, timeStamp: number) => {

        const type = msg.type;
        if (type === "NoteOn" || type === "NoteOff") {

            const key = msg.key;
            handleMidiNote(key, type === "NoteOn");
        }
        else if (msg.type === "ControlChange") {
            
            const { controllerNumber, controllerValue } = msg;
            handleMidiCC(controllerNumber, controllerValue);
        }
    }

    const handleMidiNote = (key: number, isOn: boolean) => {
        if (key >= 64) {
            return;
        }

        const idx = key;

        const elements = audioElementsRef.current;

        const newValue = {
            ...elements[idx],
            isOn
        };
        elements.splice(idx, 1, newValue);

        setAudioElements([...elements]);
    }

    const handleMidiCC = (control: number, value: number) => {

        const vRef = volumesRef.current;
        const idx = (control - 1) % 4;
        
        vRef.values[idx] = value / 127.0;

        if (!vRef.updating) {
            vRef.updating = true;
            setTimeout(() => {
                setVolumes([...volumesRef.current.values]);
                vRef.updating = false;
            }, 100)
        }
    }

    // Theme
    const muiTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });


    // Hotkeys
    const hkMapRef = useRef<Map<string, () => void>>(new Map());

    const hkContext: HotkeysContextProps = {
        setHotkey: (key, handler) => hkMapRef.current.set(key, handler),
        unsetHotkey: (key) => hkMapRef.current.delete(key)
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


    // Persistency
    onAuthChanged(user => {
        setUser(user);
    });
    const show = useUserData<ShowDataModel>("shows/Default");

    if (show) {

        const dm = show.elements;
        Object.keys(dm).map(str => Number.parseInt(str)).forEach(idx => {

            const newValue: AudioElementProps = {
                ...audioElements[idx - 1],
                ...dm[idx.toString()]
            }

            audioElements.splice(idx - 1, 1, newValue);
        });
    }

    // Page ready
    useEffect(() => {
        window.onclick = () => {
            
            const audioMgr = new AppAudioManager(new AudioContext());
            setAudioCtx(audioMgr);
            
            setUserInterractedWithPage(true);

            window.onclick = undefined;
        }
    }, []);
    
    // AppAudioContext
    const [audioCtx, setAudioCtx] = useState<AppAudioManager|null>(null);

    // AppContext
    const updateAudioElement = (index: number, data: Partial<AudioElementUpdateProps>) => {

        const elts = audioElementsRef.current;
        const oldValue = elts[index - 1];

        const newValue: Mutable<AudioElementProps> = {
            ...oldValue
        }

        const { name, playProperties } = data;

        if (name) {
            newValue.name = name;
        }

        if (playProperties) {
            newValue.playProperties = {
                ...newValue.playProperties,
                ...playProperties
            };
        }

        elts[index - 1] = newValue;
        updateDataModel();
    }

    const loadClip = async (index: number, idOrUrl: string) => {

        const id = extractYoutubeId(idOrUrl);
        
        console.info(`Loading clip for Id: '${id}'`);
        const request: RequestInit = {
            method: 'POST'
        }

        const response = await fetch(`/api/music/${id}`, request);
        const content: PostMusicResponse = await response.json();

        const elts = audioElementsRef.current;
        const oldValue = elts[index - 1];

        const newValue: AudioElementProps = {
            ...oldValue,

            name: oldValue.name ? oldValue.name : content.title,
            clip: {
                ...content
            },
            playProperties: { }
        }

        elts[index - 1] = newValue;
        updateDataModel();
    }

    const clearClip = async (index: number) => {
        const elts = audioElementsRef.current;

        const oldValue = elts[index - 1];

        const newValue: AudioElementProps = {
            ...oldValue,

            clip: undefined,
            playProperties: { }
        }

        elts[index - 1] = newValue;
        updateDataModel();
    }

    const updateDataModel = () => {
        const map: AudioElementsMapDataModel = audioElementsRef.current.reduce<Mutable<AudioElementsMap>>((prev, curr) => {

            const { clip, name, index, playProperties } = curr;

            if (clip && name) {
                const dm: AudioElementDataModel = {
                    name,
                    clip,
                    playProperties
                }

                prev[index] = dm;
            }

            return prev;
        }, {});
        
        updateUserData<ShowDataModel>("shows/Default", {
            modificationTime: Timestamp.now(),
            elements: map
        })
    }

    const appContext: AppContextProps = {
        midi,
        user,
        showName: show?.name ?? "",
        audioElements,
        controls: {
            volume1: volumes[0],
            volume2: volumes[1],
            volume3: volumes[2],
            volume4: volumes[3],
        },
        appReady: userInterractedWithPage,
        updateAudioElement,
        loadClip,
        clearClip
    };

    return <ThemeProvider theme={muiTheme}>
        <AppContext.Provider value={appContext}>
        <AppAudioContext.Provider value={audioCtx}>
        <HotKeyContext.Provider value={hkContext}>
            <Head>
                <title>Plml MusicPlayer</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="favicon.ico" />
            </Head>
            <div className="m-0 w-screen h-screen bg-slate-900 text-gray-300 overflow-x-hidden">
                <Header />
                <Component {...pageProps} />
            </div>
        </HotKeyContext.Provider>
        </AppAudioContext.Provider>
        </AppContext.Provider>
    </ThemeProvider>;
}
export default App