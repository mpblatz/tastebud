"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
    const supabase = createClientComponentClient<Database>();

    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error("Error logging in:", error);
            // Handle error appropriately (e.g., show user feedback)
        }
    };

    return (
        <Button onClick={handleLogin} className="">
            Login with Google
        </Button>
    );
}
