import type { NextApiRequest, NextApiResponse } from 'next'
import { cacheMusic, tryGetFromCache } from '../../../services/audio/youtubeApi'
import { PostMusicResponse } from './apimodels';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PostMusicResponse|string>
) {
    if (req.method === "POST" || process.env.DEV) {
        const id = <string> req.query["id"];
        const clip = await tryGetFromCache(id) ?? await cacheMusic(id);
        res.status(200).json({ ...clip, id });
    }
    else {
        res.status(400).json("Invalid request");
    }
}