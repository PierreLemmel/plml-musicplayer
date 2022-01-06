export interface PostMusicResponse {
    readonly url: string;
    readonly title: string;
    readonly author: string;
    readonly source: "Youtube";
    readonly duration: number;
    readonly id: string;
}