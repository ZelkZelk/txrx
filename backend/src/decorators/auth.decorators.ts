import { Handler } from "rpc"
import { Computation } from "rpc/types/rpc.types"
import { User } from "../storage";

export function Allow(...required: string[]) {
    return function(target: (...args: string[]) => Promise<Computation> , _context: ClassMethodDecoratorContext) {    
        function authorized(this: Handler, ...args: string[]): Promise<Computation> {
            const [_, conn] = args;
            const user = new User();

            return user.whois(conn)
                .then((auth: string[]): string[] => {
                    const [user, ...roles] = auth;

                    args.unshift(user);

                    return roles;
                })
                .then((roles: string[]): Computation => {
                    for (const role of required) {
                        if (!roles.includes(role)) {
                            return this.rx(true, 'forbidden');
                        }
                    }

                    return target.call(this, ...args);
                });
        }

        return authorized;
    }   
}