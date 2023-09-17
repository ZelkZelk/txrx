import { lazy, Suspense, StrictMode, useEffect, useState } from 'react';
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { shouldBeAuthorized, shouldBeUnauthorized } from '../src/backoffice/loaders/authLoader';
import Loading from '../src/backoffice/components/Loading';
import Splash from '../src/backoffice/components/Splash';
import '../assets/backoffice.css';
import '../assets/satoshi.css';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import useLocalStorage from '../src/backoffice/hooks/useLocalStorage';
import { Authorized } from '../types/backoffice.types';
import u from '../src/backoffice/URL';

i18n
  .use(initReactI18next)
  .init({
    lng: "es", 
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    }
  });

const Backoffice = lazy(() => import('../src/backoffice/Backoffice'));
const Login = lazy(() => import('../src/backoffice/pages/LoginPage'));
const Dashboard = lazy(() => import('../src/backoffice/pages/DashboardPage'));
const AuthLayout = lazy(() => import('../src/backoffice/layout/AuthLayout'));
const ErrorLayout = lazy(() => import('../src/backoffice/layout/ErrorLayout'));
const NotFoundLayout = lazy(() => import('../src/backoffice/layout/NotFoundLayout'));

const EntryPoint = () => {
  const [auth, setAuth] = useLocalStorage<Authorized>('auth', null);
  const [_user, setUser] = useState<Authorized>(null);

  useEffect(() => {
    setUser(auth);
  }, [auth]);

  const router = createBrowserRouter([
    {
      path: u('/'),
      element: <Backoffice url={process.env.REACT_APP_WEBSOCKET_URL!} auth={auth} setAuth={setAuth}/>,
      errorElement: <ErrorLayout />,
      children: [{
          path: 'login',
          errorElement: <ErrorLayout />,
          element: <Login />,
          loader: shouldBeUnauthorized.bind(this, auth),   
      }, {
          element: <AuthLayout />,
          errorElement: <ErrorLayout />,
          loader: shouldBeAuthorized.bind(this, auth),
          children: [{
            path: 'dashboard',
            errorElement: <ErrorLayout />,
            element: <Dashboard />
          }],
      }]
    }, {
      path: '*',
      element: <NotFoundLayout />,
    }
  ]);

  return (
    <StrictMode>
      <Splash>
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
        </Suspense>
      </Splash>
    </StrictMode>
  )
};

ReactDOM.createRoot(document.getElementById('root')).render(<EntryPoint />);
