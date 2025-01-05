// app/layout.tsx
import "./globals.css";
import { createServerClient } from "@/app/lib/supabase/server";
import { Navbar } from "@/app/components/Navbar";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-poppins",
});

async function getUserProfile(userId: string) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from("profiles").select("username").eq("id", userId).single();

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
        <html lang="en" className={`${poppins.variable}`}>
            <head>
                <title>tastebud</title>
            </head>
            <body className="min-h-screen bg-background font-poppins antialiased">
                {session && <Navbar user={session.user} username={userProfile?.username} />}
                <main className="container mx-auto px-4 py-8 w-[800px]">{children}</main>
            </body>
        </html>
    );
}
