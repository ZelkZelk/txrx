import Telemetry from "./telemetry";
import OpenTelemetry from './openTelemetry';

export default class Factory {
  private static instance: Telemetry;

  public static initialized(): boolean {
    return typeof Factory.instance !== 'undefined';
  }

  public static get(): Telemetry {
    if (typeof Factory.instance === 'undefined') {
        Factory.instance = new OpenTelemetry();
    }

    return Factory.instance;
  }
}
