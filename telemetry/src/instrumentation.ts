import { SpanAttributes, Spannable, Spanner, StackTrace } from './../types/telemetry.types';
import Span from "./artifacts/span";
import { Initiator, Facade } from "./decorators/telemetry.decorator";
import Factory from "./factory";
import Telemetry from "./telemetry";
import * as process from 'process';
import * as os from 'os';

export default class Instrumentation {
  private static instance: Telemetry;
  private static active: Span;

  @Initiator()
  public static start() {
    const instance = Factory.get();
    instance.start();
    Instrumentation.instance = instance;
  }

  @Initiator()
  public static service() {
    Instrumentation.start();

    const span = Instrumentation.trace({
      name: process.env.PACKAGE!,
      kind: Spanner.SERVER,
    });

    span.attr(SpanAttributes.HOST, os.hostname());
    span.attr(SpanAttributes.PID, '' +  process.pid);

    Instrumentation.active = span;

    return span;
  }

  @Facade()
  public static trace(spannable: Spannable): Span{
    return Instrumentation.instance.span(spannable);
  }

  @Facade()
  public static end(span: Span) {
    Instrumentation.instance.closeSpan(span);
  }

  @Facade()
  public static producer(name: string, parent?: Span): Span {
    return Instrumentation.trace({
      kind: Spanner.PRODUCER,
      parent: parent ?? Instrumentation.active,
      name,
    });
  }

  @Facade()
  public static consumer(name: string, parent?: Span): Span {
    return Instrumentation.trace({
      kind: Spanner.CONSUMER,
      parent: parent ?? Instrumentation.active,
      name,
    });
  }
}
