import { useEffect, useState } from "react";
import { IWaitingSubmitProps } from "../../../types/backoffice.types";

export default function(props: IWaitingSubmitProps) {
    const [waiting, setWaiting] = useState<boolean>();
    const [ellipsis, setEllipsis] = useState<string>('');

    useEffect(() => {
        let interval;

        if (waiting) {
            interval = setInterval(() => {
                if (ellipsis.length > 2) {
                    setEllipsis('');
                } else {
                    setEllipsis(ellipsis + '.');
                }
            }, 500);
        }
        else {
            setEllipsis('');
        }

        return () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };
    }, [waiting, ellipsis]);

    useEffect(() => {
        setWaiting(props.waiting);
    }, [props.waiting]);    

    return waiting ? (
        <input
            disabled={true}
            type="submit"
            value={props.waitingValue + ellipsis}
            className={'cursor-wait ' + props.className}
        />
    ) : (
        <input
            type="submit"
            value={props.value}
            className={props.className}
        />
    );
};
