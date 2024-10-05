'use client';
import { ReactNode } from "react";

import { ModalProvider } from "@/providers/modal-providers";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <ModalProvider>
            <ToastProvider />
            <ThemeProvider attribute="class" defaultTheme="white" enableSystem={true}>
                {children}
            </ThemeProvider>
        </ModalProvider>
    );
}