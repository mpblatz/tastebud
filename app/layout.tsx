import "@/styles/globals.css";
import { createServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Space_Mono, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Profile } from "@/types";

const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-space-mono",
});

const ibmPlexSans = IBM_Plex_Sans({
    weight: ["300", "400", "500", "600"],
    subsets: ["latin"],
    variable: "--font-ibm-plex-sans",
});

const jetbrainsMono = JetBrains_Mono({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
    title: "tastebud",
    description: "Your personal recipe collection",
    icons: {
        icon: "/mo-1.png",
        apple: "/apple-icon.png",
    },
};

async function getUserProfile(userId: string) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from("profiles").select("username").eq("id", userId).single<Profile>();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return data;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    let userProfile = null;
    if (session?.user) {
        userProfile = await getUserProfile(session.user.id);
    }

    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${spaceMono.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
        >
            <body className="min-h-screen bg-background font-body antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange={false}
                    storageKey="tastebud-theme"
                    forcedTheme={undefined}
                >
                    <div className="contents">
                        <main className="mx-auto max-w-[1100px] px-8 pt-8 pb-12 max-md:px-4 max-md:pt-6 max-md:pb-8">
                            <Navbar user={session?.user} username={userProfile?.username ?? "user"} />
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
