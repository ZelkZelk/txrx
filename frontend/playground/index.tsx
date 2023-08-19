import React from 'react';
import ReactDOM from "react-dom/client";
import Playground from '../src/playground';
import '../assets/css/playground.css';

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<Playground url={process.env.REACT_APP_WEBSOCKET_URL}></Playground>);
