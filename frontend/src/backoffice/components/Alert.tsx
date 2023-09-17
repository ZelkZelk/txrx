import { useEffect, useState } from "react";
import { IAlertProps, AlertType } from "../../../types/backoffice.types";

export default function(props: IAlertProps) {
    const [fadeIn, setFadeIn] = useState<boolean>(false);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    useEffect(() => {
        let timeout;

        if (props.fadeOut) {
            timeout = setTimeout(() => {
                setFadeOut(true);
            }, 50);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [props.fadeOut]);

    useEffect(() => {
        let timeout;

        if (!fadeIn) {
            timeout = setTimeout(() => {
                setFadeIn(true);
            }, 50);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [fadeIn]);

    let opacity;

    if (fadeIn) {
        if (fadeOut) {
            opacity = 'opacity-0';
        } else {
            opacity = 'opacity-100';
        }
    } else {
        opacity = 'opacity-0';
    }
    
    switch (props.type) {
        case AlertType.WARNING:
            return (
                <div className={opacity + " transition-opacity duration-500 ease-in mb-9 flex border-l-6 border-warning bg-warning bg-opacity-[15%] px-7 py-7 shadow-md dark:bg-warning dark:bg-opacity-10 md:px-9"}>
                    <div className="mr-5 flex h-9 w-9 items-center justify-center rounded-lg bg-warning bg-opacity-30">
                        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.50493 16H17.5023C18.6204 16 19.3413 14.9018 18.8354 13.9735L10.8367 0.770573C10.2852 -0.256858 8.70677 -0.256858 8.15528 0.770573L0.156617 13.9735C-0.334072 14.8998 0.386764 16 1.50493 16ZM10.7585 12.9298C10.7585 13.6155 10.2223 14.1433 9.45583 14.1433C8.6894 14.1433 8.15311 13.6155 8.15311 12.9298V12.9015C8.15311 12.2159 8.6894 11.688 9.45583 11.688C10.2223 11.688 10.7585 12.2159 10.7585 12.9015V12.9298ZM8.75236 4.01062H10.2548C10.6674 4.01062 10.9127 4.33826 10.8671 4.75288L10.2071 10.1186C10.1615 10.5049 9.88572 10.7455 9.50142 10.7455C9.11929 10.7455 8.84138 10.5028 8.79579 10.1186L8.13574 4.75288C8.09449 4.33826 8.33984 4.01062 8.75236 4.01062Z" fill="#db2777"></path></svg>
                    </div>
                    <div className="w-full">
                        <h5 className="text-lg font-semibold text-warning">{props.title}</h5>
                        {props.message ? <p className="mt-3 leading-relaxed text-warning">{props.message}</p> : <></>}
                    </div>
                </div>
            );
        case AlertType.FAILURE:
            return (
                <div className="mb-9 flex w-full border-l-6 border-warning bg-warning bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-warningdark dark:bg-opacity-30 md:p-9">
                    <div className="mr-5 flex h-9 w-9 items-center justify-center rounded-lg bg-warning bg-opacity-30">
                        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.50493 16H17.5023C18.6204 16 19.3413 14.9018 18.8354 13.9735L10.8367 0.770573C10.2852 -0.256858 8.70677 -0.256858 8.15528 0.770573L0.156617 13.9735C-0.334072 14.8998 0.386764 16 1.50493 16ZM10.7585 12.9298C10.7585 13.6155 10.2223 14.1433 9.45583 14.1433C8.6894 14.1433 8.15311 13.6155 8.15311 12.9298V12.9015C8.15311 12.2159 8.6894 11.688 9.45583 11.688C10.2223 11.688 10.7585 12.2159 10.7585 12.9015V12.9298ZM8.75236 4.01062H10.2548C10.6674 4.01062 10.9127 4.33826 10.8671 4.75288L10.2071 10.1186C10.1615 10.5049 9.88572 10.7455 9.50142 10.7455C9.11929 10.7455 8.84138 10.5028 8.79579 10.1186L8.13574 4.75288C8.09449 4.33826 8.33984 4.01062 8.75236 4.01062Z" fill="#db2777"></path></svg>
                    </div>
                    <div className="w-full">
                        <h5 className="text-lg font-semibold text-[#9D5425]">{props.title}</h5>
                        {props.message ? <p className="mt-3 leading-relaxed text-[#D0915C]">{props.message}</p> : <></>}
                    </div>
                </div>
            );
        case AlertType.SUCCESS:
            return (
                <div className="mb-9 flex w-full border-l-6 border-[#F87171] bg-[#F87171] bg-opacity-[15%] px-7 py-4 shadow-md dark:bg-warningdark dark:bg-opacity-30 md:p-9">
                    <div className="mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-lg bg-[#F87171]">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z" fill="#ffffff" stroke="#ffffff"></path></svg>
                    </div>
                    <div className="w-full">
                        <h5 className="font-semibold text-[#B45454]">{props.title}</h5>
                        {props.message ? <p className="mt-3 leading-relaxed text-[#CD5D5D]">{props.message}</p> : <></>}
                    </div>
                </div>
            );
    }
}
