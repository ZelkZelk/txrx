import { Propagation, Spannable } from "../types/telemetry.types";
import Span from "./artifacts/span";

export default abstract class Telemetry {
  protected serviceName: string;
  protected serviceVersion: string;

  public constructor() {
    this.serviceName = `${process.env.PACKAGE!}:${process.env.CONSUMER!}@${process.env.CONSUMER_GROUP!}`;
    this.serviceVersion = process.env.VERSION!;
  }

  public abstract start(): void;
  public abstract span(spannable: Spannable): Span;
  public abstract closeSpan(span: Span);
  public abstract propagate(span: Span): Propagation;
}
