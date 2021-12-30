import type { NextApiRequest, NextApiResponse } from 'next'
import { cacheMusic, tryGetFromCache } from '../../../services/youtube'


interface ResponseData {
    readonly url: string;
    readonly title: string;
    readonly author: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const id = <string> req.query["id"];
    const musicInfo = await tryGetFromCache(id) ?? await cacheMusic(id);
    res.status(200).json({ ...musicInfo })
}