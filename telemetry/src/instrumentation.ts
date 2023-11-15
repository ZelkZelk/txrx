import { Propagation, SpanAttributes, Spannable, Spanner } from './../types/telemetry.types';
import Span from "./artifacts/span";
import Factory from "./factory";
import Telemetry from "./telemetry";
import * as process from 'process';
import * as os from 'os';

export default class Instrumentation {
  private static instance: Telemetry;
  private static active: Span;

  public static start() {
    const instance = Factory.get();
    instance.start();
    Instrumentation.instance = instance;
  }

  public static activate(span: Span) {
    Instrumentation.active = span;
  }

  public static service() {
    Instrumentation.start();

    const spannable: Spannable = {
      name: `srv:${process.env.PACKAGE!}`,
      kind: Spanner.SERVER,
    };

    const span = Instrumentation.trace(spannable);

    span.attr(SpanAttributes.HOST, os.hostname());
    span.attr(SpanAttributes.PID, '' +  process.pid);

    Instrumentation.active = span;

    return span;
  }

  public static trace(spannable: Spannable): Span {
    return Instrumentation.instance.span(spannable);
  }

  public static end(span: Span) {
    Instrumentation.instance.closeSpan(span);
  }

  public static producer(name: string, maybeParent?: Span | false | Propagation): Span {
    return Instrumentation.trace({
      kind: Spanner.PRODUCER,
      name,
      ...Instrumentation.maybeSpannable(maybeParent),
    });
  }

  private static maybeSpannable(maybeParent?: Span | false | Propagation): Partial<Spannable> {
    let parent: Span;
    let propagation: Propagation;

    if (maybeParent !== false) {
      if (maybeParent instanceof Span) {
        parent = maybeParent;
      }
      else if (typeof maybeParent !== 'undefined') {
        propagation = maybeParent as Propagation;
      } else {
        parent = Instrumentation.active;
      }
    }

    return {
      parent,
      propagation,
    };
  }

  public static consumer(name: string, maybeParent?: Span | false | Propagation): Span {
    return Instrumentation.trace({
      kind: Spanner.CONSUMER,
      name,
      ...Instrumentation.maybeSpannable(maybeParent),
    });
  }

  public static propagate(span: Span): Propagation {
    return Instrumentation.instance.propagate(span);
  }
}
