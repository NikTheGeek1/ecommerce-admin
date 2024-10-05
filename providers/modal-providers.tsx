'use-client';

import { useEffect, useState } from 'react';

import { StoreModal } from '@/components/modals/store-modal';

export const ModalProvider = ({children}: {children: React.ReactNode}) => {
    /**
     * Is the component mounted?
     * This provider is going to be used in a layout.tsx, which is a server-side component.
     * The 'isMounted' state is used to prevent the modal from rendering on the server.
     */
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <StoreModal />
            {children}
        </>
    );

};