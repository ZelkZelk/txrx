import React from 'react';
import { IPlaygroundMessage, PlaygroundMessageType } from '../../types/playground.types';

export default (props: IPlaygroundMessage) => {
    switch(props.type) {
        case PlaygroundMessageType.CLOSE:
            return (
                <div className="text-orange-800">- {props.message}</div>
            );
        case PlaygroundMessageType.OPEN:
            return (
                <div className="text-emerald-800">+ {props.message}</div>
            );
        case PlaygroundMessageType.ERROR:
            return (
                <div className="text-red-600">? {props.message}</div>
            );
        case PlaygroundMessageType.RX:
            return (
                <div className="text-rose-600">&lt; {props.message}</div>
            );
        case PlaygroundMessageType.TX:
            return (
                <div className="text-fuchsia-600">&gt; {props.message}</div>
            );
        case PlaygroundMessageType.PING:
            return (
                <div className="text-fuchsia-600">&lt; {props.message}</div>
            );
        case PlaygroundMessageType.PONG:
            return (
                <div className="text-rose-600">&gt; {props.message}</div>
            );
    }

    return (<></>);
}