import { TELEMETRY } from "../../types/telemetry.types";

function WithSdk() {
    return function(target, _context: ClassMethodDecoratorContext) {
        const telemetry = process.env.TELEMETRY! as TELEMETRY;

        if (telemetry === TELEMETRY.CONSOLE || telemetry === TELEMETRY.EXPORTED) {
            return target;    
        }

        return () => {
            return undefined;
        };
    }
}


export {
    WithSdk,
};
