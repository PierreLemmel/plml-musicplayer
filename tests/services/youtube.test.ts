import { isValidYoutubeIdOrUrl } from "../../services/audio/youtube";

describe('Validate youtube url or ids', () => {

    const validIds = [
        "zuCQHpX2X_c",
        "cpwKMf6oH90",
        "-FtRs2MwjWc",
        "5nM1Axw8iR4"
    ]

    const invalidIds = [
        "patate",
        "5nM1Axw8iR",
        "aaaaaaaaaaaaaaaaaaaa",
        ""
    ]

    const validUrls = [
        "https://music.youtube.com/watch?v=-FtRs2MwjWc",
        "https://music.youtube.com/watch?v=-FtRs2MwjWc&list=RDAMVMC5Vct-HN6pg",
        "www.youtube.com/watch?v=BRitqriYzko",
        "https://www.youtube.com/watch?v=BRitqriYzko"
    ]

    const invalidUrls = [
        "https://music.youtube.com/search?q=because+you+move+me",
        "www.youtube.com",
        "www.youtube.com/watch?v=patate",
        "www.youtube.com/watch?v=5nM1Ax8iR",
    ]

    validIds.forEach(id => it(`Validates valid id: '${id}'`, () => {
        const isValid = isValidYoutubeIdOrUrl(id);
        expect(isValid).toBe(true);
    }));

    invalidIds.forEach(id => it(`Invalidates invalid id: '${id}'`, () => {
        const isValid = isValidYoutubeIdOrUrl(id);
        expect(isValid).toBe(false);
    }));

    validUrls.forEach(url => it(`Validates valid url: '${url}'`, () => {
        const isValid = isValidYoutubeIdOrUrl(url);
        expect(isValid).toBe(true);
    }));

    invalidUrls.forEach(url => it(`Invalidates invalid url: '${url}'`, () => {
        const isValid = isValidYoutubeIdOrUrl(url);
        expect(isValid).toBe(false);
    }));
})