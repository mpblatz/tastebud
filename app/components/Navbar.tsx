"use client"; // Add this at the top

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function Navbar({ user }: { user: User }) {
    const supabase = createClientComponentClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/auth/login";
    };

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/recipes" className="text-xl font-bold">
                    Recipe Vault
                </Link>

                <Button onClick={handleSignOut} variant="ghost">
                    Sign Out
                </Button>
            </div>
        </nav>
    );
}
