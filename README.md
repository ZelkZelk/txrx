# ToxRox Core

Containerized stream-based websocket RPC architecture.

```mermaid
sequenceDiagram
    Frontend->>Websocket: hello
    Websocket->>Redis: XADD TX hello
    Dispatcher-->>Redis: XREADGROUP TX
    Redis-->>Dispatcher: hello
    Dispatcher-->>Redis: XADD RPC hello
    RPC-->>Redis: XREADGROUP RPC
    Redis-->>RPC: hello
    RPC-->>Redis: XADD RX hi
    Websocket-->>Redis: XREADGROUP RX
    Redis-->>Websocket: hi
    Websocket-->>Frontend: hi
```

## Introduction

The ToxCore project offers a collection of packages, which, when put in containerized harmony, allow the underlying architecture to be deployed.

## Packages

Each package play a key role in the architecture.

- consumer: 
- streamer:
- disatcher:
- websocket:
- backend: 
- frontend:
- p2p:
- rpc:
