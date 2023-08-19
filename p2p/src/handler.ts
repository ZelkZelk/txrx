import { Streamer } from "streamer";

export default abstract class Handler {
    protected streamer: Streamer;

    public constructor(url: string) {
        this.streamer = new Streamer(url);
    }
}
