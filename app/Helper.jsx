"use client";
import { SessionProvider } from "next-auth/react";

export default function ProviderHelper({ children }) {
    return (
        <SessionProvider>
            { children }
        </SessionProvider>
    )
}