import ytdl from 'ytdl-core';
import fs from 'fs';
import { delay, randomInt } from '../core/utils';
import { getFileStorage } from '../core/firebase';
import { ref, uploadBytes, getMetadata } from "firebase/storage";
import { YoutubeAudioClip } from './audio';


const getStorageUrlFromId = (id: string) => `https://firebasestorage.googleapis.com/v0/b/plml-musicplayer.appspot.com/o/music%2F${id}?alt=media`;

const garbageStr = " - Topic";
const cleanAuthorNameFromYtdlGarbage = (author: string) => author.endsWith(garbageStr) ? author.slice(0, -garbageStr.length) : author;

const createMusicInfo = (id: string, title: string, author: string): YoutubeAudioClip  => {
    return {
        title,
        author: cleanAuthorNameFromYtdlGarbage(author),
        url: getStorageUrlFromId(id),
        source: "Youtube",
        id
    }
}

const interval = 50;
export const cacheMusic = async (id: string) : Promise<YoutubeAudioClip> => {
    
    console.info(`Adding music to cache with id '${id}'.`);

    let downloaded = false;
    const tempFile = `tmp/${Date.now()}-${randomInt(1000)}`;

    const ytUrl = `https://music.youtube.com/watch?v=${id}`;

    const ytInfo = await ytdl.getInfo(ytUrl);
    const { title, author } = ytInfo.player_response.videoDetails;

    ytdl(ytUrl, {
        quality: 'highestaudio'
    }).pipe(fs.createWriteStream(tempFile)).on("close", () => downloaded = true);

    while(!downloaded) {
        await delay(interval);
    }

    const storage = getFileStorage();
    const storageRef = ref(storage, `music/${id}`);

    let done = false;

    fs.readFile(tempFile, { }, async (err, data) => {
        if (err) {
            console.error(err);
        }
        else {
            const result = await uploadBytes(storageRef, data, {
                contentType: "audio/mpeg",
                customMetadata: {
                    "title": title,
                    "author": author,
                    "source": "Youtube"
                }
            });

            console.info(`Added music to cache: '${result.metadata.fullPath}'.`);
        }
        
        done = true;
    });

    while(!done) {
        await delay(interval);
    }

    fs.unlink(tempFile, err => err && console.log(err));

    return createMusicInfo(id, title, author);
}

export const tryGetFromCache = async (id: string) : Promise<YoutubeAudioClip|null> => {

    const storage = getFileStorage();
    const storageRef = ref(storage, `music/${id}`);

    try {
        const meta = (await getMetadata(storageRef)).customMetadata;
        const title = meta["title"];
        const author = meta["author"];

        return createMusicInfo(id, title, author);
    }
    catch (err) {
        if (err.code === 'storage/object-not-found') {
            console.log(`Can't find music with id '${id}' in cache. Adding it to cache.`);
            return null;
        }
        else {
            throw err;
        }
    }
}