import { Handler, RPC } from "rpc";
import { Computation } from "rpc/types/rpc.types";
import { User } from '../../storage';
import { Allow } from '../../decorators/auth.decorators';

export default class Auth extends Handler {
    @RPC
    public async login(data: string, conn: string): Promise<Computation> {
        const [_, handle, ...rest] = data.split(' ');
        const password = rest.join(' ');
        const messages: string[] = [];
        const user = new User();
        const authorized: string[] = await user.login(handle, password);

        if (authorized.length > 0) {
            messages.push(['authorized', ...await user.authorize(conn, authorized)].join(' '));
        }
        else {
            messages.push(['unauthorized', ...await user.deauthorize(handle, conn)].join(' '));
        }
        
        return this.rx(true, ...messages);
    }
    
    @RPC
    public async logout(_: string, conn: string): Promise<Computation> {
        const user = new User();
        
        await user.logout(conn);
        
        return this.rx(true, 'deauthorized');
    }

    @RPC
    public async recoverPassword(data: string): Promise<Computation> {
        const [_, handle] = data.split(' ');
        const messages: string[] = [];

        const user = new User();
        const [code, expires] = await user.recoverPassword(handle);

        if (code !== null) {
            messages.push('recovery sent');
        }
        else {
            if (expires === null) {
                messages.push('nothing to recover');
            } else {
                messages.push(`recovery wait ${expires}`);
            }
        }

        return this.rx(true, ...messages);
    }

    @RPC
    public async resetPassword(data: string): Promise<Computation> {
        const [_, handle, pin, ...rest] = data.split(' ');
        const password = rest.join(' ');
        const messages: string[] = [];

        const user = new User();
        const [changed, expires] = await user.resetPassword(handle, pin, password);

        if (changed) {
            messages.push('password updated');
        }
        else {
            if (expires === null) {
                messages.push('nothing to reset');
            } else {
                messages.push(`reset wait ${expires}`);
            }
        }

        return this.rx(true, ...messages);
    }

    @RPC
    public async authorize(data: string, conn: string): Promise<Computation> {
        const [_, handle, otl] = data.split(' ');
        const messages: string[] = [];
        const user = new User();
        const authorized: string[] = await user.otl(conn, handle, otl);

        if (authorized.length > 0) {
            messages.push(['authorized', ...authorized].join(' '));
        }
        else {
            messages.push(['unauthorized', ...await user.deauthorize(handle, conn)].join(' '));
        }
        
        return this.rx(true, ...messages);
    }
    
    @RPC
    @Allow('ADMIN')
    public async me(authorized: string): Promise<Computation> {
        const user = new User();
        const identity = await user.whoami(authorized);
        const data = ['you', JSON.stringify(identity)];

        return this.rx(true, data.join('\n'));
    }
}