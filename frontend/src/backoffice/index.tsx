import { useState, useEffect } from 'react';
import WebSocketApp from '../websocket';
import { Transmission } from '../../types/websocket.types';
import { IBackOfficeProps } from '../../types/backoffice.types';
import WebSocket from 'isomorphic-ws';
import { Outlet, useNavigate } from 'react-router-dom';

export default (props: IBackOfficeProps) => {
    const [tx, setTx] = useState<Transmission>() as [Transmission, Function];
    const [auth] = props.auth.useState();
    const navigate = useNavigate();
  
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
    }

    function onWebSocketError(_event: WebSocket.ErrorEvent) {
        console.log(_event);
    }
    
    return (
        <WebSocketApp tx={tx} url={props.url} onClose={onWebSocketClose} onError={onWebSocketError} onMessage={onWebSocketMessage} onOpen={onWebSocketOpen}>
            <Outlet></Outlet>
        </WebSocketApp>
    );
};
