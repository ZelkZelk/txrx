import { useState, useEffect } from 'react';
import Client from '../websocket/client';
import { Subscription } from 'rxjs';
import { IWebSocketApp, WebSocketEventType, WebSocketUpdate } from '../../types/websocket.types';
import WebSocket from 'isomorphic-ws';
import { PropsWithChildren } from 'react'
import { createState } from 'state-pool';

const theClient = createState<Client>(null);

export default (props: IWebSocketApp) => {
    const [client, setClient] = theClient.useState();
    const [subscription, setSubscription] = useState<Subscription>() as [Subscription, Function];
    const [connection, setConnection] = useState<WebSocket>() as [WebSocket, Function];
    const propsWithChildren = props as PropsWithChildren<IWebSocketApp>;

    if (!client) {
        setClient(new Client(props.url));
    } else {
        if (!subscription) {
            setSubscription(client.subscribe(websocketUpdate));
        } else if (!connection) {
            setConnection(client.connect());
        }
    }

    useEffect(() => {
        if (props.tx) {
            if (props.tx.message.length > 0) {
                if (client) {
                    client.send(props.tx.message);
                }
            }
        }
    }, [props.tx, subscription]);

    function websocketUpdate(update: WebSocketUpdate) {
        const [type, event] = update;

        switch (type) {
            case WebSocketEventType.CLOSE:
                return props.onClose(event as WebSocket.CloseEvent);
            case WebSocketEventType.OPEN:
                return props.onOpen(event as WebSocket.Event);
            case WebSocketEventType.ERROR:
                return props.onError(event as WebSocket.ErrorEvent);
            case WebSocketEventType.MESSAGE:
                return props.onMessage(event as WebSocket.MessageEvent);
        }
    }

    return (
        <>{propsWithChildren.children}</>
    );
};
