"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { v4 as uuid } from "uuid";
import { FiAlertCircle, FiAlertOctagon } from "react-icons/fi";

interface Toast {
    id: string;
    component: ReactNode;
}

interface ToastContextValue {
    open: (component: ReactNode, timeout?: number) => string;
    close: (id: string) => void;
    toastWarning: (headerText : string, bodyText : string) => ReactNode;
    toastError: (headerText : string, bodyText : string) => ReactNode;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const close = (id: string) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    };

    const open = (component: ReactNode, timeout = 12000) => {
        const id = uuid();
        setToasts((currentToasts) => [...currentToasts, { id, component }]);
        window.setTimeout(() => close(id), timeout);
        return id;
    };

    const toastWarning = (headerText : string, bodyText : string = "") : ReactNode => {
        return (
            <div className="toast toast-warning">
                <FiAlertCircle size={40}></FiAlertCircle>
                <div>
                    <h3>{headerText}</h3>
                    <p>{bodyText}</p>
                </div>
            </div>
        )
    }

    const toastError = (headerText : string, bodyText : string = "") : ReactNode => {
        return (
            <div className="toast toast-error">
                <FiAlertOctagon size={40}></FiAlertOctagon>
                <div>
                    <h3>{headerText}</h3>
                    <p>{bodyText}</p>
                </div>
            </div>
        )
    }

    return (
        <ToastContext.Provider value={{ open, close, toastWarning, toastError }}>
            {children}
            <div className="toast-provider">
                {toasts.map(({ id, component }) => (
                    <div key={id} className="relative m-2">
                        <button onClick={() => close(id)} className="toast-close-button">
                            X
                        </button>
                        {component}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastContext;