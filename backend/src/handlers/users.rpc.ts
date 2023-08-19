import { Handler, RPC } from 'rpc';
import { Allow } from '../decorators/auth.decorators';
import { Computation } from 'rpc/types/rpc.types';
import { User } from '../storage';

export default class Users extends Handler {
    @RPC
    @Allow('ADMIN')
    public async me(authorized: string): Promise<Computation> {
        const user = new User();
        const identity = await user.whoami(authorized);
        const data = ['you', JSON.stringify(identity)];

        return this.rx(true, data.join('\n'));
    }
}