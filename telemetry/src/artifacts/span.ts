import { SpanArtifact, SpanBag, Spanner } from './../../types/telemetry.types';
import { Spannable } from "../../types/telemetry.types";

export default class Span {
    private spannable: Spannable;
    private artifact: SpanArtifact;
    private bag: SpanBag = {};

    constructor(spannable: Spannable) {
        this.spannable = spannable;
    }

    public attach(artifact: SpanArtifact): void {
        this.artifact = artifact;
    }

    public name(): string {
        return this.spannable.name;
    }

    public kind(): Spanner {
        return this.spannable.kind;
    }

    public parent(): Span {
        return this.spannable.parent;
    }

    public get(): SpanArtifact {
        return this.artifact;
    }

    public updateName(name: string) {
        this.spannable.name = name;
    }

    public attr(key: string, value: string) {
        this.bag[key] = value;
    }

    public attributes(): SpanBag {
        return this.bag;
    }
};
