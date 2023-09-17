import { useState, useEffect } from 'react';
import Client from './Client';
import { Subscription } from 'rxjs';
import { IWebSocketApp, WebSocketEventType, WebSocketUpdate } from '../../types/websocket.types';
import WebSocket from 'isomorphic-ws';
import { PropsWithChildren } from 'react'
import { createState } from 'state-pool';
import Loading from '../backoffice/components/Loading';

const theClient = createState<Client>(null);

export default (props: IWebSocketApp) => {
    const [client, setClient] = theClient.useState();
    const [_, setInit] = useState(false);
    const [open, setOpen] = useState(false);
    const [subscription, setSubscription] = useState<Subscription>();
    const [connection, setConnection] = useState<WebSocket>();
    const propsWithChildren = props as PropsWithChildren<IWebSocketApp>;

    if (!client) {
        setClient(Client.get(props.url));
        setInit(true);
    } else {
        if (!subscription) {
            setSubscription(client.subscribe(websocketUpdate));
        } else if (!connection) {
            setConnection(client.connect());
        } else if (!open) {
            setOpen(true);
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
                setOpen(false);
                return props.onClose(event as WebSocket.CloseEvent);
            case WebSocketEventType.OPEN:
                setOpen(true);
                return props.onOpen(event as WebSocket.Event);
            case WebSocketEventType.ERROR:
                return props.onError(event as WebSocket.ErrorEvent);
            case WebSocketEventType.MESSAGE:
                return props.onMessage(event as WebSocket.MessageEvent);
        }
    }

    return open ? (
        <>{propsWithChildren.children}</>
    ) : (<Loading />);
};
