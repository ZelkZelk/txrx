import { State } from "state-pool";

export type Authorized = {
    expires: number;
    roles: Roles[];
    user: User;
};

export type User = {
    id: number;
    handle: string;
    email: string;
};

export type Roles = 'ADMIN';

export type IBackOfficeProps = {
    url: string;
    auth: State<Authorized>;
};
