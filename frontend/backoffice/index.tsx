import React from 'react';
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Backoffice from '../src/backoffice';
import Login from '../src/backoffice/login';
import Dashboard from '../src/backoffice/dashboard';
import { shouldBeAuthorized, shouldBeUnauthorized, authorized } from '../src/backoffice/auth';
import '../assets/backoffice.css';
import '../assets/satoshi.css';

const router = createBrowserRouter([
  {
    path: process.env.REACT_APP_BACKOFFICE_PREFIX_URL! +  '/',
    element: <Backoffice url={process.env.REACT_APP_WEBSOCKET_URL!} auth={authorized} />,
    children: [{
        path: 'login',
        element: <Login />,
        loader: shouldBeUnauthorized,   
    }, {
        path: 'dashboard',
        element: <Dashboard />,
        loader: shouldBeAuthorized,
    }]
  }, 
]);

ReactDOM.createRoot(document.getElementById("root")).render(    
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
