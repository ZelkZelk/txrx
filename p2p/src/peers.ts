import { P2PMapping, PeerShards } from "../types/p2p.types";

export default class Peers {
    private static peers: PeerShards = {};
    private constructor() {}

    public static get(name: string): P2PMapping | null {
        return Peers.peers[name];
    }

    public static set(name: string, shard: P2PMapping): void {
        Peers.peers[name] = shard;
    }
}