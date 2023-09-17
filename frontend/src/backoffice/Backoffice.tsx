import { useEffect, useState } from 'react';
import WebSocketApp from '../websocket/WebsocketApp';
import { Authorized, IBackOfficeProps } from '../../types/backoffice.types';
import WebSocket from 'isomorphic-ws';
import { Outlet, useNavigate } from 'react-router-dom';
import { Reception, Transmission } from '../../types/websocket.types';

export default (props: IBackOfficeProps) => {
    const [auth, setAuth] = useState<Authorized>(null);
    const [tx, setTx] = useState<Transmission>();
    const [rx, setRx] = useState<Reception>();
    const navigate = useNavigate();
    
    useEffect(() => { 
        setAuth(props.auth)
    }, [props.auth]);

    useEffect(() => {
      if (auth) {  
        navigate('dashboard');
      } else {
        navigate('login');
      }
    }, [auth]);

    function onWebSocketClose(_event: WebSocket.CloseEvent) {
        console.log(_event);
    }

    function onWebSocketOpen(_event: WebSocket.Event) {
        console.log(_event);
    }

    function onWebSocketMessage(event: WebSocket.MessageEvent) {
        console.log(event);
        let pong;

        if (event.data.toString().match(/^ping\s\d+/)) {
            pong = event.data.toString().replace(/i/, 'o');
        }

        if (pong) {
            setTx({ 
                message: pong,
                timestamp: Date.now(),
            });   
        }
        else {
            setRx({
                message: event.data.toString(),
                timestamp: Date.now(),
            });
        }
    }

    function onWebSocketError(_event: WebSocket.ErrorEvent) {
        console.log(_event);
    }

    return (
        <WebSocketApp tx={tx} url={props.url} onClose={onWebSocketClose} onError={onWebSocketError} onMessage={onWebSocketMessage} onOpen={onWebSocketOpen}>
            <Outlet context={{ setTx, rx, auth: props.auth, setAuth: props.setAuth }}></Outlet>
        </WebSocketApp>
    );
};
