import { getVideoID, validateID, validateURL } from 'ytdl-core';

export const isValidYoutubeIdOrUrl = (input: string): boolean => {
    const correctedInput = input.startsWith("www") ? "https://" + input : input;
    return validateID(correctedInput) || validateURL(correctedInput);
};

export const extractYoutubeId = (input: string) => {
    return getVideoID(input);
}