
import { useEffect, useState } from 'react';
import Header from './../components/Header';
import Sidebar from './../components/Sidebar';
import { Outlet, useOutletContext } from 'react-router-dom';
import { AuthState, IOutletContext, Roles, User } from '../../../types/backoffice.types';
import Loading from '../components/Loading';

export default () => {
    const { rx, setTx, auth, setAuth } = useOutletContext<IOutletContext>();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authState, setAuthState] = useState<AuthState>(AuthState.NOTHING);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        switch(authState) {
            case AuthState.NOTHING:
                setAuthState(AuthState.AUTHORIZE);
                return;
            case AuthState.AUTHORIZE:
                setAuthState(AuthState.AUTHORIZING);
                setTx({
                    message: `authorize ${auth.handle} ${auth.token}`,
                    timestamp: Date.now(),
                });
                return;
            case AuthState.VALIDATE:
                setAuthState(AuthState.VALIDATING);
                setTx({
                    message: 'me',
                    timestamp: Date.now(),
                });
                return;
            case AuthState.AUTHORIZED:
                timeout = setTimeout(() => {
                    setAuthState(AuthState.COMPLETED);
                }, 500);
                return;
            case AuthState.COMPLETED:
                return;
            case AuthState.LOGOUT:
                timeout = setTimeout(() => {
                    setAuth(null);
                }, 500);
                return;
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [authState]);

    useEffect(() => {
        if (rx) {
            if(rx.message.match(/^unauthorized\s/)) {
                setAuth(null);
            }
            else if(rx.message.match(/^authorized\s/) && authState === AuthState.AUTHORIZING) {
                const [_, expires, token, ...roles] = rx.message.split(' ');
                const freshAuth = {
                    expires: parseInt(expires),
                    roles: roles as Roles[],
                    token,
                    handle: auth.handle,
                };
                
                setAuth(freshAuth);
                setAuthState(AuthState.VALIDATE);
            }
            else if(rx.message.match(/^you\n/) && authState === AuthState.VALIDATING) {
                const [_, userJson] = rx.message.split(/\n/);
    
                const user = JSON.parse(userJson) as User;
    
                const freshAuth = {
                    ...auth,
                    user: user,
                };
                
                setAuth(freshAuth);
                setAuthState(AuthState.AUTHORIZED);
            }
        }
    }, [rx]);

    return authState === AuthState.COMPLETED && auth?.user ? (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
            {/* <!-- ===== Sidebar Start ===== --> */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Sidebar End ===== --> */}
    
            {/* <!-- ===== Content Area Start ===== --> */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* <!-- ===== Header Start ===== --> */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setAuthState={setAuthState} user={auth.user} />
                {/* <!-- ===== Header End ===== --> */}
    
                {/* <!-- ===== Main Content Start ===== --> */}
                <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    <Outlet context={{ setTx, rx, auth }} />
                </div>
                </main>
                {/* <!-- ===== Main Content End ===== --> */}
            </div>
            {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    ) : (<Loading/>);
};
