import { Dispatch, SetStateAction } from "react";
import { Subscription } from "rxjs";
import { Transmission, Reception } from "./websocket.types";

export type Authorized = {
    expires: number;
    roles: Roles[];
    user?: User;
    token: string;
    handle: string;
};

export type User = {
    id: number;
    handle: string;
    email: string;
};

export enum Roles {
    ADMIN = 'ADMIN',
};

export type IBackOfficeProps = {
    url: string;
    auth: Authorized;
    setAuth: Dispatch<SetStateAction<Authorized>>;
};

export type ISplash = {
    children: React.ReactNode;
};

export type IFormValidationProps = {
    error?: string;
};

export type IOutletContext = {
    rx?: Reception,
    setTx: Dispatch<SetStateAction<Transmission>>;
    auth: Authorized;
    setAuth: Dispatch<SetStateAction<Authorized>>;
};

export type IWaitingSubmitProps = {
    className?: string;
    value: string;
    waiting: boolean;
    waitingValue: string;
};

export enum AlertType {
    WARNING,
    SUCCESS,
    FAILURE,
};

export type IAlertProps = {
    title: string;
    message?: string;
    type: AlertType;
    fadeOut: boolean;
};

export enum AuthState {
    NOTHING,
    AUTHORIZE,
    AUTHORIZING,
    VALIDATE,
    VALIDATING,
    AUTHORIZED,
    COMPLETED,
    LOGOUT,
};