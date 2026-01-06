"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
    const supabase = createClient();

    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${location.origin}/callback`,
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
