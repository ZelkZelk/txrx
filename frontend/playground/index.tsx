import ReactDOM from "react-dom/client";
import '../assets/playground.css';
import { StrictMode, lazy } from "react";

const Playground = lazy(() => import('../src/playground/Playgound'));
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
    <StrictMode>
        <Playground url={process.env.REACT_APP_WEBSOCKET_URL}></Playground>
    </StrictMode>
);
