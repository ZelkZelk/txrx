import { createState } from 'state-pool';
import { Authorized, Roles } from '../../../types/backoffice.types'
import { redirect } from "react-router-dom";

const authorized = createState<Authorized>(null);

const shouldBeUnauthorized = () => {
    const auth: Authorized = authorized.getValue();

    if (auth && auth.expires > Date.now()) {
        return redirect('/');
    }

    return null;
};

const shouldBeAuthorized = () => {
    const auth: Authorized = authorized.getValue();

    if (auth && auth.expires > Date.now()) {
        return null;
    }

    return redirect('/');
};

export {
    authorized,
    shouldBeUnauthorized,
    shouldBeAuthorized,
};
