import Factory from "../factory";

function Facade() {
    return function(target, _context: ClassMethodDecoratorContext) {
        return function(...args: []) {
            if (!Factory.initialized()) {
                throw new Error('Telemety is not initialized, did you forgot to Temeletry.start()?');
            }

            return target(...args);
        }
    }
}

function Initiator() {
    return function(target, _context: ClassMethodDecoratorContext) {
        return function() {
            if (Factory.initialized()) {
                throw new Error('Telemety is already initialized!');
            }

            return target();
        }
    }
}

export {
    Facade,
    Initiator,
};
