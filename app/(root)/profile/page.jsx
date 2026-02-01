"use client";
import { useSession, signOut } from "next-auth/react"

export default function UserProfile() {
    const { data: session } = useSession();

    return (
        <div>
            <h1>Hello world</h1>
            <p>
                {JSON.stringify(session)}
            </p>
            <br />
            <button className="p-4 bg-blue-400" onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign out</button>
        </div>
    )
}