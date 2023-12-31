import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import opentelemetry, { Context, SpanKind, Tracer } from '@opentelemetry/api';
import { Span as OTelSpan } from '@opentelemetry/api';
import { Propagation, Spannable, Spanner, TELEMETRY } from '../types/telemetry.types';
import Telemetry from "./telemetry";
import Span from './artifacts/span';

export default class OpenTelemetry extends Telemetry {
    private sdk: NodeSDK | null;
    
    constructor() {
        super();

        const telemetry = process.env.TELEMETRY! as TELEMETRY;
    
        switch (telemetry){
            case TELEMETRY.CONSOLE:
                this.sdk = new NodeSDK({
                    resource: new Resource({
                        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
                        [SemanticResourceAttributes.SERVICE_VERSION]: this.serviceVersion,
                    }),
                    traceExporter: new ConsoleSpanExporter(),
                    metricReader: new PeriodicExportingMetricReader({
                        exporter: new ConsoleMetricExporter(),
                    }),
                });
                break;
            case TELEMETRY.EXPORTED:
                const ioredis = new IORedisInstrumentation();
                ioredis.enable();

                this.sdk = new NodeSDK({
                    resource: new Resource({
                        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
                        [SemanticResourceAttributes.SERVICE_VERSION]: this.serviceVersion,
                    }),
                    traceExporter: new OTLPTraceExporter({
                        url: process.env.OTLP_ENDPOINT + '/v1/traces',
                        headers: {},
                    }),
                    metricReader: new PeriodicExportingMetricReader({
                        exporter: new OTLPMetricExporter({
                            url: process.env.OTLP_ENDPOINT + 'v1/metrics', 
                            headers: {},
                        }),
                    }),
                    instrumentations: [ioredis],
                });
                break;
            case TELEMETRY.NOTEL:
            default:
                console.debug(`NOTEL for ${this.serviceName} ${this.serviceVersion}`);
                this.sdk = null;
        }
    }

    private tracer(): Tracer {
        return opentelemetry.trace.getTracer(this.serviceName, this.serviceVersion);
    }

    public start() {
        if (this.sdk) {
            this.sdk.start();
        }
    }

    public startSpan(span: Span): OTelSpan {
        const tracer = this.tracer();
        const parent = span.parent();
        const kind = this.spanKind(span.kind());
        const propagation = span.propagation();
        let name = span.name();
        let ctx: Context;

        if (parent) {
            const artifact = parent.get();

            if (artifact) {
                ctx = opentelemetry.trace.setSpan(
                    opentelemetry.context.active(),
                    artifact,
                );
            }
        } else if (propagation) {
            ctx = opentelemetry.propagation.extract(opentelemetry.context.active(), propagation);
        }
    
        return tracer.startSpan(name, { kind }, ctx);
    }

    public span(spannable: Spannable): Span {
        const span = new Span(spannable);
        const artifact = this.startSpan(span);
        span.attach(artifact);
        return span;
    }   
    
    public closeSpan(span: Span) {
        const artifact = (span.get()) as OTelSpan;
        
        if (artifact) {
            artifact.setAttributes(span.attributes());
            artifact.end();
        }
    }

    public propagate(span: Span): Propagation {
        const output = {} as Propagation;

        const ctx = opentelemetry.trace.setSpan(
            opentelemetry.context.active(),
            span.get(),
        );

        opentelemetry.propagation.inject(ctx, output);
        return output;
    }

    private spanKind(spanner: Spanner): SpanKind {
        switch(spanner) {
            case Spanner.SERVER:
                return SpanKind.SERVER;
            case Spanner.PRODUCER:
                return SpanKind.PRODUCER;
            case Spanner.CONSUMER:
                return SpanKind.CONSUMER;
        }

        return SpanKind.INTERNAL;
    }
}