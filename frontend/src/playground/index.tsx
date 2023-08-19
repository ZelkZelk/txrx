import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import WebSocketApp from '../websocket';
import Message from './message';
import WebSocket from 'isomorphic-ws';
import { PlaygroundMessage, PlaygroundMessageType } from '../../types/playground.types';
import { Transmission } from '../../types/websocket.types';

export default ({ url }) => {
    const [autoPong, setAutoPong] = useState<boolean>(true) as [boolean, Function];
    const [tx, setTx] = useState<Transmission>() as [Transmission, Function];
    const [message, setMessage] = useState<string>('') as [string, Function];
    const [logs, setLogs] = useState([] as PlaygroundMessage[]) as [PlaygroundMessage[], Function];
    const logPanel = useRef(null);
    const autoPongRef = useRef();
    autoPongRef.current = autoPong;

    useEffect(() => {
        document.body.classList.add(
            'fixed', 
            'overflow-hidden',
            'w-full',
            'min-h-full',
            'flex',
            'text-gray-900',
            'bg-white');

        document.getElementById('root').classList.add('playground');

        document.addEventListener('keydown', keydownHandler);

        const lastChildElement = logPanel.current?.lastElementChild;
        lastChildElement?.scrollIntoView({ behavior: 'smooth' });

        return () => {
            document.removeEventListener('keydown', keydownHandler);
        };
    }, [keydownHandler, logPanel]);

    function keydownHandler(event) {
        if (event.keyCode === 13 && event.ctrlKey) {
            onSendClick(event);
        }
    }

    function onMessageChange (event) {
        setMessage(event.target.value);
    }

    function onSendClick(_event) {
        const cmd = message.trim();

        if (cmd.length > 0) {
            let type = PlaygroundMessageType.TX;

            if (cmd.match(/^pong\s/)) {
                type = PlaygroundMessageType.PONG;
            }

            setTx({
                message: cmd,
                timestamp: Date.now(),
            });
            setLogs(current => [...current, [type, cmd]]);
        }
        
        setMessage('');
    }

    function onWebSocketClose(_event: WebSocket.CloseEvent) {
        setLogs(current => [...current, [PlaygroundMessageType.CLOSE, `Disconnected from ${url}`]]);
    }

    function onWebSocketOpen(_event: WebSocket.Event) {
        setLogs(current => [...current, [PlaygroundMessageType.OPEN, `Connected to ${url}`]]);
    }

    function onWebSocketMessage(event: WebSocket.MessageEvent) {
        let type = PlaygroundMessageType.RX;
        let pong;

        if (event.data.toString().match(/^ping\s\d+/)) {
            type = PlaygroundMessageType.PING;

            if (autoPongRef.current) {
                pong = event.data.toString().replace(/i/, 'o');
            }
        }

        setLogs(current => [...current, [type, event.data]]);

        if (pong) {
            setTx({ 
                message: pong,
                timestamp: Date.now(),
            });   
            setLogs(current => [...current, [PlaygroundMessageType.PONG, pong]]);
        }
    }

    function onWebSocketError(event: WebSocket.ErrorEvent) {
        setLogs(current => [...current, [PlaygroundMessageType.ERROR, event.error ?? event.message ?? event.type]]);
    }

    function onAutoPongChange(event) {
        setAutoPong(event.target.checked);
    }

    return (
        <WebSocketApp tx={tx} url={url} onClose={onWebSocketClose} onError={onWebSocketError} onMessage={onWebSocketMessage} onOpen={onWebSocketOpen}>
            <header className="border-b-solid border-b-2 border-b-indigo-600 relative z-20 flex-none py-3 pl-5 pr-3 sm:pl-6 sm:pr-4 md:pr-3.5 lg:px-6 flex items-center space-x-4 antialiased">
                <div className="flex-auto flex items-center min-w-0 space-x-6">
                    <h1 className="font-bold text-xl">Playground</h1>
                </div>
            </header>
            <main className="flex-auto relative border-t border-gray-200">
                <div className="SplitPane vertical">
                    <div className="Pane vertical Pane1 border-r-solid border-r-2 border-r-indigo-600">
                        <div className="flex flex-auto">
                            <div className="SplitPane horizontal">
                                <div className="Pane horizontal Pane1">
                                    <div className="absolute inset-0 w-full h-full">
                                        <textarea value={message} onChange={onMessageChange} autoFocus className="p-6"></textarea>
                                    </div>
                                </div>
                                <div className="Pane horizontal Pane0 items-center font-bold text-xl bg-indigo-100 p-6">
                                    <div className="flex flex-col overflow-auto items-center gap-y-6">
                                        <div className="flex items-center">
                                            <input checked={autoPong} onChange={onAutoPongChange} id="autopong-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                                            <label htmlFor="autopong-checkbox" className="ml-2 text-sm font-medium text-gray-900">Automatic Ping Pong</label>
                                        </div>
                                    </div>
                                </div>
                                <div onClick={onSendClick} title="Send (ctrl + enter)" className="Pane horizontal Pane2 bg-indigo-600 text-white items-center justify-center font-bold text-xl cursor-pointer">
                                    Send &nbsp;
                                    <button className="btn btn-blue">
                                        <PaperAirplaneIcon className="h-6 w-6"></PaperAirplaneIcon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="Pane vertical Pane2">
                        <div className="flex flex-auto">
                            <div className="SplitPane horizontal">
                                <div className="Pane horizontal Pane1">
                                    <pre ref={logPanel} className="overflow-x-hidden overflow-y-auto absolute inset-0 w-full h-full p-6">
                                        {logs.map((log, i) => {
                                            return (<Message type={log[0]} message={log[1]} key={i + ''}></Message>)
                                        })}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </WebSocketApp>
    );
};
