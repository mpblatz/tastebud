// app/layout.tsx
import "./globals.css";
import { createServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/app/components/Navbar";

import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-ibm-plex-mono",
});
export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return (
        <html lang="en" className={`${ibmPlexMono.variable}`}>
            <body className="min-h-screen bg-background font-ibm-plex-mono antialiased">
                {session && <Navbar user={session.user} />}
                <main className="container mx-auto px-4 py-8">{children}</main>
            </body>
        </html>
    );
}
