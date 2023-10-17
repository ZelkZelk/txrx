import { Span as OTelSpan } from '@opentelemetry/api';
import Span from '../src/artifacts/span';

export enum TELEMETRY {
    CONSOLE = 'console',
    EXPORTED = 'exported',
    NOTEL = 'notel',
};

export type SpanArtifact = OTelSpan;

export type Spannable = {
    name: string;
    kind: Spanner;
    parent?: Span;
    propagation?: Propagation,
};

export enum Spanner {
    SERVER,
    PRODUCER,
    CONSUMER,
};

export enum SpanAttributes {
    PID = 'service.pid',
    HOST = 'service.host',
};

export type StackTrace = Trace[];

export type Trace = Span[];

export type SpanBag = {
    [key:string]: string;
};

export type Propagation = {
    traceparent?: string;
    tracestate?: string;
};
