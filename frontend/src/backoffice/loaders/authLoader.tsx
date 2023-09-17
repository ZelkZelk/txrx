import { Authorized } from '../../../types/backoffice.types'
import { redirect } from "react-router-dom";

const shouldBeUnauthorized = (auth: Authorized) => {
    if (auth && auth.expires > Date.now()) {
        return redirect(process.env.REACT_APP_BACKOFFICE_PREFIX_URL! +  '/dashboard');
    }

    return null;
};

const shouldBeAuthorized = (auth: Authorized) => {
    if ((auth && auth.expires > Date.now())) {
        return null;
    }

    return redirect(process.env.REACT_APP_BACKOFFICE_PREFIX_URL! +  '/login');
};

export {
    shouldBeUnauthorized,
    shouldBeAuthorized,
};
