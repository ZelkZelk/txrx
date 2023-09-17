import { PropsWithChildren, useEffect, useState } from 'react';
import Loading from './Loading';
import { ISplash } from '../../../types/backoffice.types';
import useColorMode from '../hooks/useColorMode';

export default function(props: ISplash) {
    useColorMode();
    const [splashing, setSplashing] = useState(true);
    const propsWithChildren = props as PropsWithChildren<ISplash>;

    useEffect(() => {
        setTimeout(() => {
            setSplashing(false);
        }, 500);
    }, [splashing]);

    return splashing ? (
        <Loading />
    ) : (
        <>{propsWithChildren.children}</>
    );
}
