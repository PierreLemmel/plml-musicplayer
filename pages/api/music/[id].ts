import type { NextApiRequest, NextApiResponse } from 'next'
import { cacheMusic, tryGetFromCache } from '../../../services/audio/youtube'


interface ResponseData {
    readonly url: string;
    readonly title: string;
    readonly author: string;
    readonly source: string;
    readonly duration: number;
    readonly id: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData|string>
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