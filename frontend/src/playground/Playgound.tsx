import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import WebSocketApp from '../websocket/WebsocketApp';
import Message from './Message';
import WebSocket from 'isomorphic-ws';
import { PlaygroundMessage, PlaygroundMessageType } from '../../types/playground.types';
import { Transmission } from '../../types/websocket.types';

export default ({ url }) => {
    const [autoPong, setAutoPong] = useState<boolean>(true) as [boolean, Dispatch<SetStateAction<boolean>>];
    const [tx, setTx] = useState<Transmission>() as [Transmission, Dispatch<SetStateAction<Transmission>>];
    const [message, setMessage] = useState<string>('') as [string, Dispatch<SetStateAction<string>>];
    const [logs, setLogs] = useState([] as PlaygroundMessage[]) as [PlaygroundMessage[], Dispatch<SetStateAction<PlaygroundMessage[]>>];
    const logPanel = useRef(null);
    const autoPongRef = useRef<boolean>();
    const [messageNumbers, setMessageNumbers] = useState<string>('1');
    const [multiTx, setMultiTx] = useState<Transmission[]>([]);
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

    useEffect(() => {
        if (multiTx.length > 0) {
            const tx = multiTx.shift();

            setTx(tx);
            setMultiTx(multiTx);
        }
    }, [tx, multiTx]);

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
            let numbers = parseInt(messageNumbers);

            if (isNaN(numbers) || numbers <= 0) {
                numbers = 1;
            }

            let type = PlaygroundMessageType.TX;

            if (cmd.match(/^pong\s/)) {
                type = PlaygroundMessageType.PONG;
            }

            const multi: Transmission[] = [];

            for(let i = 0; i < numbers;i++) {
                multi.push({
                    message: cmd,
                    timestamp: i,
                });
            }

            setMultiTx(multi);
            setLogs(current => [...current, [type, cmd]]);
            setMessageNumbers('' + numbers);
        }
        
        setMessage('');
    }

    function onWebSocketClose(_event: WebSocket.CloseEvent) {
        setLogs(current => [...current, [PlaygroundMessageType.CLOSE, `Disconnected from ${url}`]]);
    }

    function onWebSocketOpen(_event: WebSocket.Event) {
        setLogs(current => [...current, [PlaygroundMessageType.OPEN, `Connected to ${url}`]]);
    }

    function onMessageNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMessageNumbers(event.target.value);
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

        setLogs(current => [...current, [type, event.data.toString()]]);

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
                                <div className="Pane horizontal Pane0 items-center font-bold text-xl bg-indigo-100 px-6 py-6 pb-0">
                                    <div className="flex flex-col overflow-auto w-full">
                                        <div className="flex items-center">
                                            <label htmlFor="messages-number" className="pr-40 ml-2 text-sm font-medium text-gray-900">Number of Messages</label>
                                            <input value={messageNumbers} onChange={onMessageNumberChange} id="messages-number" type="text" className="p-2 text-gray-800 border border-gray-300 rounded-lg bg-gray-50 sm:text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 grow bg-gray-100 border-gray-300" />
                                        </div>
                                    </div>
                                </div>
                                <div className="Pane horizontal Pane0 items-center font-bold text-xl bg-indigo-100 px-6 py-6">
                                    <div className="flex flex-col overflow-auto w-full">
                                        <div className="flex items-center">
                                            <label htmlFor="autopong-checkbox" className="pr-40 grow ml-2 text-sm font-medium text-gray-900">Automatic Ping Pong</label>
                                            <input checked={autoPong} onChange={onAutoPongChange} id="autopong-checkbox" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
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
